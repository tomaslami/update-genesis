import * as THREE from 'three'
import { merge, smooth, strut } from './buffers'
import type { Region, Vertebra } from './types'

/** Vértebras por región: cantidad, alto y ancho inicial/final (de arriba hacia abajo). */
export const REGIONS: { region: Region; count: number; h: number; w0: number; w1: number }[] = [
  { region: 'C', count: 7, h: 0.12, w0: 0.3, w1: 0.4 },
  { region: 'T', count: 12, h: 0.15, w0: 0.42, w1: 0.58 },
  { region: 'L', count: 5, h: 0.2, w0: 0.62, w1: 0.76 },
]
/** Espacio entre vértebras (lo ocupa el disco). */
export const GAP = 0.055
/** Ancho de referencia de cada región: se construye una sola vértebra por región y se escala. */
const REF_W: Record<Region, number> = { C: 0.35, T: 0.5, L: 0.69 }
/** Altura del borde superior de la columna. */
export const TOP = 2.4

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

/** Vértebra de referencia de una región: cuerpo, pedículos, arco, apófisis. */
export function vertebraTemplate(region: Region) {
  const w = REF_W[region]
  const h = REGIONS.find((r) => r.region === region)!.h
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

/** Posición y escala de cada vértebra (24) a lo largo de la curva sagital. */
export function layoutSpine(templates: Record<Region, THREE.BufferGeometry>): Vertebra[] {
  const vertebrae: Vertebra[] = []
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
  return vertebrae
}

/** Discos intervertebrales: levemente abombados. */
export function buildDiscs(vertebrae: Vertebra[]) {
  const discs: THREE.BufferGeometry[] = []
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
  return merge(discs)
}
