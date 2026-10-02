'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { markModelIntroDone } from '@/lib/intro'
import { focusFor, store, type Focus } from '@/lib/store'
import type { LayoutMode } from '@/lib/layout-mode'
import type { SectionId } from '@/lib/site'
import { AMBIENT_FPS, INTERACTION_MS, PORTRAIT, SIDES, VIEWS, ZONE } from './config'
import type { RenderControl } from './control'
import { damp, damp3, dampColor } from './damp'
import type { Anatomy as AnatomyData } from './geometry'
import { usePageLayout } from './layout'
import { createMaterials, disposeMaterials } from './materials'
import { placeNotes, type NoteRegistry } from './notes'
import { BONE, BONE_DIM, BONE_LIT, DISC, SILHOUETTE } from './palette'

/** Estado del store con la sección forzada a la de la zona (se reutiliza: no se crea un objeto por cuadro). */
const scratch = { ...store.get() }
const zoneFocus = (i: number): Focus => {
  const s = store.get()
  scratch.condition = s.condition
  scratch.service = s.service
  scratch.active = ZONE[i] as SectionId
  return focusFor(scratch)
}

/** Zonas del hueso que se iluminan por separado. */
const LIT_KEYS = ['C', 'T', 'L', 'pelvis', 'femur'] as const

/** Entrada: las vértebras se apilan de arriba hacia abajo (0.9 s cada una, escalonadas) y luego aparecen las costillas. */
const INTRO_END = 2.4
const FIXED_STEP = 1 / 60

type Props = {
  data: AnatomyData
  /** Escritorio y horizontal: modelo a un lado del texto. Vertical: modelo centrado detrás del texto. */
  mode: LayoutMode
  reduced: boolean
  notes: NoteRegistry
  control: RenderControl
}

/**
 * El modelo y su animación. El movimiento sigue siempre al scroll: el modelo se
 * queda quieto con cada sección centrada y pasa de una pose a la siguiente en
 * el tramo intermedio.
 *
 * Se dibuja a demanda: cuando nada cambia (todo llegó a su objetivo y no hay
 * animación continua) deja de pedir cuadros y la GPU descansa. Despierta con el
 * scroll, el puntero, un cambio de zona o un cambio de tamaño.
 */
export default function Anatomy({ data, mode, reduced, notes, control }: Props) {
  const { camera, size, invalidate } = useThree()
  const mats = useMemo(createMaterials, [])
  useEffect(() => () => disposeMaterials(mats), [mats])

  const root = useRef<THREE.Group>(null!)
  const spin = useRef<THREE.Group>(null!)
  const vertRefs = useRef<(THREE.Mesh | null)[]>([])
  const haloRefs = useRef<(THREE.Mesh | null)[]>([])
  const flowRefs = useRef<(THREE.Mesh | null)[]>([])

  const pointer = useRef({ x: 0, y: 0 })
  const start = useRef<number | null>(null)
  const introDone = useRef(false)
  const noteFocus = useRef<Focus | null>(null)
  /** Cuánto se apaga el modelo (0 encendido, 1 silueta) y si hay un texto por delante. */
  const fade = useRef({ k: 0, behind: false })
  /** Última acción del usuario, en ms del reloj de la página. */
  const lastInput = useRef({ scroll: 0, pointer: 0 })
  const ambientRaf = useRef(0)

  const tmp = useMemo(() => ({ v: new THREE.Vector3(), c: new THREE.Color() }), [])
  const corners = useMemo(() => {
    const { top, bottom } = data.bounds
    const pts: THREE.Vector3[] = []
    // Columna y pelvis (las costillas, casi transparentes, no cuentan como "tapar").
    for (const x of [-1.25, 1.25]) for (const y of [bottom, top]) for (const z of [-0.9, 0.9]) pts.push(new THREE.Vector3(x, y, z))
    return pts
  }, [data])

  const layout = usePageLayout(() => {
    lastInput.current.scroll = performance.now()
    invalidate()
  })

  // Despertar: todo lo que mueve al modelo pide un cuadro.
  useEffect(() => {
    const scrolled = () => {
      lastInput.current.scroll = performance.now()
      invalidate()
    }
    const moved = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
      if (reduced) return
      lastInput.current.pointer = performance.now()
      invalidate()
    }
    window.addEventListener('scroll', scrolled, { passive: true })
    window.addEventListener('pointermove', moved, { passive: true })
    const unsubscribe = store.subscribe(scrolled)
    scrolled()
    return () => {
      window.removeEventListener('scroll', scrolled)
      window.removeEventListener('pointermove', moved)
      unsubscribe()
      cancelAnimationFrame(ambientRaf.current)
    }
  }, [invalidate, reduced])

  const portrait = mode === 'portrait'

  useFrame((state, delta) => {
    cancelAnimationFrame(ambientRaf.current)
    ambientRaf.current = 0
    const now = performance.now()
    // Tras una pausa el modelo sigue donde estaba: no se integra el tiempo dormido.
    const dt = delta > 0.1 ? FIXED_STEP : delta
    const t = state.clock.elapsedTime
    if (start.current === null) start.current = t
    const since = t - start.current
    const intro = !reduced && since < INTRO_END
    if (!intro) markModelIntroDone()
    let moving = false
    let continuous = intro

    // Entrada: las vértebras se apilan de arriba hacia abajo y se alinean.
    if (!introDone.current) {
      let finished = true
      data.vertebrae.forEach((v, i) => {
        const m = vertRefs.current[i]
        if (!m) return
        const p = reduced ? 1 : THREE.MathUtils.clamp((since - i * 0.045) / 0.9, 0, 1)
        if (p < 1) finished = false
        const e = 1 - Math.pow(1 - p, 3)
        m.position.set(0, v.y + (1 - e) * 0.9, v.z + (1 - e) * 0.25)
        const sc = 0.4 + 0.6 * e
        m.scale.set(v.scale[0] * sc, v.scale[1] * sc, v.scale[2] * sc)
      })
      introDone.current = finished
    }

    // Posición continua del scroll dentro de la zona: 0 = Hero … 3 = Servicios.
    // La línea de lectura es el centro de la pantalla.
    const L = layout.current
    const sy = window.scrollY
    const vh = window.innerHeight
    const vc = sy + vh / 2
    const centers = L?.centers ?? []
    let f = 0
    if (centers.length === ZONE.length) {
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
    const dist = mix(A.dist, B.dist) * (portrait ? PORTRAIT.dist : 1)
    const visibleH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(fov / 2))
    const visibleW = visibleH * (size.width / size.height)
    const offsetX = portrait ? 0 : mix(SIDES[i0], SIDES[i0 + 1]) * visibleW * 0.23
    const camY = mix(A.y, B.y) - (portrait ? visibleH * PORTRAIT.lift : 0)
    const k = reduced ? 0.0001 : 0.16
    // La cámara y el lado de la pantalla solo cambian entre poses: si se mueven, el modelo está "viajando".
    const shifted = damp(root.current.position, 'x', offsetX, k, dt)
    const dollied = damp3(camera.position, 0, camY, dist, k, dt)
    const travelling = shifted || dollied
    moving ||= travelling
    camera.lookAt(0, camera.position.y, 0)
    camera.updateMatrixWorld()

    // Rotación: pose de la zona, oscilación lenta en el hero y leve paralaje del mouse.
    const heroW = i0 === 0 ? 1 - e : 0
    const sway = reduced ? 0 : Math.sin(t * 0.22) * 0.5 * heroW
    if (!reduced && heroW > 0) continuous = true
    const px = reduced ? 0 : pointer.current.x * 0.14
    const py = reduced ? 0 : pointer.current.y * 0.05
    moving = damp(spin.current.rotation, 'y', mix(A.rotY, B.rotY) + sway + px, reduced ? 0.0001 : 0.22, dt) || moving
    moving = damp(spin.current.rotation, 'x', py, 0.3, dt) || moving

    // Iluminación de zonas: el naranja marca dónde actuamos.
    // Si el modelo cruza por detrás de un texto, se apaga a una silueta azul
    // tenue para que el texto quede nítido; al llegar, se enciende.
    moving = damp(fade.current, 'k', fade.current.behind ? 1 : 0, reduced ? 0.0001 : 0.25, dt) || moving
    const off = fade.current.k
    const dim = mix(A.dimRest ? 1 : 0, B.dimRest ? 1 : 0)
    for (const key of LIT_KEYS) {
      const lit = mix(A.lit[key] ?? 0, B.lit[key] ?? 0)
      const m = mats[key]
      moving = damp(m, 'emissiveIntensity', lit * 0.55 * (1 - off), 0.2, dt) || moving
      tmp.c.copy(BONE).lerp(BONE_DIM, dim).lerp(BONE_LIT, Math.min(1, lit * 1.4)).lerp(SILHOUETTE, off * 0.85)
      moving = dampColor(m.color, tmp.c, 0.2, dt) || moving
      // Silueta: sin reflejos de estudio y semitransparente mientras cruza.
      m.envMapIntensity = 1 - off * 0.9
      m.opacity = 1 - off * 0.62
    }
    const ribsIn = reduced ? 1 : THREE.MathUtils.clamp((since - 1.2) / 1.2, 0, 1)
    moving = damp(mats.ribs, 'opacity', mix(A.ribs, B.ribs) * ribsIn * (1 - off * 0.7), 0.2, dt) || moving
    tmp.c.copy(DISC).lerp(SILHOUETTE, off * 0.85)
    moving = dampColor(mats.disc.color, tmp.c, 0.2, dt) || moving
    mats.ribs.visible = mats.ribs.opacity > 0.01
    mats.cartilage.opacity = mats.ribs.opacity * 0.8
    mats.cartilage.visible = mats.ribs.visible
    const chain = mix(A.chain ?? 0, B.chain ?? 0)
    const joints = mix(A.joints ?? 0, B.joints ?? 0)
    moving = damp(mats.chain, 'opacity', chain * 0.9 * (1 - off * 0.8), 0.2, dt) || moving
    moving = damp(mats.flow, 'opacity', chain * (1 - off * 0.8), 0.2, dt) || moving
    moving = damp(mats.joint, 'opacity', joints * (1 - off * 0.8), 0.2, dt) || moving
    moving = damp(mats.plumb, 'opacity', mix(A.plumb ?? 0, B.plumb ?? 0) * 0.55, 0.2, dt) || moving

    // Pulso en articulaciones y flujo sobre la cadena posterior.
    const pulse = reduced ? 0.5 : (t * 0.6) % 1
    mats.halo.opacity = mats.joint.opacity * (1 - pulse) * 0.55
    // Lo que no se ve (opacidad 0) no se dibuja: ni en el cuadro ni en las pasadas de oclusión.
    mats.chain.visible = mats.chain.opacity > 0
    mats.flow.visible = mats.flow.opacity > 0
    mats.joint.visible = mats.joint.opacity > 0
    mats.halo.visible = mats.halo.opacity > 0
    mats.plumb.visible = mats.plumb.opacity > 0
    if (mats.halo.visible) haloRefs.current.forEach((h) => h?.scale.setScalar(1 + pulse * 1.6))
    if (mats.flow.visible) {
      flowRefs.current.forEach((fl, i) => {
        if (!fl) return
        const curve = data.chain[i % 2]
        const u = reduced ? ((Math.floor(i / 2) + 0.5) / 5) % 1 : (t * 0.08 + Math.floor(i / 2) / 5) % 1
        fl.position.copy(curve.getPointAt(u))
      })
    }
    if (!reduced && (mats.joint.visible || mats.flow.visible)) continuous = true

    // Anotaciones: solo con el modelo en reposo, para que no crucen la pantalla.
    const nf = e < 0.06 ? fa : e > 0.94 ? fb : null
    if (nf !== noteFocus.current) {
      noteFocus.current = nf
      notes.setFocus(nf)
    }
    placeNotes(notes, data.anchors, spin.current, camera as THREE.PerspectiveCamera, size.width, size.height, fa, fb, now)

    // ¿Hay un texto delante del modelo? Todo con posiciones ya medidas: sin leer el layout.
    // (En vertical el texto siempre sube sobre el modelo, con su propio velo: no se apaga.)
    let behind = false
    if (!portrait && L) {
      // El lienzo queda pegado arriba durante la zona y sube con ella al terminar.
      const canvasTop = Math.min(0, L.zoneTop + L.zoneHeight - sy - vh)
      let x0 = Infinity
      let x1 = -Infinity
      let y0 = Infinity
      let y1 = -Infinity
      spin.current.updateWorldMatrix(true, false)
      for (const p of corners) {
        tmp.v.copy(p).applyMatrix4(spin.current.matrixWorld).project(camera)
        const px2 = ((tmp.v.x + 1) / 2) * size.width
        const py2 = canvasTop + ((1 - tmp.v.y) / 2) * size.height
        x0 = Math.min(x0, px2)
        x1 = Math.max(x1, px2)
        y0 = Math.min(y0, py2)
        y1 = Math.max(y1, py2)
      }
      const pad = (x1 - x0) * 0.1
      x0 += pad
      x1 -= pad
      for (const r of L.texts) {
        const rt = r.t - sy
        const rb = r.b - sy
        if (rb < 0 || rt > vh) continue
        if (r.r > x0 && r.l < x1 && rb > y0 && rt < y1) {
          behind = true
          break
        }
      }
    }
    fade.current.behind = behind

    // ¿Seguir dibujando? Solo si algo se mueve o hay una animación continua.
    //  - Con el usuario actuando (o en la entrada): a ritmo completo mientras haya movimiento.
    //  - En reposo con animación ambiente (oscilación del hero, pulsos): 30 cuadros por segundo.
    //  - En reposo sin animación: a ritmo completo hasta llegar al objetivo y después, nada.
    const input = Math.max(lastInput.current.scroll, lastInput.current.pointer)
    const interacting = intro || now - input < INTERACTION_MS
    control.busy = intro || travelling || (raw > 0 && raw < 1)
    const full = interacting ? moving || continuous : !continuous && moving
    control.fullRate = full
    if (full) {
      invalidate()
    } else if (continuous) {
      const due = now + 1000 / AMBIENT_FPS - 2
      const tick = (ts: number) => {
        if (ts >= due) {
          ambientRaf.current = 0
          invalidate()
        } else ambientRaf.current = requestAnimationFrame(tick)
      }
      ambientRaf.current = requestAnimationFrame(tick)
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
        <mesh geometry={data.sacrum.geometry} material={mats.pelvis} matrixAutoUpdate={false} matrix={data.sacrum.matrix} />
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
      </group>
    </group>
  )
}
