'use client'

import dynamic from 'next/dynamic'
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { heroIntroDone } from '@/lib/intro'
import { wait } from '@/lib/schedule'
import SpinePlaceholder from './SpinePlaceholder'

// El 3D vive en su propio paquete. `webpackPrefetch`: el navegador lo descarga en
// segundo plano apenas carga la página, pero recién se ejecuta al montarse.
const Scene = dynamic(() => import(/* webpackPrefetch: true */ './Scene'), { ssr: false })

/** Si el dispositivo no puede crear el contexto WebGL, la columna 2D queda como respaldo. */
class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

const hasWebGLApi = () => typeof WebGL2RenderingContext !== 'undefined' || typeof WebGLRenderingContext !== 'undefined'

/**
 * Escenario fijo del modelo 3D. Ocupa toda la "zona anatómica" (Hero →
 * Servicios): el lienzo queda pegado a la pantalla mientras pasan las
 * secciones y se retira al terminar Servicios.
 *
 * Mientras el modelo se prepara se ve la columna 2D. El modelo se muestra
 * cuando está listo y la columna terminó de dibujarse (más una pausa breve):
 * entra con un fundido en el mismo lugar del dibujo, que se desvanece mientras
 * la columna 3D se arma.
 *
 * Coreografía de carga: el paquete 3D se descarga enseguida en segundo plano,
 * pero se ejecuta (y se prepara la GPU) recién cuando terminó la animación de
 * entrada del hero: así nada le quita cuadros al titular.
 */
/** Pausa entre que la columna 2D termina de dibujarse y empieza a entrar el modelo. */
const REVEAL_PAUSE_MS = 250

export default function AnatomyStage() {
  const zone = useRef<HTMLDivElement>(null)
  const [load, setLoad] = useState(false)
  const [running, setRunning] = useState(true)
  const [reduced, setReduced] = useState(false)
  const [ready, setReady] = useState(false)
  const [drawn, setDrawn] = useState(false)
  const [reveal, setReveal] = useState(false)
  const [failed, setFailed] = useState(false)
  const [placeholderGone, setPlaceholderGone] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    let alive = true
    // Escritorio: descarga en segundo plano del compositor y la oclusión ambiental.
    if (window.matchMedia('(min-width: 1024px)').matches) void import('./desktop-prefetch')
    // El lienzo, cuando termina la entrada del hero (o a lo sumo a los 3 s).
    void Promise.race([heroIntroDone(), wait(3000)]).then(() => alive && setLoad(true))
    return () => {
      alive = false
      mq.removeEventListener('change', onChange)
    }
  }, [])

  useEffect(() => {
    const el = zone.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting), { rootMargin: '10% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!ready || !drawn) return
    const id = window.setTimeout(() => setReveal(true), REVEAL_PAUSE_MS)
    return () => window.clearTimeout(id)
  }, [ready, drawn])

  const onReady = useCallback(() => setReady(true), [])
  const onDrawn = useCallback(() => setDrawn(true), [])
  const onError = useCallback(() => setFailed(true), [])

  return (
    <div ref={zone} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1]">
      <div className="sticky top-0 h-[100svh] w-full">
        {!placeholderGone && (
          <div
            className="absolute inset-0 transition-opacity delay-150 duration-1000 ease-in-out motion-reduce:transition-none"
            style={{ opacity: reveal ? 0 : 1 }}
            onTransitionEnd={() => reveal && setPlaceholderGone(true)}
          >
            <SpinePlaceholder onDrawn={onDrawn} />
          </div>
        )}
        {load && !failed && hasWebGLApi() && (
          <SceneBoundary onError={onError}>
            <Scene running={running} reduced={reduced} onReady={onReady} reveal={reveal} />
          </SceneBoundary>
        )}
      </div>
    </div>
  )
}
