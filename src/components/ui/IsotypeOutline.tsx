'use client'

import { motion, useReducedMotion } from 'framer-motion'

const PATHS = [
  'M78 18 L90 11 L110 11 L122 18 L110 25 L90 25 Z',
  'M82 40 L92 34 L108 34 L118 40 L108 46 L92 46 Z',
  'M86 60 L94 55 L106 55 L114 60 L106 65 L94 65 Z',
  'M90 80 L110 80 L100 108 Z',
  'M98 168 C 84 140, 52 96, 30 112 C 12 126, 32 160, 62 176 C 76 184, 90 180, 98 168 Z',
  'M102 168 C 116 140, 148 96, 170 112 C 188 126, 168 160, 138 176 C 124 184, 110 180, 102 168 Z',
]

/** Isotipo en trazo (aproximación hasta tener el logo en vector), se dibuja al entrar en pantalla. */
export default function IsotypeOutline({ className, stroke }: { className?: string; stroke: string }) {
  const reduce = useReducedMotion()
  return (
    <svg aria-hidden="true" viewBox="0 0 200 200" className={className}>
      <g fill="none" stroke={stroke} strokeWidth={0.6} strokeLinejoin="round">
        {PATHS.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            initial={reduce ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: i * 0.12 }}
          />
        ))}
      </g>
    </svg>
  )
}
