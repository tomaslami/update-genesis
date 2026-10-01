import Reveal from '@/components/ui/Reveal'
import SectionLabel from '@/components/ui/SectionLabel'

const STEPS = ['Prevención', 'Evaluación', 'Tratamiento']

export default function Kinesiologia() {
  return (
    <section id="kinesiologia" className="zone-section relative z-10 min-h-[100svh]">
      <div className="wrap grid w-full lg:grid-cols-2">
        <div className="zone-panel flex flex-col gap-6 py-16 lg:col-start-2 lg:py-32">
          <Reveal>
            <SectionLabel n="02" dark>
              Kinesiología
            </SectionLabel>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="h2">¿A QUÉ SE DEDICA GÉNESIS?</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-[22px] font-bold leading-8 sm:text-2xl sm:leading-[34px]">
              Nos orientamos a la prevención, evaluación y tratamiento de alteraciones del movimiento y la función
              física.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-lg leading-7 text-white/90">
              A través de diferentes técnicas y ejercicios terapéuticos, buscamos disminuir el dolor, recuperar la
              movilidad, mejorar la fuerza y favorecer la función que busca cada persona.
            </p>
          </Reveal>
          <ol className="mt-3 grid grid-cols-3 gap-4">
            {STEPS.map((s, i) => (
              <Reveal
                as="li"
                key={s}
                delay={0.2 + i * 0.1}
                className={`flex flex-col gap-2.5 border-t pt-4 ${i === 2 ? 'border-orange' : 'border-white/30'}`}
              >
                <span className={`lbl ${i === 2 ? 'text-orange' : 'text-white/70'}`}>{String(i + 1).padStart(2, '0')}</span>
                <span className="text-lg font-bold leading-6 sm:text-xl">{s}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
