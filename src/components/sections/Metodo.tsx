'use client'

import { m, useReducedMotion } from 'framer-motion'
import Reveal from '@/components/ui/Reveal'
import SectionLabel from '@/components/ui/SectionLabel'

type Step = { title: string; text: string; label: string; aria: string; spine: string; marked?: number; align?: boolean }

const STEPS: Step[] = [
  {
    title: 'Evaluación',
    text: 'Cada tratamiento comienza con una evaluación profesional para identificar restricciones de movilidad, tensiones musculares y alteraciones funcionales.',
    label: 'TENSIÓN',
    aria: 'Columna desalineada frente a una línea de plomada',
    spine: 'M120 18 C 104 48, 140 78, 128 108 C 116 138, 100 158, 112 184',
  },
  {
    title: 'Plan individual',
    text: 'Cada tratamiento se planifica de manera individual, teniendo en cuenta las necesidades, objetivos y evolución de cada persona.',
    label: 'OBJETIVO',
    aria: 'Columna con la zona a trabajar marcada en naranja',
    spine: 'M120 18 C 112 48, 130 78, 124 108 C 118 138, 112 158, 116 184',
    marked: 2,
  },
  {
    title: 'Tratamiento',
    text: 'Se seleccionan diferentes técnicas manuales y ejercicios terapéuticos, adaptados a las características y necesidades de cada persona.',
    label: 'EJE',
    aria: 'Columna alineada sobre la línea de plomada',
    spine: 'M120 18 L120 184',
    align: true,
  },
]

const VERTS = [
  [28, 22, 10],
  [62, 26, 11],
  [100, 28, 12],
  [140, 30, 13],
]

function Plate({ step, index }: { step: Step; index: number }) {
  const reduce = useReducedMotion()
  const draw = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0 },
          whileInView: { pathLength: 1 },
          viewport: { once: true, margin: '0px 0px -15% 0px' },
          transition: { duration: 1.6, ease: [0.22, 1, 0.36, 1], delay },
        }
  // Posición x de cada vértebra siguiendo la curva del paso.
  const xs = step.align ? [109, 107, 106, 105] : index === 0 ? [108, 118, 118, 100] : [108, 112, 110, 104]
  return (
    <svg viewBox="0 0 280 200" className="h-auto w-full max-w-[320px]" role="img" aria-label={step.aria}>
      <line x1="120" y1="10" x2="120" y2="190" stroke="#002337" strokeWidth="1" strokeDasharray="4 5" opacity=".45" />
      <m.path d={step.spine} fill="none" stroke="#002337" strokeWidth="1.25" strokeLinecap="round" {...draw(0.1)} />
      {VERTS.map(([y, w, h], i) =>
        step.marked === i ? (
          <g key={i}>
            <m.rect
              x={xs[i]}
              y={y}
              width={w}
              height={h}
              rx="4"
              fill="#f28c38"
              initial={reduce ? false : { opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1 }}
              style={{ transformOrigin: `${xs[i] + w / 2}px ${y + h / 2}px` }}
            />
            <circle className="pulse-ring" cx={xs[i] + w / 2} cy={y + h / 2} r="22" fill="none" stroke="#f28c38" strokeWidth="1.5" />
          </g>
        ) : (
          <m.rect
            key={i}
            x={xs[i]}
            y={y}
            width={w}
            height={h}
            rx="4"
            fill="none"
            stroke="#002337"
            strokeWidth="1.25"
            {...draw(0.3 + i * 0.12)}
          />
        ),
      )}
      <m.path
        d={`M${step.marked !== undefined ? 146 : 150} ${step.align ? 146 : step.marked !== undefined ? 106 : 66} h44`}
        stroke="#002337"
        strokeWidth="1"
        fill="none"
        {...draw(0.9)}
      />
      <text
        x="194"
        y={step.align ? 150 : step.marked !== undefined ? 110 : 70}
        fill="#002337"
        style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em' }}
      >
        {step.label}
      </text>
    </svg>
  )
}

export default function Metodo() {
  return (
    <section id="metodo" className="bg-white text-ink">
      <div className="wrap py-28">
        <div className="mb-16 flex max-w-[760px] flex-col gap-4">
          <Reveal>
            <SectionLabel n="05">Método</SectionLabel>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="h2 text-navy">CÓMO TRABAJAMOS</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg leading-7">En Génesis entendemos el movimiento de forma integral.</p>
          </Reveal>
        </div>
        <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.12} className="flex flex-col gap-5 border-t border-navy pt-6">
              <Plate step={s} index={i} />
              <span className="lbl text-navy">Paso {String(i + 1).padStart(2, '0')}</span>
              <h3 className="text-[26px] font-bold leading-8 text-navy">{s.title}</h3>
              <p className="leading-[26px]">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
