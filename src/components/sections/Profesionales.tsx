import Image from 'next/image'
import IsotypeOutline from '@/components/ui/IsotypeOutline'
import Reveal from '@/components/ui/Reveal'
import SectionLabel from '@/components/ui/SectionLabel'

const PROS = [
  {
    img: '/ORLANDO.png',
    name: 'Lic. Orlando Cáceres',
    specialty: 'RPG',
    items: [
      'Lic. en Kinesiología y Fisiatría, UBA',
      'Posgrado “Reéducation Posturale Globale”, dictado por Philippe E. Souchard (2010)',
      'Experiencia en docencia en las cátedras de Biomecánica y Kinesioterapia',
      'Kinesiólogo del Club Atlético Huracán',
    ],
  },
  {
    img: '/GABRIELA.png',
    name: 'Lic. Gabriela de Marco',
    specialty: 'Osteopatía',
    items: [
      'Lic. en Kinesiología y Fisiatría, Universidad de San Martín',
      'Diplomatura en Osteopatía, EOM (2015–2020)',
      'Kinesióloga del Hospital Santojanni',
    ],
  },
]

export default function Profesionales() {
  return (
    <section id="profesionales" className="relative overflow-hidden bg-surface-card text-ink">
      <IsotypeOutline stroke="#002337" className="pointer-events-none absolute -right-44 -top-16 h-[760px] w-[760px] opacity-[0.14]" />
      <div className="wrap relative py-28">
        <div className="mb-14 flex flex-col gap-4">
          <Reveal>
            <SectionLabel n="07">Equipo</SectionLabel>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="h2 text-navy">NUESTROS PROFESIONALES</h2>
          </Reveal>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          {PROS.map((p, i) => (
            <Reveal
              as="article"
              key={p.name}
              delay={i * 0.12}
              className="grid items-start gap-8 rounded-card bg-white p-8 sm:grid-cols-[198px_minmax(0,1fr)] sm:p-10"
            >
              <Image src={p.img} alt={`Retrato de ${p.name.replace('Lic. ', '')}`} width={198} height={227} className="rounded-xl bg-surface-card" />
              <div className="flex flex-col gap-3.5">
                <span className="lbl inline-flex items-center gap-2 text-navy">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange" />
                  {p.specialty}
                </span>
                <h3 className="text-[28px] font-extrabold leading-[34px] text-navy">{p.name}</h3>
                <ul className="mt-1">
                  {p.items.map((it, k) => (
                    <li key={it} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2 border-t border-surface-card py-2.5 text-[15px] leading-[22px]">
                      <span className="lbl text-navy">{String(k + 1).padStart(2, '0')}</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
