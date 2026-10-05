'use client'

import { AnimatePresence, m } from 'framer-motion'
import type { ReactNode } from 'react'
import { store, useStore, type Service } from '@/lib/store'
import Reveal, { EASE } from '@/components/ui/Reveal'
import SectionLabel from '@/components/ui/SectionLabel'

const KINESIO_INDICATIONS = [
  'Dolor cervical y lumbar',
  'Lesiones musculares y articulares',
  'Rehabilitación traumatológica y postquirúrgica',
  'Alteraciones posturales',
  'Recuperación funcional',
  'Rehabilitación deportiva',
  'Prevención de lesiones',
]

const RPG_INDICATIONS = [
  'Dolor de espalda y cuello',
  'Alteraciones posturales',
  'Escoliosis',
  'Hipercifosis e hiperlordosis',
  'Retracciones y acortamientos musculares',
  'Dolor asociado a sobrecargas posturales',
  'Alteraciones musculoesqueléticas',
]

/** Lista de indicaciones como etiquetas, con su título. */
function Indications({ title, items }: { title: string; items: string[] }) {
  return (
    <>
      <span className="lbl mt-2 text-white/70">{title}</span>
      <ul className="flex flex-wrap gap-2">
        {items.map((x) => (
          <li key={x} className="rounded-full border border-white/40 px-3.5 py-1.5 text-[15px] leading-[22px]">
            {x}
          </li>
        ))}
      </ul>
    </>
  )
}

const SERVICES: { id: Service; title: string; sub: string; zone: string; body: ReactNode }[] = [
  {
    id: 'kinesio',
    title: 'Kinesiología',
    sub: 'Movimiento y función',
    zone: 'Abordaje global',
    body: (
      <>
        <p>
          Nos orientamos a la prevención, evaluación y tratamiento de alteraciones del movimiento y la función física.
        </p>
        <p>
          A través de diferentes técnicas y ejercicios terapéuticos, buscamos disminuir el dolor, recuperar la
          movilidad, mejorar la fuerza y favorecer la función que busca cada persona.
        </p>
        <Indications title="¿Qué podemos abordar?" items={KINESIO_INDICATIONS} />
        <p>
          Cada tratamiento se planifica de manera individual, teniendo en cuenta las necesidades, objetivos y evolución
          de cada persona.
        </p>
      </>
    ),
  },
  {
    id: 'osteo',
    title: 'Osteopatía',
    sub: 'Articulaciones y estructura',
    zone: 'Articulaciones',
    body: (
      <>
        <p>
          Es un abordaje terapéutico manual que busca mejorar la movilidad, disminuir tensiones y favorecer un
          funcionamiento más equilibrado del sistema musculoesquelético.
        </p>
        <p>
          El tratamiento comienza con una evaluación individual para identificar restricciones de movilidad, tensiones
          musculares y alteraciones funcionales. A partir de ella se seleccionan diferentes técnicas manuales,
          adaptadas a las características y necesidades de cada persona.
        </p>
      </>
    ),
  },
  {
    id: 'rpg',
    title: 'RPG',
    sub: 'Reeducación Postural Global',
    zone: 'Cadena posterior',
    body: (
      <>
        <p>
          La Reeducación Postural Global (RPG) es un método de tratamiento kinésico que trabaja sobre la postura, la
          movilidad y las cadenas musculares del cuerpo de manera global e individualizada.
        </p>
        <p>
          Mediante posturas terapéuticas progresivas, respiración y trabajo activo del paciente, se busca mejorar la
          flexibilidad, disminuir tensiones y favorecer una mejor organización corporal.
        </p>
        <Indications title="¿Cuándo está indicado?" items={RPG_INDICATIONS} />
      </>
    ),
  },
]

export default function Servicios() {
  const current = useStore((s) => s.service)
  const idx = SERVICES.findIndex((s) => s.id === current)

  return (
    <section id="servicios" className="zone-section relative z-10 min-h-[100svh]">
      <div className="wrap grid w-full lg:grid-cols-2 lsc:grid-cols-2">
        <div data-shield className="zone-panel flex flex-col gap-4 pt-16 pb-36 lg:col-start-2 lg:py-32 lsc:col-start-2 lsc:gap-3 lsc:py-14">
          <div className="zone-head">
            <Reveal>
              <SectionLabel n="04" dark>
                Servicios
              </SectionLabel>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="h2 mb-6 lsc:mb-2">SERVICIOS DE REHABILITACIÓN</h2>
            </Reveal>
          </div>
          <div className="border-b border-white/20">
            {SERVICES.map((s, i) => {
              const on = s.id === current
              return (
                <Reveal key={s.id} delay={0.1 + i * 0.08}>
                  <button
                    type="button"
                    aria-expanded={on}
                    aria-controls={`svc-${s.id}`}
                    onClick={() => store.set({ service: s.id })}
                    className={`flex w-full items-center gap-5 border-t border-white/20 py-7 text-left transition-opacity duration-300 hover:opacity-100 lsc:py-4 ${
                      on ? 'opacity-100' : 'opacity-60'
                    }`}
                  >
                    <span className="lbl w-7 text-white/70">{String(i + 1).padStart(2, '0')}</span>
                    <span className="flex flex-grow flex-col gap-1.5">
                      <span className="text-[28px] font-bold leading-9 sm:text-[32px]">{s.title}</span>
                      <span className="lbl text-white/70">{s.sub}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`h-3 w-3 rounded-full transition-colors duration-300 ${on ? 'bg-orange' : 'bg-transparent'}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <m.div
                        id={`svc-${s.id}`}
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-3.5 pb-8 pl-12 text-[17px] leading-[27px] text-white/90">{s.body}</div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </Reveal>
              )
            })}
          </div>
          <p className="lbl mt-2 flex justify-between text-white/70" aria-live="polite">
            <span>Fig. 04 — {SERVICES[idx]?.zone}</span>
            <span>
              {String(idx + 1).padStart(2, '0')} / {String(SERVICES.length).padStart(2, '0')}
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
