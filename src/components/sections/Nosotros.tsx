import Image from 'next/image'
import Reveal from '@/components/ui/Reveal'
import SectionLabel from '@/components/ui/SectionLabel'

function Note({ label, line, className }: { label: string; line: number; className: string }) {
  return (
    <div aria-hidden="true" className={`absolute isolate flex items-center ${className}`}>
      <span className="pulse-dot h-3 w-3 rounded-full bg-orange" />
      <span className="h-px bg-white" style={{ width: line }} />
      <span className="lbl rounded-md bg-white px-2.5 py-1.5 text-navy">{label}</span>
    </div>
  )
}

export default function Nosotros() {
  return (
    <section id="nosotros" className="bg-surface-muted text-ink">
      <div className="wrap grid items-center gap-12 py-28 lg:grid-cols-2 lg:gap-16">
        <Reveal as="figure" className="flex flex-col gap-3">
          <div className="relative">
            <Image
              src="/ABOUT-US.webp"
              alt="Terapeuta sosteniendo el brazo de una paciente con vendaje neuromuscular en el hombro"
              width={610}
              height={353}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-auto w-full rounded-xl"
            />
            <Note label="Hombro" line={56} className="left-[42%] top-[22%]" />
            <Note label="Codo" line={40} className="left-[21%] top-[74%]" />
          </div>
          <figcaption className="lbl text-navy">Fig. 06 — Evaluación en consultorio</figcaption>
        </Reveal>
        <div className="flex flex-col gap-5">
          <Reveal>
            <SectionLabel n="06">Nosotros</SectionLabel>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="h2 text-navy">¿QUIÉNES SOMOS?</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-[22px] font-bold leading-8 text-navy">
              Somos Génesis, un centro especializado en la evaluación y tratamiento de patologías osteomusculares.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-lg leading-7">
              Es atendido única y exclusivamente por profesionales licenciados en Kinesiología y Fisiatría, cada uno
              especializado en su método y con una amplia trayectoria profesional en centros kinesiológicos y hospitales
              de renombre.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
