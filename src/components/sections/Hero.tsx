'use client'

import Image from 'next/image'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { markHeroIntroDone } from '@/lib/intro'
import { WHATSAPP_URL } from '@/lib/site'
import { ArrowDownIcon, WhatsAppIcon } from '@/components/ui/icons'
import SectionLabel from '@/components/ui/SectionLabel'
import { EASE } from '@/components/ui/Reveal'

const PHRASES = ['disminuir el dolor', 'recuperar la movilidad', 'mejorar la fuerza', 'favorecer la función que buscas']
const LINES = ['Especialistas en', 'Kinesiología,', 'Osteopatía y RPG']

export default function Hero() {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)

  useEffect(() => {
    if (reduce) return
    const id = window.setInterval(() => setI((n) => (n + 1) % PHRASES.length), 2800)
    return () => window.clearInterval(id)
  }, [reduce])

  const rise = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, ease: EASE, delay },
  })

  return (
    <section id="inicio" className="zone-section relative z-10 min-h-[100svh]">
      {/* Encabezado de la lámina: el logo aparece una vez y se va con el scroll. */}
      <div className="wrap absolute inset-x-0 top-0 pt-6">
        <m.a
          href="#inicio"
          aria-label="Génesis"
          className="inline-flex items-center"
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <Image src="/genesis-logo-blanco.webp" alt="Génesis" width={1612} height={346} priority className="h-9 w-auto sm:h-11" />
        </m.a>
      </div>
      <div className="wrap grid w-full lg:grid-cols-2 lsc:grid-cols-2">
        <div data-shield className="zone-panel flex flex-col gap-7 pb-28 lg:pb-0 lsc:gap-3 lsc:pb-0 lsc:pt-16">
          <div className="zone-head">
          <m.div {...rise(0)}>
            <SectionLabel n="01" dark>
              Cuerpo
            </SectionLabel>
          </m.div>
          <h1 className="text-[40px] font-extrabold leading-[44px] tracking-[-0.01em] sm:text-[56px] sm:leading-[60px] xl:text-[68px] xl:leading-[72px] lsc:text-[30px] lsc:leading-[34px]">
            {LINES.map((l, k) => (
              <span key={l} className="block overflow-hidden pb-1">
                <m.span
                  className="block"
                  initial={reduce ? false : { y: '105%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.1 + k * 0.15 }}
                >
                  {l}
                </m.span>
              </span>
            ))}
          </h1>
          </div>
          <m.div {...rise(0.5)} className="text-[20px] leading-7 sm:text-2xl sm:leading-8 lsc:text-base lsc:leading-6">
            <p>Te ayudamos a</p>
            <p className="relative h-16 font-extrabold text-orange sm:h-9 lsc:h-6" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <m.span
                  key={PHRASES[i]}
                  className="absolute left-0 top-0"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  {PHRASES[i]}
                </m.span>
              </AnimatePresence>
            </p>
          </m.div>
          <m.div {...rise(0.7)} className="flex flex-wrap items-center gap-4">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] items-center gap-2.5 rounded-full bg-orange px-7 font-bold text-navy transition-colors duration-300 hover:bg-orange-soft"
            >
              <WhatsAppIcon />
              Contáctanos por WhatsApp
            </a>
            <a href="#kinesiologia" className="group inline-flex min-h-[52px] items-center gap-2 px-2 font-bold">
              Explorar más
              <ArrowDownIcon className="transition-transform duration-300 group-hover:translate-y-1" />
            </a>
          </m.div>
          {/* Es lo último en entrar: al terminar, arranca la preparación del modelo 3D. */}
          <m.div
            {...rise(0.9)}
            onAnimationComplete={markHeroIntroDone}
            className="lbl mt-4 flex flex-wrap gap-5 text-white/75 lsc:hidden"
          >
            <span>Kinesiología · Osteopatía · RPG</span>
            <span>Recoleta, CABA</span>
          </m.div>
        </div>
      </div>
    </section>
  )
}
