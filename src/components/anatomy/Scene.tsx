'use client'

import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useLayoutMode } from '@/lib/layout-mode'
import { yieldToMain } from '@/lib/schedule'
import Anatomy from './Anatomy'
import { CAMERA, EXPOSURE, MAX_DPR } from './config'
import { createRenderControl, type QualityTier } from './control'
import { buildAnatomyAsync, type Anatomy as AnatomyData } from './geometry'
import Governor from './governor'
import { createNoteRegistry, NotesOverlay } from './notes'
import Pipeline from './pipeline'
import { captureStudio, type Studio as StudioEnv } from './studio'

let anatomy: Promise<AnatomyData> | null = null

/**
 * Construye el modelo (en tareas cortas) una sola vez por página. Se puede
 * llamar antes de montar la escena para tenerlo listo cuando haga falta.
 */
export function preloadAnatomy() {
  anatomy ??= buildAnatomyAsync()
  return anatomy
}

function useAnatomyData() {
  const [data, setData] = useState<AnatomyData | null>(null)
  useEffect(() => {
    let alive = true
    void preloadAnatomy().then((d) => alive && setData(d))
    return () => {
      alive = false
    }
  }, [])
  return data
}

/** Estudio: mapa de entorno generado en código (en dos tareas cortas) y las cuatro luces de apoyo. */
function Studio({ onReady }: { onReady: () => void }) {
  const { gl, scene } = useThree()
  const ready = useRef(onReady)
  ready.current = onReady
  useEffect(() => {
    let alive = true
    let env: StudioEnv | null = null
    void (async () => {
      await yieldToMain()
      if (!alive) return
      env = captureStudio(gl, scene)
      await yieldToMain()
      if (!alive) return
      env.prefilter()
      ready.current()
    })()
    return () => {
      alive = false
      env?.dispose()
    }
  }, [gl, scene])
  return (
    <>
      <hemisphereLight args={['#d6e8f7', '#002337', 0.35]} />
      <directionalLight position={[4, 6, 9]} intensity={1.6} />
      <directionalLight position={[-7, 3, -8]} intensity={2.2} color="#6fb3ff" />
      <directionalLight position={[6, -4, -6]} intensity={0.6} color="#f2b27a" />
    </>
  )
}

const GL_COMPOSER = { antialias: false, alpha: true, powerPreference: 'default' } as const
const GL_DIRECT = { antialias: true, alpha: true, powerPreference: 'default' } as const

type Props = {
  /** La zona anatómica está en pantalla (si no, no se dibuja nada). */
  running: boolean
  reduced: boolean
  /** El primer cuadro ya se dibujó: el modelo empieza a mostrarse. */
  onReady: () => void
}

/**
 * Lienzo del modelo. La preparación va por etapas, cada una en su propia tarea
 * corta: contexto WebGL → entorno → prefiltrado → modelo → shaders (en
 * paralelo) → primer cuadro invisible → fundido de entrada.
 */
export default function Scene({ running, reduced, onReady }: Props) {
  const mode = useLayoutMode()
  const data = useAnatomyData()
  const [envReady, setEnvReady] = useState(false)
  const [warm, setWarm] = useState(false)
  const [tier, setTier] = useState<QualityTier>(0)
  const [composerFailed, setComposerFailed] = useState(false)
  const notes = useMemo(createNoteRegistry, [])
  const control = useMemo(createRenderControl, [])

  // Escritorio: compositor HDR con MSAA propio y oclusión ambiental (el contexto no necesita antialias).
  // Celular y tablet: render directo con el antialias del contexto.
  const composer = mode === 'desktop' && !composerFailed

  // Si cambia el tipo de pantalla o falla el compositor, el lienzo se rehace y vuelve a prepararse.
  useEffect(() => {
    setEnvReady(false)
    setWarm(false)
  }, [composer])
  useEffect(() => {
    if (warm) onReady()
  }, [warm, onReady])

  return (
    <>
      <Canvas
        key={composer ? 'composer' : 'direct'}
        dpr={tier >= 1 ? 1 : [1, mode === 'desktop' ? MAX_DPR.desktop : MAX_DPR.mobile]}
        frameloop={running && warm ? 'demand' : 'never'}
        gl={composer ? GL_COMPOSER : GL_DIRECT}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.AgXToneMapping
          gl.toneMappingExposure = EXPOSURE
        }}
        camera={CAMERA}
        style={{
          width: '100%',
          height: '100%',
          // Entra con un fundido: el modelo aparece cuando ya está listo, no a tirones.
          opacity: warm ? 1 : 0,
          transition: reduced ? 'none' : 'opacity 900ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <Governor control={control} tier={tier} onTier={setTier} />
        <Studio onReady={() => setEnvReady(true)} />
        {data && envReady && (
          <>
            <Anatomy data={data} mode={mode} reduced={reduced} notes={notes} control={control} />
            <Pipeline
              composer={composer}
              tier={tier}
              control={control}
              onWarm={() => setWarm(true)}
              onComposerError={() => setComposerFailed(true)}
            />
          </>
        )}
      </Canvas>
      <NotesOverlay registry={notes} reduced={reduced} />
    </>
  )
}
