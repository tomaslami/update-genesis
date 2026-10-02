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
 * Mientras el modelo se prepara se ve la columna 2D; cuando el primer cuadro
 * está listo, la columna se funde y el modelo entra con su animación.
 *
 * Coreografía de carga: el paquete 3D se descarga enseguida en segundo plano,
 * pero se ejecuta (y se prepara la GPU) recién cuando terminó la animación de
 * entrada del hero: así nada le quita cuadros al titular.
 */
export default function AnatomyStage() {
  const zone = useRef<HTMLDivElement>(null)
  const [load, setLoad] = useState(false)
  const [running, setRunning] = useState(true)
  const [reduced, setReduced] = useState(false)
  const [shown, setShown] = useState(false)
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

  const onReady = useCallback(() => setShown(true), [])
  const onError = useCallback(() => setFailed(true), [])

  return (
    <div ref={zone} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1]">
      <div className="sticky top-0 h-[100svh] w-full">
        {!placeholderGone && (
          <div
            className="absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none"
            style={{ opacity: shown ? 0 : 1 }}
            onTransitionEnd={() => shown && setPlaceholderGone(true)}
          >
            <SpinePlaceholder />
          </div>
        )}
        {load && !failed && hasWebGLApi() && (
          <SceneBoundary onError={onError}>
            <Scene running={running} reduced={reduced} onReady={onReady} />
          </SceneBoundary>
        )}
      </div>
    </div>
  )
}
