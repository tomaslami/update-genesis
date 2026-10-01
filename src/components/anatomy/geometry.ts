import * as THREE from 'three'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * Modelo anatómico procedural: columna con sus curvas, vértebras con su
 * anatomía por región (cuerpo, pedículos, arco, apófisis), discos, costillas
 * con cartílago, esternón, pelvis (eco del isotipo de Génesis), sacro con
 * forámenes, cóccix y el inicio de los fémures.
 * Todo se genera en código: no hay archivo .glb que descargar.
 * Ejes: +y arriba, +z adelante (el frente del cuerpo mira a la cámara).
 */

export type Region = 'C' | 'T' | 'L'

export type Vertebra = {
  region: Region
  index: number
  y: number
  z: number
  width: number
  height: number
  /** Geometría compartida por región, escalada a esta vértebra. */
  geometry: THREE.BufferGeometry
  scale: [number, number, number]
}

export type Anatomy = {
  vertebrae: Vertebra[]
  discs: THREE.BufferGeometry
  ribs: THREE.BufferGeometry
  cartilage: THREE.BufferGeometry
  sacrum: { geometry: THREE.BufferGeometry; matrix: THREE.Matrix4 }
  wings: { geometry: THREE.BufferGeometry; matrix: THREE.Matrix4 }[]
  femurs: THREE.BufferGeometry
  chain: THREE.CatmullRomCurve3[]
  chainGeometry: THREE.BufferGeometry
  anchors: Record<string, THREE.Vector3>
  joints: THREE.Vector3[]
  bounds: { top: number; bottom: number }
}

const REGIONS: { region: Region; count: number; h: number; w0: number; w1: number }[] = [
  { region: 'C', count: 7, h: 0.12, w0: 0.3, w1: 0.4 },
  { region: 'T', count: 12, h: 0.15, w0: 0.42, w1: 0.58 },
  { region: 'L', count: 5, h: 0.2, w0: 0.62, w1: 0.76 },
]
const GAP = 0.055
/** Ancho de referencia de cada región: se construye una sola vértebra por región y se escala. */
const REF_W: Record<Region, number> = { C: 0.35, T: 0.5, L: 0.69 }
const TOP = 2.4

/** Curvas sagitales: lordosis cervical, cifosis dorsal, lordosis lumbar. */
const SAGITTAL: [number, number][] = [
  [0, 0.04],
  [0.1, 0.17],
  [0.2, 0.07],
  [0.45, -0.2],
  [0.68, 0.0],
  [0.86, 0.17],
  [1, 0.05],
]

function sagittal(t: number) {
  for (let i = 0; i < SAGITTAL.length - 1; i++) {
    const [t0, z0] = SAGITTAL[i]
    const [t1, z1] = SAGITTAL[i + 1]
    if (t <= t1) {
      const k = (1 - Math.cos(((t - t0) / (t1 - t0)) * Math.PI)) / 2
      return z0 + (z1 - z0) * k
    }
  }
  return SAGITTAL[SAGITTAL.length - 1][1]
}

// ——— utilidades de geometría ———

const flat = (g: THREE.BufferGeometry) => (g.index ? g.toNonIndexed() : g)

/** Une piezas en una sola geometría (todas con posición y normal, sin uv). */
function merge(parts: THREE.BufferGeometry[]) {
  return mergeGeometries(
    parts.map((p) => {
      const g = flat(p)
      if (g.hasAttribute('uv')) g.deleteAttribute('uv')
      return g
    }),
  )!
}

/** Sombreado suave: suelda vértices y recalcula normales promediadas. */
function smooth(g: THREE.BufferGeometry, tolerance = 1e-4) {
  g.deleteAttribute('normal')
  g.deleteAttribute('uv')
  const m = mergeVertices(g, tolerance)
  m.computeVertexNormals()
  return m
}

const up = new THREE.Vector3(0, 1, 0)

/** Cilindro (opcionalmente cónico) entre dos puntos, con extremos redondeados. */
function strut(a: THREE.Vector3, b: THREE.Vector3, ra: number, rb = ra) {
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
function sweep(
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

// ——— vértebra ———

/** Sección del cuerpo vertebral: óvalo con el borde posterior cóncavo (forma de riñón). */
function bodyShape(w: number, d: number) {
  const shape = new THREE.Shape()
  const n = 28
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2
    const x = (w / 2) * Math.cos(t)
    let z = (d / 2) * Math.sin(t)
    if (z < 0) z += 0.2 * d * Math.pow(1 - Math.abs(Math.cos(t)), 2)
    // La forma vive en XY; luego se gira para que y pase a ser z.
    if (i === 0) shape.moveTo(x, -z)
    else shape.lineTo(x, -z)
  }
  return shape
}

function vertebraGeometry(region: Region, w: number, h: number) {
  const d = w * (region === 'C' ? 0.62 : region === 'T' ? 0.78 : 0.7)
  const parts: THREE.BufferGeometry[] = []

  // Cuerpo vertebral con bordes redondeados (platillos).
  const body = new THREE.ExtrudeGeometry(bodyShape(w, d), {
    depth: h * 0.76,
    bevelEnabled: true,
    bevelThickness: h * 0.12,
    bevelSize: w * 0.045,
    bevelSegments: 2,
    curveSegments: 28,
  })
  body.rotateX(-Math.PI / 2)
  body.translate(0, -h * 0.38, 0)
  parts.push(smooth(body))

  // Pedículos y arco posterior (rodea el agujero vertebral).
  const fw = w * (region === 'T' ? 0.2 : region === 'C' ? 0.32 : 0.27)
  const back = -d / 2
  const pedA = (s: number) => new THREE.Vector3(s * w * 0.27, 0, back + d * 0.12)
  const pedB = (s: number) => new THREE.Vector3(s * (fw + w * 0.04), 0, back - d * 0.18)
  const lamTop = new THREE.Vector3(0, -h * 0.05, back - d * (region === 'T' ? 0.42 : 0.5))
  for (const s of [-1, 1]) {
    parts.push(...strut(pedA(s), pedB(s), h * 0.17, h * 0.15))
    parts.push(...strut(pedB(s), lamTop, h * 0.15, h * 0.14))
  }

  // Apófisis articulares: superiores e inferiores (las carillas que encastran).
  for (const s of [-1, 1]) {
    const base = pedB(s)
    parts.push(...strut(base, base.clone().add(new THREE.Vector3(0, h * 0.55, -h * 0.05)), h * 0.12, h * 0.1))
    parts.push(...strut(base, base.clone().add(new THREE.Vector3(0, -h * 0.55, -h * 0.12)), h * 0.12, h * 0.1))
  }

  // Apófisis espinosa: dorsal larga e inclinada, lumbar corta y en hacha, cervical bífida.
  const tilt = region === 'T' ? 0.85 : region === 'C' ? 0.3 : 0.12
  const len = region === 'C' ? w * 0.5 : region === 'T' ? w * 0.75 : w * 0.55
  const tip = lamTop.clone().add(new THREE.Vector3(0, -Math.sin(tilt) * len, -Math.cos(tilt) * len))
  if (region === 'L') {
    const hatchet = new THREE.SphereGeometry(1, 12, 8)
    hatchet.scale(h * 0.1, h * 0.42, len * 0.5)
    hatchet.translate(0, (lamTop.y + tip.y) / 2, (lamTop.z + tip.z) / 2)
    parts.push(hatchet)
  } else if (region === 'C') {
    for (const s of [-1, 1]) parts.push(...strut(lamTop, tip.clone().add(new THREE.Vector3(s * h * 0.25, 0, 0)), h * 0.12, h * 0.08))
  } else {
    parts.push(...strut(lamTop, tip, h * 0.15, h * 0.06))
  }

  // Apófisis transversas.
  const tLen = region === 'L' ? w * 0.3 : region === 'T' ? w * 0.24 : w * 0.16
  for (const s of [-1, 1]) {
    const from = pedB(s).clone().add(new THREE.Vector3(0, 0, d * 0.05))
    const to = new THREE.Vector3(
      s * (fw + w * 0.04 + tLen),
      region === 'T' ? h * 0.1 : 0,
      back - d * (region === 'T' ? 0.32 : 0.12),
    )
    parts.push(...strut(from, to, h * 0.2, h * (region === 'T' ? 0.17 : 0.13)))
  }

  return merge(parts)
}

// ——— pelvis ———

const WING_SCALE = 0.8
const WING_BEND = 0.32
/** Curva el ala para que forme un cuenco (la fosa ilíaca). */
const wingBend = (s: number, x: number) => WING_BEND * Math.pow(x - s * 0.62, 2)

/** Punto del ala (en coordenadas del isotipo) en el espacio local del ala. */
function wingLocal(s: number, x: number, y: number, z = 0.06) {
  const lx = s * (x / 100 - 0.46) * WING_SCALE
  return new THREE.Vector3(lx, (-y / 100 + 0.08) * WING_SCALE, z + wingBend(s, lx))
}

function wingShape(s: number) {
  // Ala ilíaca, trazada a partir del isotipo. Coordenadas relativas al
  // punto de unión con el sacro; s = -1 izquierda, 1 derecha.
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

function sacrumGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.44, 0)
  shape.bezierCurveTo(-0.44, -0.4, -0.2, -0.9, 0, -1.04)
  shape.bezierCurveTo(0.2, -0.9, 0.44, -0.4, 0.44, 0)
  shape.closePath()
  // Forámenes sacros: cuatro pares que se achican hacia abajo.
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

// ——— modelo completo ———

export function buildAnatomy(): Anatomy {
  const templates = Object.fromEntries(
    REGIONS.map((r) => [r.region, vertebraGeometry(r.region, REF_W[r.region], r.h)]),
  ) as Record<Region, THREE.BufferGeometry>
  const vertebrae: Vertebra[] = []
  const discs: THREE.BufferGeometry[] = []
  let y = TOP
  let i = 0
  const total = REGIONS.reduce((n, r) => n + r.count, 0)
  for (const reg of REGIONS) {
    for (let k = 0; k < reg.count; k++) {
      const width = reg.w0 + ((reg.w1 - reg.w0) * k) / Math.max(reg.count - 1, 1)
      const yc = y - reg.h / 2
      const z = sagittal(i / (total - 1))
      vertebrae.push({
        region: reg.region,
        index: i,
        y: yc,
        z,
        width,
        height: reg.h,
        geometry: templates[reg.region],
        scale: [width / REF_W[reg.region], 1, width / REF_W[reg.region]],
      })
      y -= reg.h + GAP
      i++
    }
  }

  // Discos intervertebrales: levemente abombados.
  for (let j = 0; j < vertebrae.length - 1; j++) {
    const a = vertebrae[j]
    const b = vertebrae[j + 1]
    const r = ((a.width + b.width) / 4) * 0.9
    const hh = GAP * 0.95
    const profile = [
      new THREE.Vector2(0, -hh / 2),
      new THREE.Vector2(r * 0.94, -hh / 2),
      new THREE.Vector2(r * 1.03, 0),
      new THREE.Vector2(r * 0.94, hh / 2),
      new THREE.Vector2(0, hh / 2),
    ]
    const g = new THREE.LatheGeometry(profile, 20)
    g.scale(1, 1, 0.72)
    g.translate(0, (a.y - a.height / 2 + b.y + b.height / 2) / 2, (a.z + b.z) / 2)
    discs.push(g)
  }

  // Costillas T1–T10: planas, afinadas hacia adelante, con cartílago costal.
  const ribW = [0.7, 0.92, 1.08, 1.18, 1.24, 1.26, 1.24, 1.18, 1.08, 0.96]
  const ribDrop = [0.22, 0.3, 0.38, 0.46, 0.54, 0.6, 0.66, 0.7, 0.72, 0.7]
  const ribs: THREE.BufferGeometry[] = []
  const cartilage: THREE.BufferGeometry[] = []
  const sternumTop = vertebrae[7].y - 0.12
  const sternumZ = vertebrae[7].z + 0.9
  for (let j = 0; j < 10; j++) {
    const v = vertebrae[7 + j]
    const W = ribW[j]
    const dr = ribDrop[j]
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
  }
  // Esternón: manubrio y cuerpo, plano.
  const st = new THREE.Shape()
  st.moveTo(-0.13, 0)
  st.bezierCurveTo(-0.16, -0.12, -0.08, -0.22, -0.09, -0.32)
  st.lineTo(-0.11, -0.95)
  st.bezierCurveTo(-0.1, -1.05, -0.03, -1.12, 0, -1.16)
  st.bezierCurveTo(0.03, -1.12, 0.1, -1.05, 0.11, -0.95)
  st.lineTo(0.09, -0.32)
  st.bezierCurveTo(0.08, -0.22, 0.16, -0.12, 0.13, 0)
  st.closePath()
  const sternum = new THREE.ExtrudeGeometry(st, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 3,
  })
  sternum.rotateX(-0.18)
  sternum.translate(0, sternumTop, sternumZ - 0.02)
  cartilage.push(smooth(sternum))

  // Pelvis.
  const last = vertebrae[vertebrae.length - 1]
  const S = last.y - last.height / 2 - GAP
  const zSac = last.z - 0.1

  const sacMatrix = new THREE.Matrix4().compose(
    new THREE.Vector3(0, S, zSac - 0.05),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0.35, 0, 0)),
    new THREE.Vector3(1, 1, 1),
  )

  const wings = [-1, 1].map((s) => {
    const matrix = new THREE.Matrix4().compose(
      new THREE.Vector3(s * 0.46, S - 0.08, zSac),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.25, -s * 0.85, 0)),
      new THREE.Vector3(1, 1, 1),
    )
    return { geometry: wingShape(s), matrix, s }
  })

  const hips = wings.map(({ matrix, s }) => wingLocal(s, 138, 122).applyMatrix4(matrix))
  const si = wings.map(({ matrix, s }) => wingLocal(s, 50, 30).applyMatrix4(matrix))

  // Fémures: cabeza, cuello, trocánteres y diáfisis con su leve curva.
  const femurParts: THREE.BufferGeometry[] = []
  hips.forEach((h, idx) => {
    const s = idx === 0 ? -1 : 1
    const head = new THREE.SphereGeometry(0.17, 20, 14)
    head.translate(h.x, h.y, h.z)
    const neckEnd = new THREE.Vector3(h.x + s * 0.24, h.y - 0.13, h.z - 0.06)
    femurParts.push(head, ...strut(h, neckEnd, 0.085, 0.1))
    const troch = new THREE.SphereGeometry(1, 12, 10)
    troch.scale(0.12, 0.15, 0.11)
    troch.translate(h.x + s * 0.33, h.y - 0.1, h.z - 0.1)
    const lesser = new THREE.SphereGeometry(0.055, 8, 6)
    lesser.translate(h.x + s * 0.2, h.y - 0.32, h.z - 0.1)
    femurParts.push(troch, lesser)
    const shaft = new THREE.CatmullRomCurve3([
      new THREE.Vector3(h.x + s * 0.3, h.y - 0.16, h.z - 0.06),
      new THREE.Vector3(h.x + s * 0.27, h.y - 0.7, h.z + 0.02),
      new THREE.Vector3(h.x + s * 0.18, h.y - 1.45, h.z + 0.05),
    ])
    femurParts.push(sweep(shaft, 20, 12, (u) => [0.095 - 0.02 * Math.sin(Math.PI * u), 0.09 - 0.02 * Math.sin(Math.PI * u)]))
    const end = new THREE.SphereGeometry(0.08, 12, 8)
    end.translate(h.x + s * 0.18, h.y - 1.45, h.z + 0.05)
    femurParts.push(end)
  })
  const femurs = merge(femurParts)

  // Cadena muscular posterior (RPG): de la nuca a las piernas.
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
  const chainGeometry = merge(chain.map((c) => new THREE.TubeGeometry(c, 90, 0.03, 6)))

  const v = (j: number) => vertebrae[j]
  const L45y = (v(22).y - v(22).height / 2 + v(23).y + v(23).height / 2) / 2
  const anchors: Record<string, THREE.Vector3> = {
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

  return {
    vertebrae,
    discs: merge(discs),
    ribs: merge(ribs),
    cartilage: merge(cartilage),
    sacrum: { geometry: sacrumGeometry(), matrix: sacMatrix },
    wings: wings.map(({ geometry, matrix }) => ({ geometry, matrix })),
    femurs,
    chain,
    chainGeometry,
    anchors,
    joints: [...si, ...hips],
    bounds: { top: TOP + 0.4, bottom: hips[0].y - 1.45 },
  }
}
