import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * Modelo anatómico procedural: columna con sus curvas, vértebras, discos,
 * costillas, pelvis (eco del isotipo de Génesis) y el inicio de los fémures.
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
  geometry: THREE.BufferGeometry
}

export type Anatomy = {
  vertebrae: Vertebra[]
  discs: THREE.BufferGeometry
  ribs: THREE.BufferGeometry
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

function capsuleBetween(a: THREE.Vector3, b: THREE.Vector3, radius: number) {
  const dir = new THREE.Vector3().subVectors(b, a)
  const len = dir.length()
  const g = new THREE.CapsuleGeometry(radius, Math.max(len - radius * 2, 0.001), 4, 10)
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()))
  g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2)
  return g
}

function vertebraGeometry(region: Region, w: number, h: number) {
  const r = w / 2
  const depth = 0.78
  // Cuerpo vertebral: torneado con bordes redondeados y cintura.
  const profile = [
    new THREE.Vector2(0, -h / 2),
    new THREE.Vector2(r * 0.9, -h / 2),
    new THREE.Vector2(r, -h / 2 + h * 0.16),
    new THREE.Vector2(r * 0.9, 0),
    new THREE.Vector2(r, h / 2 - h * 0.16),
    new THREE.Vector2(r * 0.9, h / 2),
    new THREE.Vector2(0, h / 2),
  ]
  const body = new THREE.LatheGeometry(profile, 28)
  body.scale(1, 1, depth)

  // Arco posterior.
  const archR = r * 0.52
  const arch = new THREE.TorusGeometry(archR, h * 0.17, 8, 20, Math.PI)
  arch.rotateX(-Math.PI / 2)
  const archZ = -r * depth * 0.82
  arch.translate(0, 0, archZ)
  const archBack = archZ - archR

  // Apófisis espinosa: hacia atrás y abajo (más inclinada en dorsales).
  const tilt = region === 'T' ? 0.75 : region === 'C' ? 0.35 : 0.15
  const spineLen = region === 'C' ? w * 0.55 : w * 0.6
  const spinousEnd = new THREE.Vector3(0, -Math.sin(tilt) * spineLen, archBack - Math.cos(tilt) * spineLen)
  const spinous = capsuleBetween(new THREE.Vector3(0, 0, archBack + 0.02), spinousEnd, h * 0.14)

  // Apófisis transversas.
  const tLen = region === 'L' ? w * 0.3 : w * 0.24
  const tBack = region === 'T' ? -0.08 : -0.02
  const transverse = [-1, 1].map((s) =>
    capsuleBetween(
      new THREE.Vector3(s * archR * 0.8, 0, archZ - archR * 0.3),
      new THREE.Vector3(s * (archR + tLen), region === 'T' ? 0.02 : 0, archZ - archR * 0.3 + tBack),
      h * 0.15,
    ),
  )

  const merged = mergeGeometries([body, arch, spinous, ...transverse].map((g) => g.toNonIndexed()))!
  merged.computeVertexNormals()
  return merged
}

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
    depth: 0.07,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.035,
    bevelSegments: 4,
    curveSegments: 28,
  })
  g.translate(0, 0, -0.035)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getZ(i) + wingBend(s, pos.getX(i)))
  g.computeVertexNormals()
  return g
}

export function buildAnatomy(): Anatomy {
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
        geometry: vertebraGeometry(reg.region, width, reg.h),
      })
      y -= reg.h + GAP
      i++
    }
  }
  for (let j = 0; j < vertebrae.length - 1; j++) {
    const a = vertebrae[j]
    const b = vertebrae[j + 1]
    const r = ((a.width + b.width) / 4) * 0.92
    const g = new THREE.CylinderGeometry(r, r, GAP * 0.9, 24)
    g.scale(1, 1, 0.78)
    g.translate(0, (a.y - a.height / 2 + b.y + b.height / 2) / 2, (a.z + b.z) / 2)
    discs.push(g)
  }

  // Costillas T1–T10 y esternón.
  const ribW = [0.7, 0.92, 1.08, 1.18, 1.24, 1.26, 1.24, 1.18, 1.08, 0.96]
  const ribDrop = [0.22, 0.3, 0.38, 0.46, 0.54, 0.6, 0.66, 0.7, 0.72, 0.7]
  const ribs: THREE.BufferGeometry[] = []
  for (let j = 0; j < 10; j++) {
    const v = vertebrae[7 + j]
    const W = ribW[j]
    const d = ribDrop[j]
    const front = j < 7
    for (const s of [-1, 1]) {
      const pts = [
        new THREE.Vector3(s * (v.width / 2 + 0.08), v.y, v.z - 0.18),
        new THREE.Vector3(s * W * 0.62, v.y + 0.04, v.z - 0.42),
        new THREE.Vector3(s * W, v.y - d * 0.25, v.z + 0.05),
        new THREE.Vector3(s * W * 0.78, v.y - d * 0.7, v.z + 0.62),
        front
          ? new THREE.Vector3(s * 0.22, v.y - d, v.z + 0.84)
          : new THREE.Vector3(s * W * 0.5, v.y - d * 0.95, v.z + 0.78),
      ]
      ribs.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.024, 6))
    }
  }

  // Pelvis.
  const last = vertebrae[vertebrae.length - 1]
  const S = last.y - last.height / 2 - GAP
  const zSac = last.z - 0.1

  const sacShape = new THREE.Shape()
  sacShape.moveTo(-0.44, 0)
  sacShape.bezierCurveTo(-0.44, -0.4, -0.2, -0.9, 0, -1.04)
  sacShape.bezierCurveTo(0.2, -0.9, 0.44, -0.4, 0.44, 0)
  sacShape.closePath()
  const sacGeo = new THREE.ExtrudeGeometry(sacShape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 4,
    curveSegments: 24,
  })
  sacGeo.translate(0, 0, -0.07)
  sacGeo.computeVertexNormals()
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

  // Puntos de referencia en el espacio de cada ala.
  const hips = wings.map(({ matrix, s }) => wingLocal(s, 138, 122).applyMatrix4(matrix))
  const si = wings.map(({ matrix, s }) => wingLocal(s, 50, 30).applyMatrix4(matrix))

  // Fémures: cabeza, cuello, trocánter y diáfisis.
  const femurParts: THREE.BufferGeometry[] = []
  hips.forEach((h, idx) => {
    const s = idx === 0 ? -1 : 1
    const head = new THREE.SphereGeometry(0.17, 24, 16)
    head.translate(h.x, h.y, h.z)
    const troch = new THREE.Vector3(h.x + s * 0.3, h.y - 0.16, h.z - 0.08)
    const trochG = new THREE.SphereGeometry(0.11, 16, 12)
    trochG.translate(troch.x, troch.y, troch.z)
    const knee = new THREE.Vector3(h.x + s * 0.1, h.y - 1.45, h.z + 0.05)
    femurParts.push(head, trochG, capsuleBetween(h, troch, 0.075), capsuleBetween(troch, knee, 0.08))
  })
  const femurs = mergeGeometries(femurParts.map((g) => g.toNonIndexed()))!

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
  const chainGeometry = mergeGeometries(
    chain.map((c) => new THREE.TubeGeometry(c, 160, 0.03, 8).toNonIndexed()),
  )!

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
    discs: mergeGeometries(discs.map((g) => g.toNonIndexed()))!,
    ribs: mergeGeometries(ribs.map((g) => g.toNonIndexed()))!,
    sacrum: { geometry: sacGeo, matrix: sacMatrix },
    wings: wings.map(({ geometry, matrix }) => ({ geometry, matrix })),
    femurs,
    chain,
    chainGeometry,
    anchors,
    joints: [...si, ...hips],
    bounds: { top: TOP + 0.4, bottom: hips[0].y - 1.45 },
  }
}
