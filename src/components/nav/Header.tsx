'use client'

import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { CONTACT, SECTIONS, WHATSAPP_URL, sectionNumber } from '@/lib/site'
import { store, useStore } from '@/lib/store'
import { CloseIcon, VertebraShape, WhatsAppIcon } from '@/components/ui/icons'

const EASE = [0.22, 1, 0.36, 1] as const

export default function Header() {
  const open = useStore((s) => s.menuOpen)
  const active = useStore((s) => s.active)
  const progress = useStore((s) => s.progress)
  const activeLabel = SECTIONS.find((s) => s.id === active)?.label ?? ''

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="wrap flex items-center justify-between pt-4">
          <a
            href="#inicio"
            aria-label="Génesis, ir al inicio"
            className="pointer-events-auto inline-flex h-14 items-center rounded-full bg-white px-5 shadow-xl sm:h-[60px] sm:px-6"
          >
            <Image src="/GNS-2.webp" alt="Génesis" width={147} height={34} priority className="h-7 w-auto sm:h-[34px]" />
          </a>
          <div className="pointer-events-auto relative inline-flex h-14 items-center gap-1 overflow-hidden rounded-full bg-white px-1.5 shadow-xl sm:h-[60px] sm:gap-1.5 sm:px-2">
            <button
              type="button"
              onClick={() => store.set({ menuOpen: true })}
              aria-expanded={open}
              aria-controls="menu"
              aria-label="Abrir menú"
              className="inline-flex h-11 items-center gap-2.5 rounded-full px-3 sm:px-4 text-navy transition-colors duration-300 hover:bg-surface-muted"
            >
              <span className="lbl text-orange sm:hidden" aria-hidden="true" title={activeLabel}>
                {sectionNumber(active)}
              </span>
              <span className="lbl hidden sm:inline">Menú</span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <path d="M5 9h14M5 15h9" />
              </svg>
            </button>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contáctanos por WhatsApp"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-orange text-navy transition-colors duration-300 hover:bg-orange-soft"
            >
              <WhatsAppIcon />
            </a>
            <span aria-hidden="true" className="absolute inset-x-6 bottom-0 h-[2px] bg-navy/10 lg:hidden">
              <span className="block h-full bg-orange" style={{ width: `${progress * 100}%` }} />
            </span>
          </div>
        </div>
      </header>
      <AnimatePresence>{open && <Menu />}</AnimatePresence>
    </>
  )
}

function Menu() {
  const active = useStore((s) => s.active)
  const reduce = useReducedMotion()
  const closeRef = useRef<HTMLButtonElement>(null)
  const close = () => store.set({ menuOpen: false })

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
      prev?.focus()
    }
  }, [])

  return (
    <motion.div
      id="menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menú"
      onKeyDown={(e) => e.key === 'Escape' && close()}
      initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.6, ease: EASE }}
      className="lamina-grid fixed inset-0 z-[60] overflow-y-auto bg-navy text-white"
    >
      <div className="wrap flex justify-end pt-4">
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          className="inline-flex h-[60px] items-center gap-2.5 rounded-full bg-white px-6 text-navy transition-colors duration-300 hover:bg-surface-muted"
        >
          <span className="lbl">Cerrar</span>
          <CloseIcon />
        </button>
      </div>
      <div className="wrap grid gap-16 pb-16 pt-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <nav aria-label="Principal">
          <ol className="border-b border-white/15">
            {SECTIONS.map((s, i) => {
              const isActive = s.id === active
              return (
                <motion.li
                  key={s.id}
                  initial={reduce ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.045 }}
                >
                  <a
                    href={`#${s.id}`}
                    onClick={close}
                    aria-current={isActive ? 'location' : undefined}
                    className="group grid grid-cols-[48px_76px_minmax(0,1fr)] items-center gap-2 border-t border-white/15 py-3 sm:py-3.5"
                  >
                    <span className={`lbl ${isActive ? 'text-orange' : 'text-white/70'}`}>{sectionNumber(s.id)}</span>
                    <span className="flex justify-center">
                      <VertebraShape
                        width={30 + i * 4}
                        className={`transition-all duration-300 ${
                          isActive ? 'fill-orange stroke-orange' : 'fill-transparent stroke-white/50 group-hover:fill-white group-hover:stroke-white'
                        }`}
                      />
                    </span>
                    <span className="text-[28px] font-extrabold leading-9 transition-transform duration-300 group-hover:translate-x-2 sm:text-[34px] sm:leading-10">
                      {s.label}
                    </span>
                  </a>
                </motion.li>
              )
            })}
          </ol>
        </nav>
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col gap-5 text-[17px] leading-[26px]"
        >
          <span className="lbl text-white/70">Contacto</span>
          <span>{CONTACT.phone}</span>
          <span>{CONTACT.email}</span>
          <span>{CONTACT.address}</span>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[52px] items-center gap-2.5 self-start rounded-full bg-orange px-7 font-bold text-navy transition-colors duration-300 hover:bg-orange-soft"
          >
            <WhatsAppIcon />
            Contáctanos por WhatsApp
          </a>
        </motion.div>
      </div>
    </motion.div>
  )
}
