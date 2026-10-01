'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

export const EASE = [0.22, 1, 0.36, 1] as const

/** Aparición al entrar en pantalla: sube 16px y se funde. */
export default function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'p' | 'article' | 'figure'
}) {
  const reduce = useReducedMotion()
  const M = motion[as]
  return (
    <M
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </M>
  )
}
