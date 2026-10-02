'use client'

import { useEffect } from 'react'
import { SECTIONS, type SectionId } from '@/lib/site'
import { readingProgress, store } from '@/lib/store'

/**
 * Un solo listener de scroll: sección activa y progreso de lectura. Las
 * posiciones de las secciones se miden una vez (y al cambiar el tamaño de la
 * página); en cada scroll solo se compara con window.scrollY, sin leer layout.
 */
export default function ScrollTracker() {
  useEffect(() => {
    let tops: { id: SectionId; top: number }[] = []
    let max = 1
    let raf = 0

    const measure = () => {
      const sy = window.scrollY
      tops = SECTIONS.flatMap((s) => {
        const el = document.getElementById(s.id)
        return el ? [{ id: s.id, top: el.getBoundingClientRect().top + sy }] : []
      })
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      update()
    }
    const update = () => {
      raf = 0
      const line = window.scrollY + window.innerHeight * 0.45
      let active: SectionId = 'inicio'
      for (const s of tops) if (s.top <= line) active = s.id
      store.set({ active })
      readingProgress.set(Math.min(1, Math.max(0, window.scrollY / max)))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    measure()
    const ro = new ResizeObserver(() => requestAnimationFrame(measure))
    ro.observe(document.body)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
      cancelAnimationFrame(raf)
    }
  }, [])
  return null
}
