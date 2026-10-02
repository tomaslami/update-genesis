'use client'

import { useFrame, useThree } from '@react-three/fiber'
import type { EffectComposer } from 'postprocessing'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { N8AOPostPass } from 'n8ao'
import { yieldToMain } from '@/lib/schedule'
import type { QualityTier, RenderControl } from './control'
import { damp } from './damp'

/**
 * Pipeline de render. En escritorio la escena se dibuja en un buffer HDR con
 * MSAA 4×, se le aplica oclusión ambiental (N8AO) y se pasa a pantalla con tono
 * AgX. En celular y tablet se dibuja directo (sin compositor): ahí ni siquiera se
 * descargan `postprocessing` ni N8AO (se cargan bajo demanda, ver desktop-prefetch.ts).
 *
 * Preparación (antes de mostrar el modelo, con el lienzo todavía invisible):
 *  1. se arma el compositor y se le agrega N8AO (ya precargado), así su
 *     configuración es la definitiva y nada se recompila después;
 *  2. los shaders de la escena se compilan en paralelo;
 *  3. se dibuja un primer cuadro: termina de compilar el compositor y N8AO y
 *     sube los buffers a la GPU. Cuando el modelo aparece, ya no queda nada pesado.
 *
 * La oclusión se apaga mientras la cámara viaja entre dos poses (el cuadro cuesta
 * menos de la mitad y el scroll queda fluido) y vuelve con un fundido al llegar:
 * con el modelo quieto la imagen es exactamente la de siempre.
 */

const AO = { radius: 0.3, falloff: 0.6, intensity: 1.5 }
/** Segundos de suavizado del fundido de la oclusión (aparece despacio, se va rápido). */
const AO_FADE_IN = 0.25
const AO_FADE_OUT = 0.1

type AOState = { pass: N8AOPostPass; level: number }

type Props = {
  /** Compositor con oclusión (escritorio). Si es false se dibuja directo. */
  composer: boolean
  tier: QualityTier
  control: RenderControl
  /** El primer cuadro (invisible) ya está dibujado: se puede mostrar el modelo. */
  onWarm: () => void
  /** El compositor no pudo crearse (p. ej. sin render HDR): hay que volver al render directo. */
  onComposerError: () => void
}

/** Mallas de pantalla completa que N8AO usa internamente (para compilarlas por adelantado). */
function internalQuads(pass: N8AOPostPass) {
  return Object.values(pass as unknown as Record<string, { _mesh?: THREE.Mesh } | undefined>)
    .map((v) => v?._mesh)
    .filter((m): m is THREE.Mesh => !!m && (m as THREE.Mesh).isMesh)
}

/**
 * Compila en paralelo (sin bloquear el hilo principal) los shaders del
 * compositor: los de N8AO, que dibujan en buffers intermedios, y el del tono,
 * que dibuja en pantalla. Si algo no se puede adelantar, se compila al primer uso.
 */
async function precompilePost(
  gl: THREE.WebGLRenderer,
  composer: EffectComposer,
  ao: N8AOPostPass | null,
  EffectPass: typeof import('postprocessing').EffectPass,
) {
  const jobs: Promise<unknown>[] = []
  const ortho = new THREE.OrthographicCamera()
  try {
    if (ao) {
      gl.setRenderTarget(composer.inputBuffer)
      for (const quad of internalQuads(ao)) jobs.push(gl.compileAsync(quad, ortho))
    }
    gl.setRenderTarget(null)
    const fx = composer.passes.find((p) => p instanceof EffectPass) as unknown as
      | { updateMaterial?: () => void; scene: THREE.Scene; camera: THREE.Camera }
      | undefined
    if (fx?.updateMaterial) {
      fx.updateMaterial()
      jobs.push(gl.compileAsync(fx.scene, fx.camera))
    }
    await Promise.all(jobs)
  } catch {
    /* se compilarán al primer uso */
  } finally {
    gl.setRenderTarget(null)
  }
}

/** Oclusión ambiental con la misma configuración visual de siempre. */
function createAmbientOcclusion(N8AO: typeof N8AOPostPass, scene: THREE.Scene, camera: THREE.Camera) {
  const pass = new N8AO(scene, camera)
  const c = pass.configuration
  c.aoRadius = AO.radius
  c.distanceFalloff = AO.falloff
  c.intensity = AO.intensity
  c.halfRes = true
  c.depthAwareUpsampling = true
  pass.setQualityMode('Performance')
  return pass
}

export default function Pipeline({ composer: useComposer, tier, control, onWarm, onComposerError }: Props) {
  const { gl, scene, camera, invalidate } = useThree()
  const live = useRef<{ composer: EffectComposer | null; ao: AOState | null; size: [number, number, number] }>({
    composer: null,
    ao: null,
    size: [-1, -1, -1],
  })
  const tierRef = useRef(tier)
  tierRef.current = tier
  const warm = useRef(onWarm)
  warm.current = onWarm
  const fail = useRef(onComposerError)
  fail.current = onComposerError

  useEffect(() => {
    let alive = true
    const state = live.current
    const toneMapping = gl.toneMapping
    let composer: EffectComposer | null = null

    const draw = () => {
      if (!composer) return gl.render(scene, camera)
      const autoClear = gl.autoClear
      gl.autoClear = true
      composer.render(1 / 60)
      gl.autoClear = autoClear
    }

    void (async () => {
      // Cada paso en su propia tarea corta.
      await yieldToMain()
      if (!alive) return
      let ao: N8AOPostPass | null = null
      let EffectPassClass: typeof import('postprocessing').EffectPass | null = null
      if (useComposer) {
        try {
          const { loadPostprocessing, loadAmbientOcclusion } = await import('./desktop-prefetch')
          const pp = await loadPostprocessing()
          if (!alive) return
          // El tono lo aplica el compositor al final: el renderer no debe aplicarlo antes.
          gl.toneMapping = THREE.NoToneMapping
          composer = new pp.EffectComposer(gl, { multisampling: 4, frameBufferType: THREE.HalfFloatType })
          composer.addPass(new pp.RenderPass(scene, camera))
          composer.addPass(new pp.EffectPass(camera, new pp.ToneMappingEffect({ mode: pp.ToneMappingMode.AGX })))
          const s = gl.getSize(new THREE.Vector2())
          composer.setSize(s.x, s.y)
          EffectPassClass = pp.EffectPass
          state.composer = composer
          try {
            const { N8AOPostPass } = await loadAmbientOcclusion()
            if (!alive) return
            ao = createAmbientOcclusion(N8AOPostPass, scene, camera)
            composer.addPass(ao, 1)
          } catch {
            /* sin oclusión ambiental: el modelo se ve igual salvo por las sombras de contacto */
          }
        } catch {
          composer?.dispose()
          composer = null
          state.composer = null
          gl.toneMapping = toneMapping
          if (alive) fail.current()
          return
        }
        await yieldToMain()
        if (!alive) return
      }
      try {
        // Shaders de la escena en paralelo, para el destino real (buffer HDR o pantalla).
        if (composer) gl.setRenderTarget(composer.inputBuffer)
        await gl.compileAsync(scene, camera)
      } catch {
        /* sin compilación asíncrona: el primer cuadro compila de forma normal */
      } finally {
        gl.setRenderTarget(null)
      }
      if (!alive) return
      if (composer && EffectPassClass) await precompilePost(gl, composer, ao, EffectPassClass)
      if (!alive) return
      await yieldToMain()
      if (!alive) return
      draw() // primer cuadro, aún invisible (con oclusión, para que todo quede compilado)
      state.ao = ao ? { pass: ao, level: 1 } : null
      warm.current()
    })()

    return () => {
      alive = false
      state.composer = null
      state.ao = null
      if (composer) {
        composer.dispose()
        gl.toneMapping = toneMapping
      }
    }
  }, [gl, scene, camera, useComposer])

  const sizeVec = useRef(new THREE.Vector2())

  // Priority 1 en escritorio: este callback hace el render y R3F no dibuja por su cuenta.
  useFrame((_, delta) => {
    const { composer, ao, size } = live.current
    if (!composer) return

    // Mantener el compositor del tamaño del lienzo (cambia con la ventana y con la resolución).
    gl.getSize(sizeVec.current)
    const pr = gl.getPixelRatio()
    if (sizeVec.current.x !== size[0] || sizeVec.current.y !== size[1] || pr !== size[2]) {
      composer.setSize(sizeVec.current.x, sizeVec.current.y)
      size[0] = sizeVec.current.x
      size[1] = sizeVec.current.y
      size[2] = pr
    }

    if (ao) {
      const t = tierRef.current
      const want = t >= 2 || control.busy ? 0 : 1
      const dt = delta > 0.1 ? 1 / 60 : delta
      const fading = damp(ao, 'level', want, want ? AO_FADE_IN : AO_FADE_OUT, dt)
      ao.pass.enabled = ao.level > 0.001
      if (ao.pass.enabled) ao.pass.configuration.intensity = AO.intensity * ao.level
      if (fading) invalidate()
    }

    const autoClear = gl.autoClear
    gl.autoClear = true
    composer.render(delta)
    gl.autoClear = autoClear
  }, useComposer ? 1 : 0)

  return null
}
