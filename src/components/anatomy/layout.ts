import { useEffect, useRef, type MutableRefObject } from 'react'
import { LAYOUT_QUERIES } from '@/lib/layout-mode'
import { ZONE } from './config'

/**
 * Posiciones de la página (en coordenadas del documento) que necesita la
 * escena. Se miden una vez y solo se vuelven a medir si cambia el tamaño de
 * la página: leer el layout en cada cuadro trabaría el scroll.
 */
export type Layout = {
  zoneTop: number
  zoneHeight: number
  centers: number[]
  texts: { l: number; r: number; t: number; b: number }[]
}

export function measureLayout(): Layout | null {
  const sy = window.scrollY
  const secs = ZONE.map((id) => document.getElementById(id))
  if (secs.some((el) => !el)) return null
  // En vertical el titular y el modelo están en la parte de arriba de cada sección (el cuerpo del texto
  // va en un panel debajo): la pose cambia cuando esa parte llega a la pantalla, no al centro de la sección.
  const portrait = window.matchMedia(LAYOUT_QUERIES.portrait).matches
  const centers = secs.map((el) => {
    const r = el!.getBoundingClientRect()
    return r.top + sy + (portrait ? Math.min(window.innerHeight * 0.55, r.height / 2) : r.height / 2)
  })
  const zone = secs[0]!.parentElement!.getBoundingClientRect()
  // Bloques de texto reales (títulos, párrafos, listas), sin el relleno del panel.
  const texts: Layout['texts'] = []
  document.querySelectorAll<HTMLElement>('[data-shield]').forEach((panel) => {
    for (const child of Array.from(panel.children)) {
      const r = child.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) texts.push({ l: r.left, r: r.right, t: r.top + sy, b: r.bottom + sy })
    }
  })
  return { zoneTop: zone.top + sy, zoneHeight: zone.height, centers, texts }
}

/**
 * Mantiene el layout medido y lo vuelve a medir cuando cambia el tamaño de la
 * página (o llegan las fuentes). `onChange` se llama tras cada medición para
 * que la escena pida un cuadro nuevo.
 */
export function usePageLayout(onChange: () => void): MutableRefObject<Layout | null> {
  const layout = useRef<Layout | null>(null)
  const notify = useRef(onChange)
  notify.current = onChange

  useEffect(() => {
    let raf = 0
    const remeasure = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        layout.current = measureLayout()
        notify.current()
      })
    }
    remeasure()
    const ro = new ResizeObserver(remeasure)
    ro.observe(document.body)
    window.addEventListener('resize', remeasure)
    document.fonts?.ready.then(remeasure)
    // Las apariciones (Reveal) desplazan algo los textos al entrar: se re-mide al rato.
    const late = window.setTimeout(remeasure, 1500)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', remeasure)
      window.clearTimeout(late)
    }
  }, [])

  return layout
}
