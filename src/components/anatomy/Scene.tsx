'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { easing } from 'maath'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { buildAnatomy, type Region } from './geometry'
import { focusFor, sideFor, useStore, type Focus } from '@/lib/store'

const ORANGE = new THREE.Color('#f28c38')
const BONE = new THREE.Color('#e4ebf1')
const BONE_LIT = new THREE.Color('#ffe3cc')
const BONE_DIM = new THREE.Color('#b9c7d3')

type View = {
  /** Rotación del modelo sobre su eje vertical. */
  rotY: number
  /** Altura (en unidades del modelo) hacia donde mira la cámara. */
  y: number
  /** Distancia de la cámara. */
  dist: number
  /** Opacidad de las costillas: la capa externa se retira para revelar la columna. */
  ribs: number
  lit: Partial<Record<Region | 'pelvis' | 'femur', number>>
  chain?: number
  joints?: number
  plumb?: number
  dimRest?: boolean
}

const VIEWS: Record<Focus, View> = {
  hero: { rotY: 0, y: -0.95, dist: 17, ribs: 0.42, lit: {} },
  full: { rotY: -0.7, y: -0.95, dist: 16.5, ribs: 0.14, lit: { C: 0.45, T: 0.45, L: 0.45, pelvis: 0.45, femur: 0.45 } },
  cervlum: { rotY: 0.35, y: 0.15, dist: 12.5, ribs: 0.08, lit: { C: 1, L: 1 }, dimRest: true },
  joints: { rotY: 0.5, y: -3.0, dist: 10.6, ribs: 0.04, lit: { pelvis: 0.55, femur: 0.55 }, joints: 1, dimRest: true },
  posture: { rotY: -Math.PI / 2, y: -0.8, dist: 15.5, ribs: 0.06, lit: { C: 0.8, T: 0.8, L: 0.8 }, plumb: 1 },
  rpg: { rotY: Math.PI * 0.9, y: -0.95, dist: 16.5, ribs: 0.1, lit: {}, chain: 1 },
  osteo: { rotY: -0.45, y: -2.9, dist: 10.4, ribs: 0.04, lit: { pelvis: 1 }, joints: 1, dimRest: true },
}

type Note = { anchor: string; lines: string[]; dir: 'left' | 'right'; focus: Focus; delay?: number }

const NOTES: Note[] = [
  { focus: 'hero', anchor: 'c7Left', lines: ['Cervical · C7'], dir: 'left', delay: 1.6 },
  { focus: 'hero', anchor: 'l45Right', lines: ['L4 · L5'], dir: 'right', delay: 2.1 },
  { focus: 'hero', anchor: 'siLeft', lines: ['Articulación', 'sacroilíaca'], dir: 'left', delay: 2.6 },
  { focus: 'full', anchor: 't6Right', lines: ['Abordaje', 'global'], dir: 'right' },
  { focus: 'cervlum', anchor: 'c3Left', lines: ['Cervical'], dir: 'left' },
  { focus: 'cervlum', anchor: 'l3Right', lines: ['Lumbar'], dir: 'right' },
  { focus: 'joints', anchor: 'siRight', lines: ['Sacroilíaca'], dir: 'right' },
  { focus: 'joints', anchor: 'hipLeft', lines: ['Cadera'], dir: 'left' },
  { focus: 'posture', anchor: 't6Back', lines: ['Eje', 'postural'], dir: 'right' },
  { focus: 'rpg', anchor: 'chainLeft', lines: ['Cadena', 'posterior'], dir: 'right' },
  { focus: 'osteo', anchor: 'siRight', lines: ['Articulación', 'sacroilíaca'], dir: 'right' },
  { focus: 'osteo', anchor: 'hipLeft', lines: ['Cadera'], dir: 'left' },
]

function boneMaterial() {
  return new THREE.MeshStandardMaterial({
    color: BONE.clone(),
    roughness: 0.62,
    metalness: 0.05,
    emissive: ORANGE.clone(),
    emissiveIntensity: 0,
  })
}

function Anatomy({ reduced }: { reduced: boolean }) {
  const data = useMemo(() => buildAnatomy(), [])
  const focus = useStore(focusFor)
  const active = useStore((s) => s.active)
  const { camera, size } = useThree()

  const mats = useMemo(
    () => ({
      C: boneMaterial(),
      T: boneMaterial(),
      L: boneMaterial(),
      pelvis: boneMaterial(),
      femur: boneMaterial(),
      disc: new THREE.MeshStandardMaterial({ color: '#8fb4cf', roughness: 0.4, transparent: true, opacity: 0.75 }),
      ribs: new THREE.MeshStandardMaterial({
        color: '#dfe9f2',
        roughness: 0.5,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
      chain: new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: 0, depthWrite: false }),
      joint: new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: 0, depthWrite: false }),
      halo: new THREE.MeshBasicMaterial({
        color: ORANGE,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
      plumb: new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false }),
      flow: new THREE.MeshBasicMaterial({ color: '#ffd2ad', transparent: true, opacity: 0, depthWrite: false }),
    }),
    [],
  )

  const root = useRef<THREE.Group>(null!)
  const spin = useRef<THREE.Group>(null!)
  const vertRefs = useRef<(THREE.Mesh | null)[]>([])
  const haloRefs = useRef<(THREE.Mesh | null)[]>([])
  const flowRefs = useRef<(THREE.Mesh | null)[]>([])
  const pointer = useRef({ x: 0, y: 0 })
  const target = useRef(new THREE.Vector3())
  const start = useRef<number | null>(null)
  // Las anotaciones se montan un cuadro después del modelo (evita una carrera al montar el primer <Html>).
  const [notesReady, setNotesReady] = useState(false)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose())
    },
    [mats],
  )

  const mobile = size.width < 1024

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const t = state.clock.elapsedTime
    if (start.current === null) start.current = t
    if (!notesReady) setNotesReady(true)
    const since = t - start.current
    const view = VIEWS[focus]
    const smooth = reduced ? 0.0001 : 0.55

    // Entrada: las vértebras se apilan de arriba hacia abajo y se alinean.
    data.vertebrae.forEach((v, i) => {
      const m = vertRefs.current[i]
      if (!m) return
      const p = reduced ? 1 : THREE.MathUtils.clamp((since - i * 0.045) / 0.9, 0, 1)
      const e = 1 - Math.pow(1 - p, 3)
      m.position.set(0, v.y + (1 - e) * 0.9, v.z + (1 - e) * 0.25)
      m.scale.setScalar(0.4 + 0.6 * e)
    })

    // Cámara: distancia y altura según la zona; el modelo se ubica a un lado del texto.
    const fov = (camera as THREE.PerspectiveCamera).fov
    const dist = view.dist * (mobile ? 1.3 : 1)
    const visibleH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(fov / 2))
    const visibleW = visibleH * (size.width / size.height)
    const offsetX = mobile ? 0 : sideFor(active) * visibleW * 0.23
    const camY = view.y - (mobile ? visibleH * 0.2 : 0)
    easing.damp3(target.current, [offsetX, 0, 0], smooth, dt)
    easing.damp3(camera.position, [0, camY, dist], smooth, dt)
    root.current.position.x = target.current.x
    camera.lookAt(0, camY, 0)

    // Rotación: posición de la zona, oscilación lenta en el hero y leve paralaje del mouse.
    const sway = focus === 'hero' && !reduced ? Math.sin(t * 0.22) * 0.5 : 0
    const px = reduced ? 0 : pointer.current.x * 0.14
    const py = reduced ? 0 : pointer.current.y * 0.05
    easing.damp(spin.current.rotation, 'y', view.rotY + sway + px, smooth * 1.4, dt)
    easing.damp(spin.current.rotation, 'x', py, smooth, dt)

    // Iluminación de zonas: el naranja marca dónde actuamos.
    ;(['C', 'T', 'L', 'pelvis', 'femur'] as const).forEach((k) => {
      const lit = view.lit[k] ?? 0
      const m = mats[k]
      easing.damp(m, 'emissiveIntensity', lit * 0.85, 0.35, dt)
      easing.dampC(m.color, lit > 0 ? BONE_LIT : view.dimRest ? BONE_DIM : BONE, 0.35, dt)
    })
    const ribsIn = reduced ? 1 : THREE.MathUtils.clamp((since - 1.2) / 1.2, 0, 1)
    easing.damp(mats.ribs, 'opacity', view.ribs * ribsIn, 0.4, dt)
    mats.ribs.visible = mats.ribs.opacity > 0.01
    easing.damp(mats.chain, 'opacity', (view.chain ?? 0) * 0.9, 0.35, dt)
    easing.damp(mats.joint, 'opacity', view.joints ?? 0, 0.35, dt)
    easing.damp(mats.plumb, 'opacity', (view.plumb ?? 0) * 0.55, 0.35, dt)
    easing.damp(mats.flow, 'opacity', view.chain ?? 0, 0.35, dt)

    // Pulso en articulaciones y flujo sobre la cadena posterior.
    const pulse = reduced ? 0.5 : (t * 0.6) % 1
    haloRefs.current.forEach((h) => {
      if (!h) return
      h.scale.setScalar(1 + pulse * 1.6)
    })
    mats.halo.opacity = (view.joints ?? 0) * (1 - pulse) * 0.55
    flowRefs.current.forEach((f, i) => {
      if (!f) return
      const curve = data.chain[i % 2]
      const u = reduced ? ((Math.floor(i / 2) + 0.5) / 5) % 1 : (t * 0.08 + Math.floor(i / 2) / 5) % 1
      f.position.copy(curve.getPointAt(u))
    })
  })

  return (
    <group ref={root}>
      <group ref={spin}>
        {data.vertebrae.map((v, i) => (
          <mesh
            key={i}
            ref={(m) => {
              vertRefs.current[i] = m
            }}
            geometry={v.geometry}
            material={mats[v.region]}
            position={[0, v.y, v.z]}
          />
        ))}
        <mesh geometry={data.discs} material={mats.disc} />
        <mesh geometry={data.ribs} material={mats.ribs} renderOrder={2} />
        <mesh
          geometry={data.sacrum.geometry}
          material={mats.pelvis}
          matrixAutoUpdate={false}
          matrix={data.sacrum.matrix}
        />
        {data.wings.map((w, i) => (
          <mesh key={i} geometry={w.geometry} material={mats.pelvis} matrixAutoUpdate={false} matrix={w.matrix} />
        ))}
        <mesh geometry={data.femurs} material={mats.femur} />
        <mesh geometry={data.chainGeometry} material={mats.chain} renderOrder={3} />
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh
            key={i}
            ref={(m) => {
              flowRefs.current[i] = m
            }}
            material={mats.flow}
            renderOrder={4}
          >
            <sphereGeometry args={[0.055, 12, 8]} />
          </mesh>
        ))}
        {data.joints.map((p, i) => (
          <group key={i} position={p}>
            <mesh material={mats.joint} renderOrder={4}>
              <sphereGeometry args={[0.09, 16, 12]} />
            </mesh>
            <mesh
              ref={(m) => {
                haloRefs.current[i] = m
              }}
              material={mats.halo}
              renderOrder={4}
            >
              <sphereGeometry args={[0.12, 16, 12]} />
            </mesh>
          </group>
        ))}
        <mesh material={mats.plumb} position={[0, -1.3, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 9, 6]} />
        </mesh>
        {notesReady && <Notes anchors={data.anchors} focus={focus} reduced={reduced} />}
      </group>
    </group>
  )
}

function Notes({ anchors, focus, reduced }: { anchors: Record<string, THREE.Vector3>; focus: Focus; reduced: boolean }) {
  return (
    <>
      {NOTES.map((n, i) => (
        <Html
          key={i}
          position={anchors[n.anchor]}
          zIndexRange={[20, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            className={`anat-note anat-note--${n.dir}`}
            data-on={n.focus === focus}
            style={{ transitionDelay: n.focus === focus && n.delay && !reduced ? `${n.delay}s` : '0s' }}
          >
            <span className="anat-note__dot" />
            <span className="anat-note__line" />
            <span className="anat-note__label">
              {n.lines.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </span>
          </div>
        </Html>
      ))}
    </>
  )
}

export default function Scene({ running, reduced }: { running: boolean; reduced: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={running ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 32, position: [0, -0.95, 17], near: 0.1, far: 80 }}
      style={{ width: '100%', height: '100%' }}
    >
      <hemisphereLight args={['#d6e8f7', '#002337', 0.9]} />
      <ambientLight intensity={0.25} color="#a9c4da" />
      <directionalLight position={[4, 6, 9]} intensity={1.7} />
      <directionalLight position={[-7, 3, -8]} intensity={2.4} color="#6fb3ff" />
      <directionalLight position={[6, -4, -6]} intensity={0.9} color="#f2b27a" />
      <Anatomy reduced={reduced} />
    </Canvas>
  )
}
