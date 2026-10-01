'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import SpinePlaceholder from './SpinePlaceholder'

const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => <SpinePlaceholder />,
})

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * Escenario fijo del modelo 3D. Ocupa toda la "zona anatómica" (Hero →
 * Servicios): el lienzo queda pegado a la pantalla mientras pasan las
 * secciones y se retira al terminar Servicios.
 */
export default function AnatomyStage() {
  const zone = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [webgl, setWebgl] = useState(true)
  const [running, setRunning] = useState(true)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setWebgl(hasWebGL())
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    // El 3D se carga después del texto: el titular es lo primero que se pinta.
    const idle = window.setTimeout(() => setReady(true), 250)
    return () => {
      mq.removeEventListener('change', onChange)
      window.clearTimeout(idle)
    }
  }, [])

  useEffect(() => {
    const el = zone.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting), { rootMargin: '10% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={zone} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1]">
      <div className="sticky top-0 h-[100svh] w-full">
        {ready && webgl ? <Scene running={running} reduced={reduced} /> : <SpinePlaceholder />}
      </div>
    </div>
  )
}
