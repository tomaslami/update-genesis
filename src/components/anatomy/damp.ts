import type * as THREE from 'three'

/**
 * Amortiguación crítica (suavizado hacia un objetivo). Es la misma fórmula y
 * los mismos valores por defecto que `easing.damp` de maath, escrita aquí para
 * no cargar la librería entera por tres funciones. Cada una devuelve `true`
 * mientras el valor sigue moviéndose y `false` cuando llegó (se "pega" al
 * objetivo a menos de `EPS`): así la escena sabe cuándo puede dejar de dibujar.
 */

const EPS = 0.001

/** Velocidad de cada propiedad amortiguada, por objeto. */
const velocities = new WeakMap<object, Record<string, number>>()

export function damp<K extends string>(current: { [P in K]: number }, prop: K, target: number, smoothTime: number, delta: number): boolean {
  let vel = velocities.get(current)
  if (!vel) velocities.set(current, (vel = {}))
  if (vel[prop] === undefined) vel[prop] = 0

  const from = current[prop]
  if (Math.abs(from - target) <= EPS) {
    current[prop] = target
    return false
  }

  const omega = 2 / Math.max(0.0001, smoothTime)
  const x = omega * delta
  const t = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x)
  const change = from - target
  const to = from - change
  const temp = (vel[prop] + omega * change) * delta
  vel[prop] = (vel[prop] - omega * temp) * t
  let output = to + (change + temp) * t
  // Sin sobrepasar el objetivo: si venía por debajo y el resultado lo pasa (o al revés), se queda en él.
  if (target - from > 0 === output > target) {
    output = target
    vel[prop] = (output - target) / delta
  }
  current[prop] = output
  return true
}

/** Amortigua un vector 3D hacia (x, y, z). */
export function damp3(current: THREE.Vector3, x: number, y: number, z: number, smoothTime: number, delta: number): boolean {
  const a = damp(current, 'x', x, smoothTime, delta)
  const b = damp(current, 'y', y, smoothTime, delta)
  const c = damp(current, 'z', z, smoothTime, delta)
  return a || b || c
}

/** Amortigua un color hacia otro. */
export function dampColor(current: THREE.Color, target: THREE.Color, smoothTime: number, delta: number): boolean {
  const a = damp(current, 'r', target.r, smoothTime, delta)
  const b = damp(current, 'g', target.g, smoothTime, delta)
  const c = damp(current, 'b', target.b, smoothTime, delta)
  return a || b || c
}
