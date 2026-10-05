'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { SECTIONS, WHATSAPP_URL, sectionNumber } from '@/lib/site'
import { readingProgress, store, useStore } from '@/lib/store'
import { VertebraShape, WhatsAppIcon } from '@/components/ui/icons'

/**
 * La columna es toda la navegación: arriba el isotipo (vuelve al inicio),
 * en el medio una vértebra por sección y abajo el menú. La médula se llena
 * de naranja con el scroll, las vértebras recorridas quedan alineadas
 * (rellenas) y la activa se enciende. Al entrar en una sección su nombre
 * aparece un momento; en desktop, al pasar el mouse, se despliega el índice.
 * En celular la misma columna se acuesta como una barra fina abajo, que además
 * lleva el acceso a WhatsApp (así nada flota encima del texto).
 */
export default function SpineNav() {
  const active = useStore((s) => s.active)
  const menuOpen = useStore((s) => s.menuOpen)
  const activeIdx = SECTIONS.findIndex((s) => s.id === active)
  const [flash, setFlash] = useState(true)

  useEffect(() => {
    setFlash(true)
    const id = window.setTimeout(() => setFlash(false), 2200)
    return () => window.clearTimeout(id)
  }, [active])

  const vertClass = (i: number) =>
    i === activeIdx
      ? 'scale-125 fill-orange stroke-orange'
      : i < activeIdx
        ? 'fill-navy stroke-navy'
        : 'fill-white stroke-navy/60 group-hover:stroke-navy'

  const openMenu = () => store.set({ menuOpen: true })

  return (
    <>
      {/* Desktop: columna vertical a la derecha. */}
      <nav
        aria-label="Navegación"
        className="spine-nav group fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
      >
        <div className="relative flex flex-col items-center rounded-full bg-white/95 px-1.5 py-2 shadow-lg ring-1 ring-navy/5">
          <a
            href="#inicio"
            aria-label="Génesis, volver al inicio"
            className="flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-300 hover:bg-surface-muted"
          >
            <Image src="/isotipo.webp" alt="" width={74} height={56} className="h-auto w-8" />
          </a>
          <span aria-hidden="true" className="my-1.5 h-px w-6 bg-navy/15" />
          <div className="relative flex flex-col items-center">
            <span aria-hidden="true" className="absolute bottom-3 top-3 left-1/2 w-px -translate-x-1/2 bg-navy/15">
              <ProgressFill axis="y" className="absolute inset-0 origin-top bg-orange transition-transform duration-300" />
            </span>
            {SECTIONS.map((s, i) => {
              const isActive = i === activeIdx
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  aria-current={isActive ? 'location' : undefined}
                  aria-label={`${sectionNumber(s.id)} — ${s.label}`}
                  className="spine-nav__item relative flex h-8 w-12 items-center justify-center rounded-full"
                  style={{ ['--i' as string]: i }}
                >
                  <VertebraShape
                    width={20 + i * 2.2}
                    className={`relative z-10 transition-all duration-300 ${vertClass(i)}`}
                  />
                  <span
                    aria-hidden="true"
                    className={`spine-nav__label lbl pointer-events-none absolute right-full mr-3 flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 shadow-md transition-all duration-300 ${
                      isActive
                        ? `bg-orange text-navy ${flash ? 'opacity-100' : 'translate-x-2 opacity-0'}`
                        : 'translate-x-2 bg-white text-navy opacity-0'
                    }`}
                  >
                    <span className="text-navy/60">{sectionNumber(s.id)}</span>
                    {s.label}
                  </span>
                </a>
              )
            })}
          </div>
          <span aria-hidden="true" className="my-1.5 h-px w-6 bg-navy/15" />
          <button
            type="button"
            onClick={openMenu}
            aria-expanded={menuOpen}
            aria-controls="menu"
            aria-label="Abrir menú"
            className="flex h-12 w-12 items-center justify-center rounded-full text-navy transition-colors duration-300 hover:bg-surface-muted"
          >
            <MenuIcon />
          </button>
        </div>
      </nav>

      {/* Celular: la columna acostada, como barra fina abajo, con WhatsApp al final. */}
      <nav aria-label="Navegación" className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 lg:hidden">
        <div className="relative flex items-center rounded-full bg-white/95 py-1 pl-1 pr-1 shadow-lg ring-1 ring-navy/5">
          <span
            aria-hidden="true"
            className={`lbl pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-orange px-3 py-1.5 text-navy shadow-md transition-all duration-300 ${
              flash ? 'opacity-100' : 'translate-y-1 opacity-0'
            }`}
          >
            <span className="text-navy/60">{sectionNumber(active)}</span> {SECTIONS[activeIdx]?.label}
          </span>
          <a
            href="#inicio"
            aria-label="Génesis, volver al inicio"
            className="flex h-11 w-10 shrink-0 items-center justify-center rounded-full"
          >
            <Image src="/isotipo.webp" alt="" width={74} height={56} className="h-auto w-7" />
          </a>
          <div className="relative flex items-center">
            <span aria-hidden="true" className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-navy/15">
              <ProgressFill axis="x" className="absolute inset-0 origin-left bg-orange" />
            </span>
            {SECTIONS.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={i === activeIdx ? 'location' : undefined}
                aria-label={`${sectionNumber(s.id)} — ${s.label}`}
                className="flex h-11 w-[22px] items-center justify-center min-[400px]:w-[25px]"
              >
                <VertebraShape
                  width={16 + i * 1.6}
                  className={`relative z-10 rotate-90 transition-all duration-300 ${vertClass(i)}`}
                />
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={openMenu}
            aria-expanded={menuOpen}
            aria-controls="menu"
            aria-label="Abrir menú"
            className="flex h-11 w-10 shrink-0 items-center justify-center rounded-full text-navy"
          >
            <MenuIcon />
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contáctanos por WhatsApp"
            className="ml-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-whatsapp text-white transition-colors duration-300 active:bg-whatsapp-hover"
          >
            <WhatsAppIcon size={22} />
          </a>
        </div>
      </nav>
    </>
  )
}

/**
 * Médula de la columna: se llena con el progreso de lectura. Se escala con
 * `transform` (no cambia el layout) y se actualiza escribiendo el estilo
 * directamente, sin re-renderizar la barra en cada cuadro de scroll.
 */
function ProgressFill({ axis, className }: { axis: 'x' | 'y'; className: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = (p: number) => {
      el.style.transform = axis === 'y' ? `scaleY(${p})` : `scaleX(${p})`
    }
    update(readingProgress.get())
    return readingProgress.subscribe(update)
  }, [axis])
  return <span ref={ref} className={className} style={{ transform: axis === 'y' ? 'scaleY(0)' : 'scaleX(0)' }} />
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M5 9h14M5 15h9" />
    </svg>
  )
}
