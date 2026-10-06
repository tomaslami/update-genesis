import * as THREE from 'three'
import { merge, smooth, strut } from './buffers'
import { roundedSlab } from './slab'
import { GAP } from './spine'
import type { Vertebra } from './types'

/**
 * Pelvis: alas ilíacas (eco del isotipo de Génesis) articuladas con un sacro
 * anatómico, el cóccix y el disco L5–S1.
 */

/* ───────────────────────────── Sacro ───────────────────────────── */

/**
 * El sacro son cinco vértebras fusionadas: un triángulo invertido tan ancho
 * como largo. Se arma derecho, en un espacio propio (x lateral, y a lo largo
 * del eje desde el platillo de S1 hacia abajo, n hacia adelante), y después se
 * curva sobre su eje: cóncavo hacia adelante (cifosis sacra), inclinado hacia
 * atrás, con el cóccix cerrando la curva hacia adelante.
 */
const SACRUM = {
  /** Largo del sacro (base → vértice) sobre su eje. */
  length: 1.17,
  /** Inclinación del eje (desde la vertical, hacia atrás) en S1 y en el vértice. */
  lean: [0.65, 0.2] as const,
  /** Inclinación del platillo de S1: baja hacia adelante, así el disco L5–S1 queda en cuña. */
  base: 0.2,
  /** El platillo de S1 se apoya en el disco: alto del disco en su borde posterior. */
  discBack: 0.035,
}

/** Cóccix: cuatro segmentos que siguen la curva y la cierran hacia adelante. */
const COCCYX = {
  length: 0.345,
  /** Inclinación del eje al final del cóccix (negativa: la punta mira hacia adelante). */
  lean: -0.5,
  /** Centro (sobre el eje), medio ancho, medio alto y media profundidad de cada segmento. */
  segments: [
    [0.055, 0.11, 0.062, 0.055],
    [0.152, 0.08, 0.052, 0.045],
    [0.236, 0.06, 0.044, 0.038],
    [0.306, 0.042, 0.036, 0.03],
  ] as const,
}

/** Contorno anterior (lado derecho; el izquierdo es su espejo): curvas de Bézier [control 1, control 2, fin]. */
const OUTLINE: [number, number][][] = [
  // Borde superior de S1 (el promontorio), apenas abovedado.
  [[0.12, 0.012], [0.25, 0.005], [0.32, -0.02]],
  // Unión del cuerpo con el ala: el ala arranca más abajo.
  [[0.35, -0.035], [0.38, -0.05], [0.42, -0.055]],
  // Ala del sacro, que cae hacia afuera.
  [[0.5, -0.06], [0.575, -0.065], [0.61, -0.11]],
  // Borde lateral: carilla auricular (S1–S3), donde articula el ilíaco.
  [[0.645, -0.16], [0.635, -0.27], [0.6, -0.36]],
  // Debajo de la carilla auricular el hueso se angosta.
  [[0.565, -0.46], [0.44, -0.62], [0.36, -0.74]],
  // Ángulo inferolateral.
  [[0.315, -0.81], [0.29, -0.88], [0.265, -0.95]],
  // Vértice (S5), donde articula el cóccix.
  [[0.225, -1.02], [0.16, -1.09], [0.12, -1.14]],
  [[0.08, -1.17], [0.03, -1.17], [0, -1.17]],
]
const OUTLINE_TOP: [number, number] = [0, 0.012]

/**
 * Agujeros sacros anteriores: cuatro pares a la altura de las crestas
 * transversales (las uniones S1–S2 … S4–S5). Convergen y se achican hacia abajo.
 * [altura, distancia al centro, radio].
 */
const FORAMINA: [number, number, number][] = [
  [-0.3, 0.28, 0.072],
  [-0.55, 0.235, 0.062],
  [-0.76, 0.195, 0.05],
  [-0.94, 0.138, 0.04],
]

/** Cresta sacra media (apófisis espinosas fusionadas S1–S4): [altura, medio ancho, medio alto, relieve]. */
const MEDIAN_CREST: [number, number, number, number][] = [
  [-0.12, 0.05, 0.085, 0.075],
  [-0.37, 0.045, 0.08, 0.065],
  [-0.6, 0.04, 0.07, 0.055],
  [-0.8, 0.032, 0.055, 0.04],
]

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/** Medio ancho de la columna de cuerpos vertebrales fusionados (u: 0 en S1, 1 en el vértice). */
const bodyHalfWidth = (u: number) => 0.33 - 0.22 * Math.pow(u, 0.8)

/**
 * Espesor del sacro hacia adelante (`front`) y hacia atrás (`back`) del eje en
 * cada punto del contorno. Los cuerpos (al centro) son más gruesos y salen
 * hacia adelante: el promontorio sobresale y se marcan las crestas
 * transversales. Las masas laterales son gruesas atrás (carilla auricular) y
 * todo se afina hacia el vértice.
 */
function thickness(x: number, y: number) {
  const u = clamp01(-y / SACRUM.length)
  const bw = bodyHalfWidth(u)
  const r = Math.min(Math.abs(x) / bw, 1.4)
  const body = smoothstep(bw + 0.09, bw - 0.05, Math.abs(x))
  let ridges = 0
  for (const [fy] of FORAMINA) ridges += Math.exp(-Math.pow((y - fy) / 0.04, 2))
  // Cuerpos: frente redondeado, como el de una vértebra, con las crestas transversales.
  const bodyFront = (0.07 + 0.18 * Math.pow(1 - u, 1.6)) * (1 - 0.2 * r * r) + 0.02 * ridges
  const front = THREE.MathUtils.lerp(0.045 + 0.02 * (1 - u), bodyFront, body)
  // Atrás, la cresta sacra media recorre la línea media.
  const crest = 0.035 * Math.exp(-Math.pow(x / 0.05, 2)) * smoothstep(0.85, 0.6, u)
  const back = THREE.MathUtils.lerp(0.05 + 0.18 * Math.pow(1 - u, 1.2), 0.07 + 0.21 * Math.pow(1 - u, 1.3), body) + crest
  return { front, back }
}

/** Desplazamiento (y, z) y dirección de un arco de curvatura constante que arranca inclinado `phi0`. */
function arc(phi0: number, k: number, s: number) {
  if (Math.abs(k) < 1e-6) return { y: -s * Math.cos(phi0), z: -s * Math.sin(phi0), phi: phi0 }
  const phi = phi0 - k * s
  return { y: -(Math.sin(phi0) - Math.sin(phi)) / k, z: -(Math.cos(phi) - Math.cos(phi0)) / k, phi }
}

/** Eje del sacro y el cóccix: dos arcos encadenados, rectos más allá de sus extremos. */
function sacralAxis(s: number) {
  const [phi0, phi1] = SACRUM.lean
  const kSac = (phi0 - phi1) / SACRUM.length
  const kCoc = (phi1 - COCCYX.lean) / COCCYX.length
  if (s <= 0) return arc(phi0, 0, s)
  if (s <= SACRUM.length) return arc(phi0, kSac, s)
  const a = arc(phi0, kSac, SACRUM.length)
  const b = arc(phi1, kCoc, Math.min(s - SACRUM.length, COCCYX.length))
  const rest = s - SACRUM.length - COCCYX.length
  const c = arc(b.phi, 0, Math.max(0, rest))
  return { y: a.y + b.y + c.y, z: a.z + b.z + c.z, phi: b.phi }
}

/**
 * Lleva un punto del espacio derecho del sacro al modelo. La parte de arriba
 * (S1) se cizalla para que su platillo quede casi horizontal frente al de L5:
 * el resto del ángulo lumbosacro lo toma el cuerpo de S1, más alto adelante.
 */
function sacralPlacer(origin: THREE.Vector3) {
  const [phi0] = SACRUM.lean
  const shear = Math.tan(phi0 - SACRUM.base)
  return (x: number, y: number, n: number, target = new THREE.Vector3()) => {
    const u = clamp01(-y / SACRUM.length)
    const s = -(y + n * shear * (1 - smoothstep(0, 0.3, u)))
    const a = sacralAxis(s)
    return target.set(x, origin.y + a.y - n * Math.sin(a.phi), origin.z + a.z + n * Math.cos(a.phi))
  }
}
type Placer = ReturnType<typeof sacralPlacer>

/** Aplica `place` a todos los vértices de una pieza armada en el espacio derecho del sacro. */
function bend(g: THREE.BufferGeometry, place: Placer) {
  const pos = g.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    place(pos.getX(i), pos.getY(i), pos.getZ(i), v)
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  return g
}

function sacrumShape() {
  const shape = new THREE.Shape()
  shape.moveTo(...OUTLINE_TOP)
  for (const [c1, c2, p] of OUTLINE) shape.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], p[0], p[1])
  // Lado izquierdo: las mismas curvas en espejo y en orden inverso.
  for (let i = OUTLINE.length - 1; i >= 0; i--) {
    const [c1, c2] = OUTLINE[i]
    const p = i > 0 ? OUTLINE[i - 1][2] : OUTLINE_TOP
    shape.bezierCurveTo(-c2[0], c2[1], -c1[0], c1[1], -p[0], p[1])
  }
  for (const [y, x, r] of FORAMINA)
    for (const s of [-1, 1]) {
      const hole = new THREE.Path()
      hole.absellipse(s * x, y, r * 1.15, r * 0.85, 0, Math.PI * 2, false, 0)
      shape.holes.push(hole)
    }
  return shape
}

/** Distancia del borde lateral del sacro a la línea media, a una altura dada (de la punta del ala al ángulo inferolateral). */
function lateralBorder(y: number) {
  const path = new THREE.Path()
  path.moveTo(...OUTLINE[2][2])
  for (const [c1, c2, p] of OUTLINE.slice(3, 5)) path.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], p[0], p[1])
  const pts = path.getPoints(24)
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]
    const b = pts[i + 1]
    if (y <= a.y && y >= b.y) return a.x + ((b.x - a.x) * (y - a.y)) / (b.y - a.y)
  }
  return pts[pts.length - 1].x
}

/**
 * Sacro, cóccix y apófisis articulares de S1, ya ubicados en el modelo.
 * Es un generador: cede el control entre tramos para repartir el trabajo.
 */
export function* buildSacrum(place: Placer, l5: Vertebra): Generator<void, THREE.BufferGeometry, void> {
  // Placa con el contorno y los agujeros; después se le da espesor y se curva.
  const plate = yield* roundedSlab(sacrumShape(), { spacing: 0.04, rim: 0.024 })
  yield
  const pos = plate.attributes.position
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i)
    let y = pos.getY(i)
    const t = pos.getZ(i)
    const { front, back } = thickness(x, y)
    // Los agujeros posteriores son más chicos que los anteriores: hacia atrás se cierran.
    if (t < 0)
      for (const [fy, fx, fr] of FORAMINA) {
        const cx = Math.sign(x) * fx
        const d = Math.hypot((x - cx) / (fr * 1.15), (y - fy) / (fr * 0.85))
        const pull = -t * 0.38 * smoothstep(1.6, 1.0, d)
        x = cx + (x - cx) * (1 - pull)
        y = fy + (y - fy) * (1 - pull)
      }
    pos.setXYZ(i, x, y, t >= 0 ? t * front : t * back)
  }
  bend(plate, place).computeVertexNormals()
  const parts: THREE.BufferGeometry[] = [plate]
  yield

  // Tubérculos de la cresta sacra media (las apófisis espinosas fusionadas).
  for (const [y, w, h, d] of MEDIAN_CREST) {
    const tub = new THREE.SphereGeometry(1, 10, 8)
    tub.scale(w, h, d)
    tub.translate(0, y, -thickness(0, y).back + d * 0.3)
    parts.push(bend(tub, place))
  }

  // Cóccix: cuatro segmentos que se achican; el primero con sus apófisis transversas.
  for (const [k, [c, w, h, d]] of COCCYX.segments.entries()) {
    const y = -SACRUM.length - c
    const seg = new THREE.SphereGeometry(1, 12, 8)
    seg.scale(w, h, d)
    seg.translate(0, y, 0)
    parts.push(bend(seg, place))
    if (k === 0)
      for (const s of [-1, 1]) {
        const transverse = new THREE.SphereGeometry(1, 8, 6)
        transverse.scale(0.035, 0.022, 0.026)
        transverse.translate(s * (w + 0.005), y + 0.012, -0.01)
        parts.push(bend(transverse, place))
      }
  }

  // Apófisis articulares superiores de S1: suben por detrás del cuerpo y
  // encastran con las inferiores de L5 (las carillas lumbosacras).
  for (const s of [-1, 1]) {
    const base = place(s * 0.27, -0.06, -thickness(s * 0.27, -0.06).back * 0.8)
    const tip = new THREE.Vector3(s * l5.width * 0.4, l5.y - l5.height * 0.25, l5.z - l5.width * 0.47)
    parts.push(...strut(base, tip, 0.05, 0.036))
  }
  return merge(parts)
}

/**
 * Disco L5–S1: en cuña (más alto adelante), entre el platillo inferior de L5
 * (horizontal) y el de S1 (que baja hacia adelante).
 */
export function lumbosacralDisc(l5: Vertebra, origin: THREE.Vector3) {
  const top = l5.y - l5.height / 2
  const r = (l5.width / 2 + bodyHalfWidth(0)) / 2 * 0.92
  const profile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(r * 0.94, 0),
    new THREE.Vector2(r * 1.03, 0.5),
    new THREE.Vector2(r * 0.94, 1),
    new THREE.Vector2(0, 1),
  ]
  const g = new THREE.LatheGeometry(profile, 20)
  g.scale(1, 1, 0.72)
  const slope = Math.tan(SACRUM.base)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i) + origin.z
    const bottom = origin.y - slope * (z - origin.z)
    pos.setXYZ(i, pos.getX(i), bottom + (top - bottom) * pos.getY(i), z)
  }
  g.computeVertexNormals()
  return g
}

/* ────────────────────────── Alas ilíacas ────────────────────────── */

const WING_SCALE = 0.8
const WING_BEND = 0.32
/** Curva el ala para que forme un cuenco (la fosa ilíaca). */
const wingBend = (s: number, x: number) => WING_BEND * Math.pow(x - s * 0.62, 2)

/** Punto del ala (en coordenadas del isotipo, 0–200) en el espacio local del ala. */
function wingLocal(s: number, x: number, y: number, z = 0.06) {
  const lx = s * (x / 100 - 0.46) * WING_SCALE
  return new THREE.Vector3(lx, (-y / 100 + 0.08) * WING_SCALE, z + wingBend(s, lx))
}

/**
 * Borde medial del ala: arranca en la articulación sacroilíaca y baja por el
 * estrecho superior de la pelvis hasta el pubis. Deja a la vista el ala y los
 * agujeros del sacro.
 */
const WING_ROOT: [number, number] = [78, 12]
/** Pubis: la cara de la sínfisis, plana y vertical (coordenadas del isotipo). */
const PUBIS = { x: 9, top: 146, bottom: 166 }

/** Ala ilíaca (s = -1 izquierda, 1 derecha) con su acetábulo. */
export function wingGeometry(s: number) {
  const X = (x: number) => s * (x / 100 - 0.46) * WING_SCALE
  const Y = (y: number) => (-y / 100 + 0.08) * WING_SCALE
  const shape = new THREE.Shape()
  shape.moveTo(X(WING_ROOT[0]), Y(WING_ROOT[1]))
  shape.bezierCurveTo(X(104), Y(-34), X(178), Y(-36), X(186), Y(30))
  shape.bezierCurveTo(X(190), Y(72), X(160), Y(100), X(134), Y(120))
  shape.bezierCurveTo(X(112), Y(140), X(70), Y(162), X(PUBIS.x), Y(PUBIS.bottom))
  shape.lineTo(X(PUBIS.x), Y(PUBIS.top))
  shape.bezierCurveTo(X(34), Y(120), X(70), Y(90), X(WING_ROOT[0]), Y(WING_ROOT[1]))
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

/** Sínfisis del pubis: el disco de fibrocartílago entre las caras de los dos pubis. */
export function pubicSymphysis(wingMatrices: THREE.Matrix4[]) {
  const top = wingLocal(1, PUBIS.x, PUBIS.top).applyMatrix4(wingMatrices[1])
  const bottom = wingLocal(1, PUBIS.x, PUBIS.bottom).applyMatrix4(wingMatrices[1])
  const g = new THREE.SphereGeometry(1, 14, 10)
  g.scale(top.x, top.distanceTo(bottom) * 0.42, 0.065)
  g.translate(0, (top.y + bottom.y) / 2, (top.z + bottom.z) / 2)
  return g
}

/* ──────────────────────────── Conjunto ──────────────────────────── */

/** Dónde va cada pieza de la pelvis (debajo de la última lumbar) y sus puntos clave. */
export function pelvisLayout(vertebrae: Vertebra[]) {
  const l5 = vertebrae[vertebrae.length - 1]
  const S = l5.y - l5.height / 2 - GAP
  const zSac = l5.z - 0.1

  // Centro del platillo de S1: el disco L5–S1 mide `discBack` atrás y crece hacia adelante.
  const depth = bodyHalfWidth(0) * 2 * 0.72
  const origin = new THREE.Vector3(
    0,
    l5.y - l5.height / 2 - SACRUM.discBack - (depth / 2) * Math.tan(SACRUM.base),
    l5.z - 0.02,
  )
  const place = sacralPlacer(origin)

  /** Articulaciones sacroilíacas: sobre la línea articular, en el tercio superior del borde lateral. */
  const si = [-1, 1].map((s) => place(s * lateralBorder(-0.22), -0.22, thickness(0.6, -0.22).front))

  // Cada ala se apoya en el sacro por su raíz (la carilla auricular).
  const wingRotations = [-1, 1].map((s) => new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.25, -s * 0.85, 0)))
  const wingMatrices = [-1, 1].map((s, i) => {
    const root = place(s * 0.6, -0.16, 0.02)
    const local = wingLocal(s, WING_ROOT[0], WING_ROOT[1]).applyQuaternion(wingRotations[i])
    return new THREE.Matrix4().compose(root.sub(local), wingRotations[i], new THREE.Vector3(1, 1, 1))
  })
  /** Cabezas femorales (centro de cada acetábulo), izquierda y derecha. */
  const hips = [-1, 1].map((s, i) => wingLocal(s, 138, 122).applyMatrix4(wingMatrices[i]))
  return { S, zSac, origin, place, l5, wingMatrices, hips, si }
}
