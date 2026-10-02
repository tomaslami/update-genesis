import type * as THREE from 'three'
import { buildAnchors } from './anchors'
import { buildChain } from './chain'
import { buildFemurs } from './femur'
import { pelvisLayout, sacrumGeometry, wingGeometry } from './pelvis'
import { buildDiscs, layoutSpine, REGIONS, TOP, vertebraTemplate } from './spine'
import { buildThorax } from './thorax'
import type { Anatomy, Region } from './types'

export type { Anatomy, Region, Vertebra } from './types'

/**
 * Modelo anatómico procedural: columna con sus curvas, vértebras con su
 * anatomía por región (cuerpo, pedículos, arco, apófisis), discos, costillas
 * con cartílago, esternón, pelvis (eco del isotipo de Génesis), sacro con
 * forámenes, cóccix y el inicio de los fémures.
 * Todo se genera en código: no hay archivo .glb que descargar.
 * Ejes: +y arriba, +z adelante (el frente del cuerpo mira a la cámara).
 *
 * La construcción es un generador que cede el control después de cada pieza:
 * `buildAnatomy` lo corre de corrido (Node, pruebas) y `buildAnatomyAsync` lo
 * reparte en tareas cortas para no bloquear el hilo principal de la página.
 */
function* anatomySteps(): Generator<void, Anatomy, void> {
  const templates = {} as Record<Region, THREE.BufferGeometry>
  for (const r of REGIONS) {
    templates[r.region] = vertebraTemplate(r.region)
    yield
  }
  const vertebrae = layoutSpine(templates)
  const discs = buildDiscs(vertebrae)
  yield
  const { ribs, cartilage } = yield* buildThorax(vertebrae)
  yield

  const pelvis = pelvisLayout(vertebrae)
  const wings: Anatomy['wings'] = []
  for (const [i, s] of [-1, 1].entries()) {
    wings.push({ geometry: wingGeometry(s), matrix: pelvis.wingMatrices[i] })
    yield
  }
  const sacrum = { geometry: sacrumGeometry(), matrix: pelvis.sacrumMatrix }
  yield
  const femurs = buildFemurs(pelvis.hips)
  yield
  const { chain, geometry: chainGeometry } = buildChain(vertebrae, pelvis.hips, pelvis.S, pelvis.zSac)
  yield

  return {
    vertebrae,
    discs,
    ribs,
    cartilage,
    sacrum,
    wings,
    femurs,
    chain,
    chainGeometry,
    anchors: buildAnchors(vertebrae, chain, pelvis.si, pelvis.hips),
    joints: [...pelvis.si, ...pelvis.hips],
    bounds: { top: TOP + 0.4, bottom: pelvis.hips[0].y - 1.45 },
  }
}

/** Construye el modelo de una sola vez. */
export function buildAnatomy(): Anatomy {
  const steps = anatomySteps()
  for (let r = steps.next(); ; r = steps.next()) if (r.done) return r.value
}

/** Tiempo máximo que se retiene el hilo principal antes de ceder el control. */
const SLICE_MS = 8

/** Cede el control al navegador para que pinte y atienda la entrada. */
function yieldToMain(): Promise<void> {
  const scheduler = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler
  if (scheduler?.yield) return scheduler.yield()
  return new Promise((resolve) => {
    const channel = new MessageChannel()
    channel.port1.onmessage = () => resolve()
    channel.port2.postMessage(null)
  })
}

/** Construye el modelo en tareas cortas, cediendo el hilo entre piezas. */
export async function buildAnatomyAsync(): Promise<Anatomy> {
  const steps = anatomySteps()
  let sliceStart = performance.now()
  for (let r = steps.next(); ; r = steps.next()) {
    if (r.done) return r.value
    if (performance.now() - sliceStart > SLICE_MS) {
      await yieldToMain()
      sliceStart = performance.now()
    }
  }
}
