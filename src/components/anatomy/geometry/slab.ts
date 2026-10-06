import * as THREE from 'three'

/**
 * Placa con agujeros y canto redondeado, con las caras trianguladas parejas
 * (Delaunay sobre una grilla hexagonal). A diferencia de una extrusión, tiene
 * vértices repartidos por toda la superficie: se puede curvar y darle espesor
 * variable sin facetas ni sombras ruidosas.
 *
 * Queda en el plano xy con z = t ∈ [-1, 1]: 1 es la cara de adelante, -1 la de
 * atrás y el canto va en el medio. Quien la usa le da el espesor real.
 *
 * Las funciones largas son generadores que ceden el control entre tramos, como
 * el resto del modelo, para no bloquear el hilo principal de la página.
 */

type Loop = THREE.Vector2[]

/** Reparte los puntos de un lazo cerrado a distancias iguales. */
function resample(points: Loop, step: number): Loop {
  const pts = points.slice()
  if (pts.length > 1 && pts[0].distanceTo(pts[pts.length - 1]) < 1e-9) pts.pop()
  const n = pts.length
  const cum = [0]
  for (let i = 0; i < n; i++) cum.push(cum[i] + pts[i].distanceTo(pts[(i + 1) % n]))
  const count = Math.max(12, Math.round(cum[n] / step))
  const out: Loop = []
  let seg = 0
  for (let k = 0; k < count; k++) {
    const d = (k / count) * cum[n]
    while (cum[seg + 1] < d) seg++
    const f = (d - cum[seg]) / (cum[seg + 1] - cum[seg] || 1)
    out.push(new THREE.Vector2().lerpVectors(pts[seg], pts[(seg + 1) % n], f))
  }
  return out
}

const area = (loop: Loop) => loop.reduce((a, p, i) => a + p.cross(loop[(i + 1) % loop.length]), 0) / 2

/** Corre cada punto de un lazo antihorario `d` hacia su izquierda (negativo: hacia la derecha). */
function offset(loop: Loop, d: number): Loop {
  const n = loop.length
  return loop.map((p, i) => {
    const a = loop[(i - 1 + n) % n]
    const b = loop[(i + 1) % n]
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
    return new THREE.Vector2(p.x - ((b.y - a.y) / len) * d, p.y + ((b.x - a.x) / len) * d)
  })
}

function inside(p: THREE.Vector2, loop: Loop) {
  let c = false
  for (let i = 0, j = loop.length - 1; i < loop.length; j = i++) {
    const a = loop[i]
    const b = loop[j]
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) c = !c
  }
  return c
}

function distance(p: THREE.Vector2, loop: Loop) {
  let best = Infinity
  for (let i = 0; i < loop.length; i++) {
    const a = loop[i]
    const b = loop[(i + 1) % loop.length]
    const abx = b.x - a.x
    const aby = b.y - a.y
    const t = Math.min(1, Math.max(0, ((p.x - a.x) * abx + (p.y - a.y) * aby) / (abx * abx + aby * aby || 1)))
    best = Math.min(best, Math.hypot(p.x - a.x - abx * t, p.y - a.y - aby * t))
  }
  return best
}

/**
 * Triangulación de Delaunay (Bowyer–Watson) con los triángulos en arreglos
 * planos, sin crear objetos por punto. Devuelve triángulos antihorarios.
 */
function* delaunay(pts: Loop): Generator<void, [number, number, number][], void> {
  const n = pts.length
  const box = new THREE.Box2().setFromPoints(pts)
  const size = Math.max(box.max.x - box.min.x, box.max.y - box.min.y) * 10
  const X = new Float64Array(n + 3)
  const Y = new Float64Array(n + 3)
  pts.forEach((p, i) => ((X[i] = p.x), (Y[i] = p.y)))
  X[n] = box.min.x - size
  Y[n] = box.min.y - size
  X[n + 1] = box.max.x + size * 2
  Y[n + 1] = box.min.y - size
  X[n + 2] = box.min.x - size
  Y[n + 2] = box.max.y + size * 2

  // Cada triángulo: vértices y circunferencia circunscripta (centro y radio²).
  const cap = 2 * n + 8
  const V = new Int32Array(cap * 3)
  const C = new Float64Array(cap * 3)
  let count = 0
  const add = (a: number, b: number, c: number) => {
    const d = 2 * (X[a] * (Y[b] - Y[c]) + X[b] * (Y[c] - Y[a]) + X[c] * (Y[a] - Y[b]))
    const a2 = X[a] * X[a] + Y[a] * Y[a]
    const b2 = X[b] * X[b] + Y[b] * Y[b]
    const c2 = X[c] * X[c] + Y[c] * Y[c]
    const x = (a2 * (Y[b] - Y[c]) + b2 * (Y[c] - Y[a]) + c2 * (Y[a] - Y[b])) / d
    const y = (a2 * (X[c] - X[b]) + b2 * (X[a] - X[c]) + c2 * (X[b] - X[a])) / d
    V.set([a, b, c], count * 3)
    C.set([x, y, (X[a] - x) ** 2 + (Y[a] - y) ** 2], count * 3)
    count++
  }
  add(n, n + 1, n + 2)
  // Borde de la cavidad: aristas que pertenecen a un solo triángulo eliminado.
  const edges: number[] = []
  for (let i = 0; i < n; i++) {
    if (i % 250 === 249) yield
    const px = X[i]
    const py = Y[i]
    edges.length = 0
    for (let t = 0; t < count; t++) {
      const k = t * 3
      if ((px - C[k]) ** 2 + (py - C[k + 1]) ** 2 >= C[k + 2]) continue
      for (let e = 0; e < 3; e++) {
        const u = V[k + e]
        const v = V[k + ((e + 1) % 3)]
        let shared = -1
        for (let j = 0; j < edges.length; j += 2)
          if (edges[j] === v && edges[j + 1] === u) {
            shared = j
            break
          }
        if (shared >= 0) edges.splice(shared, 2)
        else edges.push(u, v)
      }
      // Se quita el triángulo pasando el último a su lugar.
      count--
      V.copyWithin(k, count * 3, count * 3 + 3)
      C.copyWithin(k, count * 3, count * 3 + 3)
      t--
    }
    for (let j = 0; j < edges.length; j += 2) add(edges[j], edges[j + 1], i)
  }
  const out: [number, number, number][] = []
  for (let t = 0; t < count; t++) {
    const k = t * 3
    if (V[k] < n && V[k + 1] < n && V[k + 2] < n) out.push([V[k], V[k + 1], V[k + 2]])
  }
  return out
}

export function* roundedSlab(
  shape: THREE.Shape,
  { spacing, rim, rimSteps = 4 }: { spacing: number; rim: number; rimSteps?: number },
): Generator<void, THREE.BufferGeometry, void> {
  const extracted = shape.extractPoints(24)
  // Todos los lazos antihorarios; `solid` dice hacia qué lado queda el hueso (izquierda en el contorno, derecha en los agujeros).
  const loops = [extracted.shape, ...extracted.holes].map((raw, k) => {
    let loop = resample(raw, spacing * 0.6)
    if (area(loop) < 0) loop = loop.reverse()
    return { loop, solid: k === 0 ? 1 : -1 }
  })
  const caps = loops.map(({ loop, solid }) => offset(loop, rim * solid))

  // Puntos de las caras: el borde de cada cara y una grilla hexagonal por dentro.
  const points: THREE.Vector2[] = caps.flat()
  const starts: number[] = []
  caps.reduce((s, c) => (starts.push(s), s + c.length), 0)
  const box = new THREE.Box2().setFromPoints(caps[0])
  const near = caps.map((c) => new THREE.Box2().setFromPoints(c).expandByScalar(spacing))
  const rowH = (spacing * Math.sqrt(3)) / 2
  for (let r = 0, y = box.min.y + rowH / 2; y < box.max.y; r++, y += rowH)
    for (let x = box.min.x + (r % 2 ? spacing / 2 : 0); x < box.max.x; x += spacing) {
      const p = new THREE.Vector2(x, y)
      if (!inside(p, caps[0]) || caps.some((c, k) => k > 0 && near[k].containsPoint(p) && inside(p, c))) continue
      if (caps.some((c, k) => near[k].containsPoint(p) && distance(p, c) < spacing * 0.65)) continue
      points.push(p)
    }
  yield
  const centroid = new THREE.Vector2()
  const faces = (yield* delaunay(points)).filter(([a, b, c]) => {
    centroid.copy(points[a]).add(points[b]).add(points[c]).divideScalar(3)
    return inside(centroid, caps[0]) && !caps.slice(1).some((h) => inside(centroid, h))
  })

  // Vértices: cara de adelante, cara de atrás y las filas intermedias del canto.
  const m = points.length
  const pos: number[] = []
  for (const t of [1, -1]) for (const p of points) pos.push(p.x, p.y, t)
  const index: number[] = []
  for (const [a, b, c] of faces) index.push(a, b, c, a + m, c + m, b + m)
  loops.forEach(({ loop, solid }, k) => {
    const N = loop.length
    const rows: number[][] = []
    for (let j = 0; j <= rimSteps; j++) {
      if (j === 0 || j === rimSteps) {
        const base = starts[k] + (j === 0 ? 0 : m)
        rows.push(loop.map((_, i) => base + i))
        continue
      }
      const theta = (j / rimSteps) * Math.PI
      const ring = offset(loop, rim * (1 - Math.sin(theta)) * solid)
      rows.push(ring.map((p) => (pos.push(p.x, p.y, Math.cos(theta)), pos.length / 3 - 1)))
    }
    for (let j = 0; j < rimSteps; j++)
      for (let i = 0; i < N; i++) {
        const a = rows[j][i]
        const b = rows[j][(i + 1) % N]
        const c = rows[j + 1][(i + 1) % N]
        const d = rows[j + 1][i]
        // El canto mira hacia afuera del hueso.
        if (solid > 0) index.push(a, c, b, a, d, c)
        else index.push(a, b, c, a, c, d)
      }
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(index)
  return g
}
