import * as THREE from 'three'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * Utilidades de geometría compartidas por los módulos del modelo.
 *
 * Todas las piezas se unen en geometrías **indexadas** (cada vértice se guarda
 * una sola vez y los triángulos lo referencian). El sombreado no cambia: solo
 * se sueldan vértices que ya eran idénticos en posición *y* normal, y el orden
 * de los triángulos se conserva (importa en las capas translúcidas).
 */

/** Deja la pieza indexada y solo con posición + normal (sin uv). */
function indexed(g: THREE.BufferGeometry) {
  if (g.hasAttribute('uv')) g.deleteAttribute('uv')
  // Las primitivas de three ya vienen indexadas. Las extrusiones sombreadas
  // vienen sin índice: se sueldan los vértices idénticos (posición y normal).
  return g.index ? g : mergeVertices(g, 1e-6)
}

/** Une piezas en una sola geometría indexada (todas con posición y normal, sin uv). */
export function merge(parts: THREE.BufferGeometry[]) {
  return mergeGeometries(parts.map(indexed))!
}

/** Sombreado suave: suelda vértices y recalcula normales promediadas. */
export function smooth(g: THREE.BufferGeometry, tolerance = 1e-4) {
  g.deleteAttribute('normal')
  g.deleteAttribute('uv')
  const m = mergeVertices(g, tolerance)
  m.computeVertexNormals()
  return m
}

const up = new THREE.Vector3(0, 1, 0)

/** Cilindro (opcionalmente cónico) entre dos puntos, con extremos redondeados. */
export function strut(a: THREE.Vector3, b: THREE.Vector3, ra: number, rb = ra) {
  const dir = new THREE.Vector3().subVectors(b, a)
  const len = dir.length()
  const q = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize())
  const body = new THREE.CylinderGeometry(rb, ra, len, 7, 1, true)
  body.applyQuaternion(q)
  body.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2)
  const capA = new THREE.SphereGeometry(ra, 7, 4)
  capA.translate(a.x, a.y, a.z)
  const capB = new THREE.SphereGeometry(rb, 7, 4)
  capB.translate(b.x, b.y, b.z)
  return [body, capA, capB]
}

/**
 * Tubo a lo largo de una curva con sección elíptica variable: sirve para
 * costillas (planas y afinadas) y para la diáfisis del fémur.
 */
export function sweep(
  curve: THREE.Curve<THREE.Vector3>,
  segments: number,
  radial: number,
  section: (u: number) => [number, number],
) {
  const frames = curve.computeFrenetFrames(segments, false)
  const pos: number[] = []
  const idx: number[] = []
  const p = new THREE.Vector3()
  for (let i = 0; i <= segments; i++) {
    const u = i / segments
    curve.getPointAt(u, p)
    const [a, b] = section(u)
    const N = frames.normals[i]
    const B = frames.binormals[i]
    for (let j = 0; j < radial; j++) {
      const t = (j / radial) * Math.PI * 2
      const c = Math.cos(t) * a
      const s = Math.sin(t) * b
      pos.push(p.x + N.x * c + B.x * s, p.y + N.y * c + B.y * s, p.z + N.z * c + B.z * s)
    }
  }
  for (let i = 0; i < segments; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * radial + j
      const b = i * radial + ((j + 1) % radial)
      const c = (i + 1) * radial + j
      const d = (i + 1) * radial + ((j + 1) % radial)
      idx.push(a, c, b, b, c, d)
    }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}
