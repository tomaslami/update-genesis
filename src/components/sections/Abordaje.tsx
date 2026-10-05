'use client'

import { CONDITIONS, store, useStore } from '@/lib/store'
import Reveal from '@/components/ui/Reveal'
import SectionLabel from '@/components/ui/SectionLabel'

export default function Abordaje() {
  const current = useStore((s) => s.condition)
  const idx = CONDITIONS.findIndex((c) => c.id === current)
  const pick = (id: string) => store.set({ condition: id })

  return (
    <section id="abordaje" className="zone-section relative z-10 min-h-[100svh]">
      <div className="wrap grid w-full lg:grid-cols-2 lsc:grid-cols-2">
        <div data-shield className="zone-panel flex flex-col gap-4 pt-16 pb-36 lg:py-32 lsc:gap-3 lsc:py-14">
          <div className="zone-head">
            <Reveal>
              <SectionLabel n="03" dark>
                Abordaje
              </SectionLabel>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="h2">¿QUÉ PODEMOS ABORDAR?</h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <p className="lbl mb-2 text-white/70 lg:mb-4">Toca cada ítem para ver la zona en el modelo</p>
          </Reveal>
          {/* Celular: fila de chips, así el modelo queda a la vista arriba. */}
          <ul className="-mx-[5.5%] flex snap-x gap-2 overflow-x-auto px-[5.5%] pb-1 lg:hidden" aria-label="Problemáticas">
            {CONDITIONS.map((c) => {
              const on = c.id === current
              return (
                <li key={c.id} className="shrink-0 snap-start">
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => pick(c.id)}
                    className={`min-h-11 rounded-full border px-4 text-[15px] font-bold transition-colors duration-300 ${
                      on ? 'border-orange bg-orange text-navy' : 'border-white/40 text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                </li>
              )
            })}
          </ul>
          <ul className="hidden border-b border-white/20 lg:block">
            {CONDITIONS.map((c, i) => {
              const on = c.id === current
              return (
                <Reveal as="li" key={c.id} delay={0.1 + i * 0.05} className="border-t border-white/20">
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => pick(c.id)}
                    onMouseEnter={() => pick(c.id)}
                    onFocus={() => pick(c.id)}
                    className={`grid w-full grid-cols-[40px_minmax(0,1fr)_14px] items-center gap-3 py-4 text-left transition-all duration-300 hover:opacity-100 ${
                      on ? 'pl-3 opacity-100' : 'opacity-60'
                    }`}
                  >
                    <span className="lbl text-white/70">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-[22px] font-bold leading-7">{c.label}</span>
                    <span
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${on ? 'bg-orange' : 'bg-transparent'}`}
                    />
                  </button>
                </Reveal>
              )
            })}
          </ul>
          <p className="lbl mt-2 flex justify-between text-white/70" aria-live="polite">
            <span>Fig. 03 — {CONDITIONS[idx]?.zone}</span>
            <span>{String(idx + 1).padStart(2, '0')} / 07</span>
          </p>
        </div>
      </div>
    </section>
  )
}
