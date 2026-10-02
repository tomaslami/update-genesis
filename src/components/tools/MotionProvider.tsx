'use client'

import { domAnimation, LazyMotion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Animaciones con el paquete liviano de framer-motion: solo las capacidades que
 * usa el sitio (entrar, salir, aparecer al hacer scroll), sin arrastre ni layout.
 * `strict` obliga a usar `m.*` en lugar de `motion.*` en todo el árbol.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  )
}
