'use client'
import { useSyncExternalStore } from 'react'
import type { SectionId } from './site'

/** Zona del cuerpo que el modelo 3D ilumina. */
export type Focus = 'hero' | 'full' | 'cervlum' | 'joints' | 'posture' | 'rpg' | 'osteo'
export type Service = 'rpg' | 'osteo'

export type Condition = {
  id: string
  label: string
  focus: Focus
  zone: string
}

/** "¿Qué podemos abordar?": cada ítem enciende una zona del modelo. */
export const CONDITIONS: Condition[] = [
  { id: 'cervlum', label: 'Dolor cervical y lumbar', focus: 'cervlum', zone: 'Cervical y lumbar' },
  { id: 'lesiones', label: 'Lesiones musculares y articulares', focus: 'joints', zone: 'Articulaciones' },
  { id: 'trauma', label: 'Rehabilitación traumatológica y postquirúrgica', focus: 'full', zone: 'Abordaje global' },
  { id: 'postura', label: 'Alteraciones posturales', focus: 'posture', zone: 'Eje postural' },
  { id: 'funcional', label: 'Recuperación funcional', focus: 'full', zone: 'Abordaje global' },
  { id: 'deportiva', label: 'Rehabilitación deportiva', focus: 'full', zone: 'Abordaje global' },
  { id: 'prevencion', label: 'Prevención de lesiones', focus: 'full', zone: 'Abordaje global' },
]

type State = {
  active: SectionId
  progress: number
  condition: string
  service: Service
  menuOpen: boolean
}

let state: State = {
  active: 'inicio',
  progress: 0,
  condition: CONDITIONS[0].id,
  service: 'rpg',
  menuOpen: false,
}

const listeners = new Set<() => void>()

export const store = {
  get: () => state,
  set(patch: Partial<State>) {
    const next = { ...state, ...patch }
    if ((Object.keys(patch) as (keyof State)[]).every((k) => next[k] === state[k])) return
    state = next
    listeners.forEach((l) => l())
  },
  subscribe(l: () => void) {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
}

export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => select(state),
    () => select(state),
  )
}

/** Qué muestra el modelo según la sección visible y lo elegido en cada una. */
export function focusFor(s: State): Focus {
  switch (s.active) {
    case 'inicio':
      return 'hero'
    case 'kinesiologia':
      return 'full'
    case 'abordaje':
      return CONDITIONS.find((c) => c.id === s.condition)?.focus ?? 'full'
    case 'servicios':
      return s.service
    default:
      return 'full'
  }
}
