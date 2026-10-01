'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Html, Lightformer } from '@react-three/drei'
import { EffectComposer, N8AO, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { easing } from 'maath'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { buildAnatomy, type Region } from './geometry'
import { focusFor, store, type Focus } from '@/lib/store'
import type { SectionId } from '@/lib/site'

const ORANGE = new THREE.Color('#f28c38')
// Hueso marfil, levemente frío: realista pero limpio.
const BONE = new THREE.Color('#ece7de')
const BONE_LIT = new THREE.Color('#ffdcbd')
const BONE_DIM = new THREE.Color('#b4bcc4')

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

/** Secciones de la zona anatómica y el lado de la pantalla donde va el modelo (1 derecha, -1 izquierda). */
const ZONE: SectionId[] = ['inicio', 'kinesiologia', 'abordaje', 'servicios']
const SIDES = [1, -1, 1, -1]
const zoneFocus = (i: number): Focus => focusFor({ ...store.get(), active: ZONE[i] })

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
  return new THREE.MeshPhysicalMaterial({
    color: BONE.clone(),
    roughness: 0.48,
    metalness: 0,
    sheen: 0.4,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color('#cfe1f0'),
    clearcoat: 0.08,
    clearcoatRoughness: 0.6,
    emissive: ORANGE.clone(),
    emissiveIntensity: 0,
  })
}

function Anatomy({ reduced }: { reduced: boolean }) {
  const data = useMemo(() => buildAnatomy(), [])
  const { camera, size, gl } = useThree()

  const mats = useMemo(
    () => ({
      C: boneMaterial(),
      T: boneMaterial(),
      L: boneMaterial(),
      pelvis: boneMaterial(),
      femur: boneMaterial(),
      disc: new THREE.MeshPhysicalMaterial({
        color: '#9fc3db',
        roughness: 0.28,
        clearcoat: 0.5,
        clearcoatRoughness: 0.3,
        transparent: true,
        opacity: 0.9,
      }),
      ribs: new THREE.MeshPhysicalMaterial({
        color: '#ece7de',
        roughness: 0.45,
        sheen: 0.3,
        sheenColor: new THREE.Color('#cfe1f0'),
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
      cartilage: new THREE.MeshPhysicalMaterial({
        color: '#b9d5e8',
        roughness: 0.3,
        clearcoat: 0.4,
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
  const start = useRef<number | null>(null)
  const tmp = useMemo(() => ({ v: new THREE.Vector3(), c: new THREE.Color() }), [])
  const corners = useMemo(() => {
    const { top, bottom } = data.bounds
    const pts: THREE.Vector3[] = []
    for (const x of [-1.5, 1.5]) for (const y of [bottom, top]) for (const z of [-1, 1]) pts.push(new THREE.Vector3(x, y, z))
    return pts
  }, [data])
  // Anotaciones: se montan un cuadro después del modelo (evita una carrera al
  // montar el primer <Html>) y solo se muestran con el modelo quieto.
  const [notesReady, setNotesReady] = useState(false)
  const [noteFocus, setNoteFocus] = useState<Focus | null>(null)
  const noteRef = useRef<Focus | null>(null)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.querySelectorAll<HTMLElement>('[data-shield]').forEach((el) => delete el.dataset.over)
    }
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

    // Entrada: las vértebras se apilan de arriba hacia abajo y se alinean.
    data.vertebrae.forEach((v, i) => {
      const m = vertRefs.current[i]
      if (!m) return
      const p = reduced ? 1 : THREE.MathUtils.clamp((since - i * 0.045) / 0.9, 0, 1)
      const e = 1 - Math.pow(1 - p, 3)
      m.position.set(0, v.y + (1 - e) * 0.9, v.z + (1 - e) * 0.25)
      m.scale.setScalar(0.4 + 0.6 * e)
    })

    // Posición continua del scroll dentro de la zona: 0 = Hero … 3 = Servicios.
    // El modelo se queda quieto con cada sección centrada y pasa de una pose a
    // la siguiente en el tramo intermedio, siempre atado al scroll.
    const vc = window.innerHeight / 2
    // Se buscan en cada cuadro: React puede reemplazar los nodos al hidratar.
    const centers = ZONE.map((id) => {
      const r = document.getElementById(id)?.getBoundingClientRect()
      return r ? r.top + r.height / 2 : NaN
    })
    let f = 0
    if (centers.every((c) => !Number.isNaN(c))) {
      const last = ZONE.length - 1
      if (vc >= centers[last]) f = last
      else
        for (let i = 0; i < last; i++)
          if (vc >= centers[i] && vc < centers[i + 1]) {
            f = i + (vc - centers[i]) / (centers[i + 1] - centers[i])
            break
          }
    }
    const i0 = Math.min(Math.floor(f), ZONE.length - 2)
    const raw = THREE.MathUtils.clamp((f - i0 - 0.3) / 0.4, 0, 1)
    const e = reduced ? Math.round(raw) : raw * raw * (3 - 2 * raw)
    const fa = zoneFocus(i0)
    const fb = zoneFocus(i0 + 1)
    const A = VIEWS[fa]
    const B = VIEWS[fb]
    const mix = (a: number, b: number) => a + (b - a) * e

    // Cámara y lado de la pantalla.
    const fov = (camera as THREE.PerspectiveCamera).fov
    const dist = mix(A.dist, B.dist) * (mobile ? 1.42 : 1)
    const visibleH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(fov / 2))
    const visibleW = visibleH * (size.width / size.height)
    const offsetX = mobile ? 0 : mix(SIDES[i0], SIDES[i0 + 1]) * visibleW * 0.23
    const camY = mix(A.y, B.y) - (mobile ? visibleH * 0.15 : 0)
    const k = reduced ? 0.0001 : 0.16
    easing.damp(root.current.position, 'x', offsetX, k, dt)
    easing.damp3(camera.position, [0, camY, dist], k, dt)
    camera.lookAt(0, camera.position.y, 0)

    // Rotación: pose de la zona, oscilación lenta en el hero y leve paralaje del mouse.
    const heroW = i0 === 0 ? 1 - e : 0
    const sway = reduced ? 0 : Math.sin(t * 0.22) * 0.5 * heroW
    const px = reduced ? 0 : pointer.current.x * 0.14
    const py = reduced ? 0 : pointer.current.y * 0.05
    easing.damp(spin.current.rotation, 'y', mix(A.rotY, B.rotY) + sway + px, reduced ? 0.0001 : 0.22, dt)
    easing.damp(spin.current.rotation, 'x', py, 0.3, dt)

    // Iluminación de zonas: el naranja marca dónde actuamos.
    const dim = mix(A.dimRest ? 1 : 0, B.dimRest ? 1 : 0)
    ;(['C', 'T', 'L', 'pelvis', 'femur'] as const).forEach((key) => {
      const lit = mix(A.lit[key] ?? 0, B.lit[key] ?? 0)
      const m = mats[key]
      easing.damp(m, 'emissiveIntensity', lit * 0.85, 0.2, dt)
      tmp.c.copy(BONE).lerp(BONE_DIM, dim).lerp(BONE_LIT, Math.min(1, lit * 1.4))
      easing.dampC(m.color, tmp.c, 0.2, dt)
    })
    const ribsIn = reduced ? 1 : THREE.MathUtils.clamp((since - 1.2) / 1.2, 0, 1)
    easing.damp(mats.ribs, 'opacity', mix(A.ribs, B.ribs) * ribsIn, 0.2, dt)
    mats.ribs.visible = mats.ribs.opacity > 0.01
    mats.cartilage.opacity = mats.ribs.opacity * 0.8
    mats.cartilage.visible = mats.ribs.visible
    const chain = mix(A.chain ?? 0, B.chain ?? 0)
    const joints = mix(A.joints ?? 0, B.joints ?? 0)
    easing.damp(mats.chain, 'opacity', chain * 0.9, 0.2, dt)
    easing.damp(mats.flow, 'opacity', chain, 0.2, dt)
    easing.damp(mats.joint, 'opacity', joints, 0.2, dt)
    easing.damp(mats.plumb, 'opacity', mix(A.plumb ?? 0, B.plumb ?? 0) * 0.55, 0.2, dt)

    // Pulso en articulaciones y flujo sobre la cadena posterior.
    const pulse = reduced ? 0.5 : (t * 0.6) % 1
    haloRefs.current.forEach((h) => h?.scale.setScalar(1 + pulse * 1.6))
    mats.halo.opacity = mats.joint.opacity * (1 - pulse) * 0.55
    flowRefs.current.forEach((fl, i) => {
      if (!fl) return
      const curve = data.chain[i % 2]
      const u = reduced ? ((Math.floor(i / 2) + 0.5) / 5) % 1 : (t * 0.08 + Math.floor(i / 2) / 5) % 1
      fl.position.copy(curve.getPointAt(u))
    })

    // Anotaciones: solo con el modelo en reposo, para que no crucen la pantalla.
    const nf = e < 0.06 ? fa : e > 0.94 ? fb : null
    if (nf !== noteRef.current) {
      noteRef.current = nf
      setNoteFocus(nf)
    }

    // Títulos y textos: si el modelo pasa por detrás, su fondo se desenfoca.
    let x0 = Infinity
    let x1 = -Infinity
    let y0 = Infinity
    let y1 = -Infinity
    if (!mobile) {
      spin.current.updateWorldMatrix(true, false)
      const cr = gl.domElement.getBoundingClientRect()
      for (const p of corners) {
        tmp.v.copy(p).applyMatrix4(spin.current.matrixWorld).project(camera)
        const sx = cr.left + ((tmp.v.x + 1) / 2) * cr.width
        const sy = cr.top + ((1 - tmp.v.y) / 2) * cr.height
        x0 = Math.min(x0, sx)
        x1 = Math.max(x1, sx)
        y0 = Math.min(y0, sy)
        y1 = Math.max(y1, sy)
      }
      const pad = (x1 - x0) * 0.14
      x0 += pad
      x1 -= pad
    }
    for (const el of document.querySelectorAll<HTMLElement>('[data-shield]')) {
      const r = el.getBoundingClientRect()
      const over = !mobile && r.right > x0 && r.left < x1 && r.bottom > y0 && r.top < y1
      if ((el.dataset.over === 'true') !== over) el.dataset.over = String(over)
    }
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
        <mesh geometry={data.cartilage} material={mats.cartilage} renderOrder={2} />
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
        {notesReady && <Notes anchors={data.anchors} focus={noteFocus} reduced={reduced} />}
      </group>
    </group>
  )
}

function Notes({
  anchors,
  focus,
  reduced,
}: {
  anchors: Record<string, THREE.Vector3>
  focus: Focus | null
  reduced: boolean
}) {
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
  // Oclusión ambiental solo en pantallas grandes: en celulares prioriza fluidez.
  const [ao, setAo] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setAo(mq.matches)
    const on = () => setAo(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={running ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.AgXToneMapping
        gl.toneMappingExposure = 1.25
      }}
      camera={{ fov: 32, position: [0, -0.95, 17], near: 0.1, far: 80 }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Estudio: luces de caja suaves generadas en el momento (sin descargar mapas HDR). */}
      <Environment resolution={256} environmentIntensity={0.75}>
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 6, 6]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={2} color="#8fc2ff" position={[-8, 1, -4]} rotation-y={Math.PI / 2} scale={[8, 10, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffd2ad" position={[8, -2, -2]} rotation-y={-Math.PI / 2} scale={[6, 8, 1]} />
        <Lightformer form="circle" intensity={1.5} color="#ffffff" position={[0, -6, 4]} scale={4} />
      </Environment>
      <hemisphereLight args={['#d6e8f7', '#002337', 0.35]} />
      <directionalLight position={[4, 6, 9]} intensity={1.6} />
      <directionalLight position={[-7, 3, -8]} intensity={2.2} color="#6fb3ff" />
      <directionalLight position={[6, -4, -6]} intensity={0.6} color="#f2b27a" />
      <Anatomy reduced={reduced} />
      {ao && (
        <EffectComposer multisampling={4}>
          <N8AO aoRadius={0.3} distanceFalloff={0.6} intensity={1.5} halfRes quality="performance" />
          <ToneMapping mode={ToneMappingMode.AGX} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
