import * as THREE from 'three'
import { merge, strut, sweep } from './buffers'

/**
 * Inicio de los fémures: cabeza, cuello, trocánteres y diáfisis con su leve
 * curva. `hips` son las cabezas femorales (izquierda, derecha).
 */
export function buildFemurs(hips: THREE.Vector3[]) {
  const parts: THREE.BufferGeometry[] = []
  hips.forEach((h, idx) => {
    const s = idx === 0 ? -1 : 1
    const head = new THREE.SphereGeometry(0.17, 20, 14)
    head.translate(h.x, h.y, h.z)
    const neckEnd = new THREE.Vector3(h.x + s * 0.24, h.y - 0.13, h.z - 0.06)
    parts.push(head, ...strut(h, neckEnd, 0.085, 0.1))
    const troch = new THREE.SphereGeometry(1, 12, 10)
    troch.scale(0.12, 0.15, 0.11)
    troch.translate(h.x + s * 0.33, h.y - 0.1, h.z - 0.1)
    const lesser = new THREE.SphereGeometry(0.055, 8, 6)
    lesser.translate(h.x + s * 0.2, h.y - 0.32, h.z - 0.1)
    parts.push(troch, lesser)
    const shaft = new THREE.CatmullRomCurve3([
      new THREE.Vector3(h.x + s * 0.3, h.y - 0.16, h.z - 0.06),
      new THREE.Vector3(h.x + s * 0.27, h.y - 0.7, h.z + 0.02),
      new THREE.Vector3(h.x + s * 0.18, h.y - 1.45, h.z + 0.05),
    ])
    parts.push(sweep(shaft, 20, 12, (u) => [0.095 - 0.02 * Math.sin(Math.PI * u), 0.09 - 0.02 * Math.sin(Math.PI * u)]))
    const end = new THREE.SphereGeometry(0.08, 12, 8)
    end.translate(h.x + s * 0.18, h.y - 1.45, h.z + 0.05)
    parts.push(end)
  })
  return merge(parts)
}
