'use client'

import { useEffect, useState } from 'react'
import * as THREE from 'three'
import type { Focus } from '@/lib/store'
import type { LayoutMode } from '@/lib/layout-mode'
import { NOTES } from './config'

/**
 * Anotaciones anatómicas: punto naranja, línea guía y etiqueta pegados a un
 * punto del modelo. Es una sola capa DOM sobre el lienzo; la escena mueve cada
 * etiqueta con `transform` (sin leer layout) usando la misma proyección que
 * `<Html>` de drei: posición en pantalla del ancla, `z-index` por distancia a
 * la cámara y oculta si queda detrás de ella.
 */

/** Estado compartido entre la capa DOM (React) y el bucle de la escena. */
export type NoteRegistry = {
  els: (HTMLDivElement | null)[]
  /** Hasta cuándo (ms, reloj de la página) hay que seguir moviendo cada etiqueta. */
  until: number[]
  /** Última posición escrita, para no tocar el DOM si no cambió. */
  last: [number, number][]
  /** La pose estable que debe anotarse (null mientras el modelo viaja entre dos); la fija la capa DOM. */
  setFocus: (f: Focus | null, side: number) => void
}

export function createNoteRegistry(): NoteRegistry {
  return {
    els: NOTES.map(() => null),
    until: NOTES.map(() => 0),
    last: NOTES.map(() => [NaN, NaN]),
    setFocus: () => {},
  }
}

/** Cuánto sigue acompañando al modelo una etiqueta que se está apagando (su transición dura 0.6 s). */
const FOLLOW_MS = 800
/** Cambio mínimo (px) que justifica reescribir la posición. */
const EPS = 0.001

const pos = new THREE.Vector3()
const delta = new THREE.Vector3()
const camPos = new THREE.Vector3()
const camDir = new THREE.Vector3()

/**
 * Coloca las etiquetas de las poses `fa` y `fb` (entre las que viaja el modelo)
 * y las que aún se están apagando. `anchors` están en el espacio del grupo `spin`.
 */
export function placeNotes(
  reg: NoteRegistry,
  anchors: Record<string, THREE.Vector3>,
  spin: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number,
  fa: Focus,
  fb: Focus,
  now: number,
) {
  camera.updateMatrixWorld()
  spin.updateWorldMatrix(true, false)
  camPos.setFromMatrixPosition(camera.matrixWorld)
  camera.getWorldDirection(camDir)
  const A = -20 / (camera.far - camera.near) // z-index: de 20 (cerca) a 0 (lejos)
  const B = 0 - A * camera.far
  for (let i = 0; i < NOTES.length; i++) {
    const el = reg.els[i]
    if (!el) continue
    if (NOTES[i].focus === fa || NOTES[i].focus === fb) reg.until[i] = now + FOLLOW_MS
    if (now > reg.until[i]) continue
    const anchor = anchors[NOTES[i].anchor]
    if (!anchor) continue

    pos.copy(anchor).applyMatrix4(spin.matrixWorld)
    const behind = delta.copy(pos).sub(camPos).angleTo(camDir) > Math.PI / 2
    const dist = pos.distanceTo(camPos)
    pos.project(camera)
    const x = pos.x * (width / 2) + width / 2
    const y = -(pos.y * (height / 2)) + height / 2

    const last = reg.last[i]
    if (Math.abs(last[0] - x) <= EPS && Math.abs(last[1] - y) <= EPS) continue
    last[0] = x
    last[1] = y
    el.style.display = behind ? 'none' : 'block'
    el.style.zIndex = `${Math.round(A * dist + B)}`
    el.style.transform = `translate3d(${x}px,${y}px,0) scale(1)`
  }
}

/** En vertical el modelo asoma por un costado: todas las etiquetas apuntan hacia el lado libre de la pantalla. */
const dirOf = (dir: 'left' | 'right', mode: LayoutMode, side: number) => (mode === 'portrait' ? (side > 0 ? 'left' : 'right') : dir)

export function NotesOverlay({ registry, reduced, mode }: { registry: NoteRegistry; reduced: boolean; mode: LayoutMode }) {
  const [{ focus, side }, setState] = useState<{ focus: Focus | null; side: number }>({ focus: null, side: 1 })
  useEffect(() => {
    registry.setFocus = (f, s) => setState({ focus: f, side: s })
    return () => {
      registry.setFocus = () => {}
    }
  }, [registry])

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {NOTES.map((n, i) => (
        <div
          key={i}
          ref={(el) => {
            registry.els[i] = el
          }}
          style={{ position: 'absolute', top: 0, left: 0, transformOrigin: '0 0' }}
        >
          <div style={{ position: 'absolute', pointerEvents: 'none' }}>
            <div
              className={`anat-note anat-note--${dirOf(n.dir, mode, side)}`}
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
          </div>
        </div>
      ))}
    </div>
  )
}
