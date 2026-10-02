import * as THREE from 'three'
import { merge, smooth, sweep } from './buffers'
import type { Vertebra } from './types'

/** Ancho y caída de cada par de costillas T1–T10 (de arriba hacia abajo). */
const RIB_W = [0.7, 0.92, 1.08, 1.18, 1.24, 1.26, 1.24, 1.18, 1.08, 0.96]
const RIB_DROP = [0.22, 0.3, 0.38, 0.46, 0.54, 0.6, 0.66, 0.7, 0.72, 0.7]

/** Primera vértebra torácica (índice en el arreglo de 24 vértebras): T1. */
const T1 = 7

/** Esternón: manubrio y cuerpo, plano. */
function sternum(top: number, z: number) {
  const st = new THREE.Shape()
  st.moveTo(-0.13, 0)
  st.bezierCurveTo(-0.16, -0.12, -0.08, -0.22, -0.09, -0.32)
  st.lineTo(-0.11, -0.95)
  st.bezierCurveTo(-0.1, -1.05, -0.03, -1.12, 0, -1.16)
  st.bezierCurveTo(0.03, -1.12, 0.1, -1.05, 0.11, -0.95)
  st.lineTo(0.09, -0.32)
  st.bezierCurveTo(0.08, -0.22, 0.16, -0.12, 0.13, 0)
  st.closePath()
  const g = new THREE.ExtrudeGeometry(st, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 3,
  })
  g.rotateX(-0.18)
  g.translate(0, top, z - 0.02)
  return smooth(g)
}

/**
 * Costillas T1–T10: planas, afinadas hacia adelante, con cartílago costal que
 * las une al esternón (o a la costilla de arriba, en las falsas).
 * Es un generador: cede el control cada dos pares para poder repartir el trabajo.
 */
export function* buildThorax(vertebrae: Vertebra[]): Generator<void, { ribs: THREE.BufferGeometry; cartilage: THREE.BufferGeometry }, void> {
  const ribs: THREE.BufferGeometry[] = []
  const cartilage: THREE.BufferGeometry[] = []
  const sternumTop = vertebrae[T1].y - 0.12
  const sternumZ = vertebrae[T1].z + 0.9
  for (let j = 0; j < 10; j++) {
    const v = vertebrae[T1 + j]
    const W = RIB_W[j]
    const dr = RIB_DROP[j]
    const trueRib = j < 7
    for (const s of [-1, 1]) {
      const pts = [
        new THREE.Vector3(s * (v.width / 2 + 0.05), v.y, v.z - 0.2),
        new THREE.Vector3(s * W * 0.62, v.y + 0.04, v.z - 0.42),
        new THREE.Vector3(s * W, v.y - dr * 0.25, v.z + 0.05),
        new THREE.Vector3(s * W * 0.8, v.y - dr * 0.68, v.z + 0.6),
        new THREE.Vector3(s * W * 0.55, v.y - dr * 0.88, v.z + 0.78),
      ]
      const bone = new THREE.CatmullRomCurve3(pts)
      ribs.push(sweep(bone, 32, 8, (u) => [0.016 + 0.006 * (1 - u), 0.024 + 0.03 * Math.sin(Math.PI * Math.min(u * 1.4, 1))]))
      // Cartílago: une el extremo de la costilla con el esternón (o con la costilla de arriba).
      const end = pts[pts.length - 1]
      const cart = new THREE.CatmullRomCurve3([
        end,
        new THREE.Vector3(s * (trueRib ? 0.32 : W * 0.4), end.y + (trueRib ? -0.02 : 0.12), v.z + 0.86),
        trueRib
          ? new THREE.Vector3(s * 0.11, sternumTop - 0.1 - j * 0.14, sternumZ)
          : new THREE.Vector3(s * W * 0.3, end.y + 0.26, v.z + 0.88),
      ])
      cartilage.push(sweep(cart, 12, 6, () => [0.014, 0.02]))
    }
    if (j % 2 === 1) yield
  }
  cartilage.push(sternum(sternumTop, sternumZ))
  return { ribs: merge(ribs), cartilage: merge(cartilage) }
}
