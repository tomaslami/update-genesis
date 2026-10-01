'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { ArrowIcon } from '@/components/ui/icons'
import Reveal from '@/components/ui/Reveal'
import SectionLabel from '@/components/ui/SectionLabel'

const PHOTOS = [
  { src: '/carousel/Imagen1.jpg', w: 1200, h: 1600, alt: 'Recepción del consultorio con el logo de Génesis' },
  { src: '/carousel/Imagen3.jpg', w: 1600, h: 1200, alt: 'Consultorio Génesis' },
  { src: '/carousel/Imagen4.jpg', w: 1200, h: 1600, alt: 'Consultorio Génesis' },
  { src: '/carousel/Imagen5.webp', w: 1600, h: 1200, alt: 'Consultorio Génesis' },
  { src: '/carousel/Imagen6.webp', w: 1600, h: 1200, alt: 'Consultorio Génesis' },
  { src: '/carousel/Imagen8.webp', w: 1200, h: 1600, alt: 'Consultorio Génesis' },
]

export default function Consultorio() {
  const track = useRef<HTMLDivElement>(null)
  const scroll = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 380), behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <section id="consultorio" className="lamina-grid bg-navy text-white">
      <div className="wrap py-28">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-4">
            <Reveal>
              <SectionLabel n="08" dark>
                Consultorio
              </SectionLabel>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="h2">EL CONSULTORIO</h2>
            </Reveal>
          </div>
          <div className="flex gap-2">
            {([-1, 1] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => scroll(d)}
                aria-label={d === -1 ? 'Fotos anteriores' : 'Fotos siguientes'}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/50 transition-colors duration-300 hover:bg-white hover:text-navy"
              >
                <ArrowIcon dir={d} />
              </button>
            ))}
          </div>
        </div>
        <div ref={track} className="gallery flex snap-x snap-mandatory gap-5 overflow-x-auto pb-1">
          {PHOTOS.map((p, i) => (
            <Reveal as="figure" key={p.src} delay={i * 0.06} className="flex shrink-0 snap-start flex-col gap-2.5">
              <div className="h-[380px] w-[280px] overflow-hidden rounded-xl sm:h-[440px] sm:w-[340px]">
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={p.w}
                  height={p.h}
                  sizes="340px"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
                />
              </div>
              <figcaption className="lbl text-white/70">08.{i + 1}</figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
