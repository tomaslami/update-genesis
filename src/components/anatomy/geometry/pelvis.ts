import * as THREE from 'three'
import { merge, smooth } from './buffers'
import { GAP } from './spine'
import type { Vertebra } from './types'

/**
 * Pelvis: eco del isotipo de Génesis. Alas ilíacas con acetábulo, sacro con
 * forámenes y cóccix. Las coordenadas de las alas vienen del isotipo (0–200).
 */

const WING_SCALE = 0.8
const WING_BEND = 0.32
/** Curva el ala para que forme un cuenco (la fosa ilíaca). */
const wingBend = (s: number, x: number) => WING_BEND * Math.pow(x - s * 0.62, 2)

/** Punto del ala (en coordenadas del isotipo) en el espacio local del ala. */
function wingLocal(s: number, x: number, y: number, z = 0.06) {
  const lx = s * (x / 100 - 0.46) * WING_SCALE
  return new THREE.Vector3(lx, (-y / 100 + 0.08) * WING_SCALE, z + wingBend(s, lx))
}

/** Ala ilíaca (s = -1 izquierda, 1 derecha) con su acetábulo. */
export function wingGeometry(s: number) {
  // Coordenadas relativas al punto de unión con el sacro.
  const X = (x: number) => s * (x / 100 - 0.46) * WING_SCALE
  const Y = (y: number) => (-y / 100 + 0.08) * WING_SCALE
  const shape = new THREE.Shape()
  shape.moveTo(X(46), Y(8))
  shape.bezierCurveTo(X(90), Y(-40), X(178), Y(-36), X(186), Y(30))
  shape.bezierCurveTo(X(190), Y(72), X(160), Y(100), X(134), Y(120))
  shape.bezierCurveTo(X(112), Y(140), X(70), Y(160), X(14), Y(164))
  shape.bezierCurveTo(X(40), Y(130), X(36), Y(96), X(40), Y(70))
  shape.closePath()
  const hole = new THREE.Path()
  hole.absellipse(X(74), Y(138), 0.15, 0.1, 0, Math.PI * 2, false, 0)
  shape.holes.push(hole)
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.045,
    bevelSegments: 3,
    curveSegments: 22,
  })
  g.translate(0, 0, -0.025)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getZ(i) + wingBend(s, pos.getX(i)))
  const wing = smooth(g)
  // Acetábulo: el anillo donde encaja la cabeza del fémur.
  const socket = new THREE.TorusGeometry(0.2, 0.045, 8, 24)
  const c = wingLocal(s, 138, 122, 0.04)
  socket.translate(c.x, c.y, c.z)
  return merge([wing, socket])
}

/** Sacro (cuatro pares de forámenes que se achican hacia abajo) y cóccix. */
export function sacrumGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.44, 0)
  shape.bezierCurveTo(-0.44, -0.4, -0.2, -0.9, 0, -1.04)
  shape.bezierCurveTo(0.2, -0.9, 0.44, -0.4, 0.44, 0)
  shape.closePath()
  for (let k = 0; k < 4; k++) {
    const y = -0.18 - k * 0.19
    const x = 0.2 - k * 0.035
    const r = 0.045 - k * 0.006
    for (const s of [-1, 1]) {
      const hole = new THREE.Path()
      hole.absellipse(s * x, y, r, r * 0.8, 0, Math.PI * 2, false, 0)
      shape.holes.push(hole)
    }
  }
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.04,
    bevelSegments: 3,
    curveSegments: 14,
  })
  g.translate(0, 0, -0.06)
  // Leve curvatura hacia atrás (cifosis sacra).
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getZ(i) - 0.12 * Math.pow(pos.getY(i), 2))
  const sac = smooth(g)
  // Cóccix: tres segmentos que se afinan.
  const coccyx: THREE.BufferGeometry[] = []
  for (let k = 0; k < 3; k++) {
    const seg = new THREE.SphereGeometry(1, 10, 8)
    seg.scale(0.07 - k * 0.015, 0.045, 0.05)
    seg.translate(0, -1.12 - k * 0.09, -0.16 - k * 0.04)
    coccyx.push(seg)
  }
  return merge([sac, ...coccyx])
}

/** Dónde va la pelvis (debajo de la última lumbar) y los puntos clave de cada lado. */
export function pelvisLayout(vertebrae: Vertebra[]) {
  const last = vertebrae[vertebrae.length - 1]
  const S = last.y - last.height / 2 - GAP
  const zSac = last.z - 0.1

  const sacrumMatrix = new THREE.Matrix4().compose(
    new THREE.Vector3(0, S, zSac - 0.05),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0.35, 0, 0)),
    new THREE.Vector3(1, 1, 1),
  )
  const wingMatrices = [-1, 1].map((s) =>
    new THREE.Matrix4().compose(
      new THREE.Vector3(s * 0.46, S - 0.08, zSac),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.25, -s * 0.85, 0)),
      new THREE.Vector3(1, 1, 1),
    ),
  )
  /** Cabezas femorales (acetábulos) y articulaciones sacroilíacas, izquierda y derecha. */
  const hips = [-1, 1].map((s, i) => wingLocal(s, 138, 122).applyMatrix4(wingMatrices[i]))
  const si = [-1, 1].map((s, i) => wingLocal(s, 50, 30).applyMatrix4(wingMatrices[i]))
  return { S, zSac, sacrumMatrix, wingMatrices, hips, si }
}
