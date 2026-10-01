'use client'

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { useRef, useState } from 'react'
import Reveal from '@/components/ui/Reveal'
import SectionLabel from '@/components/ui/SectionLabel'

const STEPS = ['Prevención', 'Evaluación', 'Tratamiento']

export default function Kinesiologia() {
  return (
    <section id="kinesiologia" className="zone-section relative z-10 min-h-[100svh]">
      <div className="wrap grid w-full lg:grid-cols-2">
        <div data-shield className="zone-panel flex flex-col gap-6 py-16 lg:col-start-2 lg:py-32">
          <Reveal>
            <SectionLabel n="02" dark>
              Kinesiología
            </SectionLabel>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="h2">¿A QUÉ SE DEDICA GÉNESIS?</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-[22px] font-bold leading-8 sm:text-2xl sm:leading-[34px]">
              Nos orientamos a la prevención, evaluación y tratamiento de alteraciones del movimiento y la función
              física.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-lg leading-7 text-white/90">
              A través de diferentes técnicas y ejercicios terapéuticos, buscamos disminuir el dolor, recuperar la
              movilidad, mejorar la fuerza y favorecer la función que busca cada persona.
            </p>
          </Reveal>
          <Steps />
        </div>
      </div>
    </section>
  )
}

/**
 * Prevención → Evaluación → Tratamiento como un recorrido: la línea naranja
 * avanza con el scroll y cada paso se enciende cuando la línea lo alcanza.
 */
function Steps() {
  const ref = useRef<HTMLOListElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'start 0.35'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })
  const [reached, setReached] = useState(reduce ? STEPS.length : 0)

  useMotionValueEvent(progress, 'change', (v) => {
    if (reduce) return
    // Cada paso ocupa un tercio del ancho; se enciende cuando la línea llega a su inicio.
    const n = v >= 2 / 3 ? 3 : v >= 1 / 3 ? 2 : v > 0.02 ? 1 : 0
    if (n !== reached) setReached(n)
  })

  return (
    <ol ref={ref} className="relative mt-3 grid grid-cols-3 gap-4" aria-label="Recorrido">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/30" />
      <motion.span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[2px] origin-left bg-orange"
        style={{ scaleX: reduce ? 1 : progress }}
      />
      {STEPS.map((s, i) => {
        const on = i < reached
        return (
          <li key={s} className="flex flex-col gap-2.5 pt-4">
            <span className={`lbl transition-colors duration-500 ${on ? 'text-orange' : 'text-white/60'}`}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              className={`text-lg font-bold leading-6 transition-opacity duration-500 sm:text-xl ${
                on ? 'opacity-100' : 'opacity-50'
              }`}
            >
              {s}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
