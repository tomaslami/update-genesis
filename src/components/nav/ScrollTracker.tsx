'use client'

import { useEffect } from 'react'
import { SECTIONS, type SectionId } from '@/lib/site'
import { store } from '@/lib/store'

/** Un solo listener de scroll: sección activa y progreso de lectura. */
export default function ScrollTracker() {
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const mid = window.innerHeight * 0.45
      let active: SectionId = 'inicio'
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= mid) active = s.id
      }
      const max = document.documentElement.scrollHeight - window.innerHeight
      store.set({ active, progress: max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0 })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])
  return null
}
