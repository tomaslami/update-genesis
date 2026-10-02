import * as THREE from 'three'
import { merge } from './buffers'
import { TOP } from './spine'
import type { Vertebra } from './types'

/**
 * Cadena muscular posterior (RPG): de la nuca a las piernas, una curva por
 * lado. Las curvas se conservan (el modelo hace correr puntos de luz por ellas)
 * y se tubifican en una sola geometría.
 */
export function buildChain(vertebrae: Vertebra[], hips: THREE.Vector3[], S: number, zSac: number) {
  const posterior = (j: number, s: number, off = 0.62) => {
    const v = vertebrae[j]
    return new THREE.Vector3(s * (0.16 + v.width * 0.25), v.y, v.z - off)
  }
  const chain = [-1, 1].map((s) => {
    const h = hips[s === -1 ? 0 : 1]
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.14, TOP + 0.35, vertebrae[0].z - 0.45),
      posterior(2, s, 0.5),
      posterior(8, s),
      posterior(14, s),
      posterior(20, s),
      new THREE.Vector3(s * 0.4, S - 0.35, zSac - 0.55),
      new THREE.Vector3(h.x + s * 0.12, h.y - 0.1, h.z - 0.5),
      new THREE.Vector3(h.x + s * 0.18, h.y - 1.4, h.z - 0.32),
    ])
  })
  const geometry = merge(chain.map((c) => new THREE.TubeGeometry(c, 90, 0.03, 6)))
  return { chain, geometry }
}
