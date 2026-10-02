'use client'

import dynamic from 'next/dynamic'
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { heroIntroDone } from '@/lib/intro'
import { LAYOUT_QUERIES } from '@/lib/layout-mode'
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

/** Cuántos px de scroll tarda el visor (vertical) en volverse opaco: en el hero deja ver la foto de fondo. */
const VISOR_FADE_PX = 56

/**
 * Escenario fijo del modelo 3D. Ocupa toda la "zona anatómica" (Hero →
 * Servicios): el lienzo queda pegado a la pantalla mientras pasan las
 * secciones y se retira al terminar Servicios.
 *
 * En pantallas angostas verticales el lienzo es un visor fijo arriba, por
 * encima del texto: el texto se lee debajo y pasa por detrás del visor, así el
 * modelo nunca queda tapado (ver `.visor-bg` en globals.css).
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
  const visorBg = useRef<HTMLDivElement>(null)
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

  // Visor vertical: transparente en el hero (se ve la foto) y opaco apenas el texto empieza a subir.
  useEffect(() => {
    const bg = visorBg.current
    if (!bg) return
    const portrait = window.matchMedia(LAYOUT_QUERIES.portrait)
    let raf = 0
    let last = -1
    const update = () => {
      raf = 0
      if (!portrait.matches) return
      const k = Math.min(1, Math.max(0, window.scrollY / VISOR_FADE_PX))
      if (k === last) return
      last = k
      bg.style.opacity = String(k)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    portrait.addEventListener('change', update)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      portrait.removeEventListener('change', update)
    }
  }, [])

  const onReady = useCallback(() => setShown(true), [])
  const onError = useCallback(() => setFailed(true), [])

  return (
    <div ref={zone} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] vis:z-20">
      <div className="sticky top-0 h-[100svh] w-full vis:h-[var(--visor)]">
        {/* Bloquea los toques sobre el texto que pasa por detrás del visor. */}
        <div ref={visorBg} className="visor-bg absolute inset-0 hidden opacity-0 vis:pointer-events-auto vis:block" />
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
