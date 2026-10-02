import * as THREE from 'three'
import type { Vertebra } from './types'

/** Puntos del modelo a los que se anclan las anotaciones (espacio local del modelo). */
export function buildAnchors(
  vertebrae: Vertebra[],
  chain: THREE.CatmullRomCurve3[],
  si: THREE.Vector3[],
  hips: THREE.Vector3[],
): Record<string, THREE.Vector3> {
  const v = (j: number) => vertebrae[j]
  const L45y = (v(22).y - v(22).height / 2 + v(23).y + v(23).height / 2) / 2
  return {
    c7Left: new THREE.Vector3(-v(6).width / 2 - 0.06, v(6).y, v(6).z + 0.05),
    c3Left: new THREE.Vector3(-v(2).width / 2 - 0.06, v(2).y, v(2).z + 0.05),
    l45Right: new THREE.Vector3(v(22).width / 2 + 0.06, L45y, (v(22).z + v(23).z) / 2 + 0.05),
    l3Right: new THREE.Vector3(v(21).width / 2 + 0.06, v(21).y, v(21).z + 0.05),
    t6Right: new THREE.Vector3(v(12).width / 2 + 0.08, v(12).y, v(12).z),
    t6Back: new THREE.Vector3(0, v(12).y - 0.1, v(12).z - 0.75),
    siLeft: si[0].clone(),
    siRight: si[1].clone(),
    hipLeft: hips[0].clone().add(new THREE.Vector3(-0.17, 0, 0)),
    hipRight: hips[1].clone().add(new THREE.Vector3(0.17, 0, 0)),
    chainLeft: chain[0].getPointAt(0.42),
  }
}
