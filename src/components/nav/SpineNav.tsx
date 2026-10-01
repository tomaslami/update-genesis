'use client'

import { useEffect, useState } from 'react'
import { SECTIONS, sectionNumber } from '@/lib/site'
import { useStore } from '@/lib/store'
import { VertebraShape } from '@/components/ui/icons'

/**
 * Índice lateral con forma de columna: cada sección es una vértebra.
 * La médula se llena de naranja con el scroll, las vértebras recorridas
 * quedan alineadas (rellenas) y la activa se enciende en naranja. Al entrar
 * en una sección su nombre aparece un momento; al pasar el mouse se
 * despliega el índice completo.
 */
export default function SpineNav() {
  const active = useStore((s) => s.active)
  const progress = useStore((s) => s.progress)
  const activeIdx = SECTIONS.findIndex((s) => s.id === active)
  const [flash, setFlash] = useState(true)

  useEffect(() => {
    setFlash(true)
    const id = window.setTimeout(() => setFlash(false), 2200)
    return () => window.clearTimeout(id)
  }, [active])

  return (
    <nav aria-label="Secciones" className="spine-nav group fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <div className="relative flex flex-col items-center rounded-full bg-white/95 px-1.5 py-3 shadow-lg ring-1 ring-navy/5">
        <span aria-hidden="true" className="absolute bottom-6 top-6 left-1/2 w-px -translate-x-1/2 bg-navy/15">
          <span
            className="absolute inset-x-0 top-0 bg-orange transition-[height] duration-300"
            style={{ height: `${progress * 100}%` }}
          />
        </span>
        {SECTIONS.map((s, i) => {
          const isActive = i === activeIdx
          const passed = i < activeIdx
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-current={isActive ? 'location' : undefined}
              className="spine-nav__item relative flex h-8 w-12 items-center justify-center rounded-full"
              style={{ ['--i' as string]: i }}
            >
              <VertebraShape
                width={20 + i * 2.2}
                className={`relative z-10 transition-all duration-300 ${
                  isActive
                    ? 'scale-125 fill-orange stroke-orange'
                    : passed
                      ? 'fill-navy stroke-navy'
                      : 'fill-white stroke-navy/60 group-hover:stroke-navy'
                }`}
              />
              <span
                className={`spine-nav__label lbl pointer-events-none absolute right-full mr-3 flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 shadow-md transition-all duration-300 ${
                  isActive ? `bg-orange text-navy ${flash ? 'opacity-100' : 'opacity-0 translate-x-2'}` : 'bg-white text-navy opacity-0 translate-x-2'
                }`}
              >
                <span className={isActive ? 'text-navy/70' : 'text-navy/60'}>{sectionNumber(s.id)}</span>
                {s.label}
              </span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
