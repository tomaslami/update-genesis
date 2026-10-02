'use client'

import { useEffect, useRef, type ReactNode } from 'react'

export const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Un solo IntersectionObserver para todas las apariciones de la página: cuando
 * un elemento entra en pantalla se le agrega `is-revealed` y deja de observarse.
 */
let observer: IntersectionObserver | null = null
function observe(el: Element) {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.classList.add('is-revealed')
        observer?.unobserve(e.target)
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  )
  observer.observe(el)
  return () => observer?.unobserve(el)
}

type Tag = 'div' | 'li' | 'p' | 'article' | 'figure'

/**
 * Aparición al entrar en pantalla: sube 16px y se funde (0.8 s, una sola vez).
 * Es una transición CSS (`.reveal` en globals.css): corre en el compositor, sin
 * trabajo de JavaScript por cuadro mientras se hace scroll.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
  as: As = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: Tag
}) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (el) return observe(el)
  }, [])
  return (
    <As
      ref={ref as never}
      className={className ? `reveal ${className}` : 'reveal'}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </As>
  )
}
