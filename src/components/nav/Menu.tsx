'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { CONTACT, SECTIONS, WHATSAPP_URL, sectionNumber } from '@/lib/site'
import { store, useStore } from '@/lib/store'
import { CloseIcon, VertebraShape, WhatsAppIcon } from '@/components/ui/icons'

const EASE = [0.22, 1, 0.36, 1] as const

/** Menú a pantalla completa: índice numerado con su vértebra y datos de contacto. */
export default function Menu() {
  const open = useStore((s) => s.menuOpen)
  return <AnimatePresence>{open && <MenuPanel />}</AnimatePresence>
}

function MenuPanel() {
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
