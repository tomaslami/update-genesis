import type { Focus } from '@/lib/store'
import type { SectionId } from '@/lib/site'
import type { Region } from './geometry'

/**
 * Datos de la escena: poses del modelo para cada sección, lado de la pantalla
 * y anotaciones. Es configuración pura (sin three ni React).
 */

export type View = {
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

export const VIEWS: Record<Focus, View> = {
  hero: { rotY: 0, y: -0.95, dist: 17, ribs: 0.42, lit: {} },
  full: { rotY: -0.7, y: -0.95, dist: 16.5, ribs: 0.14, lit: { C: 0.45, T: 0.45, L: 0.45, pelvis: 0.45, femur: 0.45 } },
  cervlum: { rotY: 0.35, y: 0.15, dist: 12.5, ribs: 0.08, lit: { C: 1, L: 1 }, dimRest: true },
  joints: { rotY: 0.5, y: -3.0, dist: 10.6, ribs: 0.04, lit: { pelvis: 0.55, femur: 0.55 }, joints: 1, dimRest: true },
  posture: { rotY: -Math.PI / 2, y: -0.8, dist: 15.5, ribs: 0.06, lit: { C: 0.8, T: 0.8, L: 0.8 }, plumb: 1 },
  rpg: { rotY: Math.PI * 0.9, y: -0.95, dist: 16.5, ribs: 0.1, lit: {}, chain: 1 },
  osteo: { rotY: -0.45, y: -2.9, dist: 10.4, ribs: 0.04, lit: { pelvis: 1 }, joints: 1, dimRest: true },
}

/** Secciones de la zona anatómica y el lado de la pantalla donde va el modelo (1 derecha, -1 izquierda). */
export const ZONE: SectionId[] = ['inicio', 'kinesiologia', 'abordaje', 'servicios']
export const SIDES = [1, -1, 1, -1]

export type Note = { anchor: string; lines: string[]; dir: 'left' | 'right'; focus: Focus; delay?: number }

export const NOTES: Note[] = [
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

/** Cámara: campo de visión y planos (la posición inicial la fija la primera pose). */
export const CAMERA = { fov: 32, position: [0, -0.95, 17] as [number, number, number], near: 0.1, far: 80 }

/** Tono: AgX con exposición un poco alta para que el hueso marfil no se apague. */
export const EXPOSURE = 1.25

/** Resolución máxima del lienzo (relación de píxeles) según el tipo de pantalla. */
export const MAX_DPR = { desktop: 1.5, mobile: 1.3 }

/** Encuadre en el visor vertical: el modelo centrado; > 1 lo aleja un poco para que respire. */
export const VISOR_DIST = 1.04

/** Cuadros por segundo del movimiento "ambiente" (oscilación del hero, pulsos): el ojo no distingue más. */
export const AMBIENT_FPS = 30

/** Cuánto tiempo (ms) después de la última acción del usuario se sigue renderizando a ritmo completo. */
export const INTERACTION_MS = 1500
