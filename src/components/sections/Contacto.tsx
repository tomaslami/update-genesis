'use client'

import { useRef, useState } from 'react'
import { toast, Toaster } from 'sonner'
import { handleSubmit } from '@/actions/contact-actions'
import { CONTACT, WHATSAPP_URL } from '@/lib/site'
import { MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from '@/components/ui/icons'
import Reveal from '@/components/ui/Reveal'
import SectionLabel from '@/components/ui/SectionLabel'

export default function Contacto() {
  const [loading, setLoading] = useState(false)
  const form = useRef<HTMLFormElement>(null)

  async function onSubmit(formData: FormData) {
    setLoading(true)
    try {
      const res = await handleSubmit(formData)
      if (res.status === 200) {
        toast.success(res.message)
        form.current?.reset()
      } else {
        const messages = Array.isArray(res.message) ? res.message : [res.message]
        messages.forEach((m: string) => toast.error(m))
      }
    } catch {
      toast.error('Error al enviar el mensaje')
    } finally {
      setLoading(false)
    }
  }

  const data = [
    { icon: PhoneIcon, text: CONTACT.phone },
    { icon: MailIcon, text: CONTACT.email },
    { icon: PinIcon, text: CONTACT.address },
  ]

  return (
    <section id="contacto" className="bg-white text-ink">
      <Toaster position="top-center" duration={3000} richColors />
      <div className="wrap py-28">
        <div className="mb-14 flex flex-col gap-4">
          <Reveal>
            <SectionLabel n="09">Contacto</SectionLabel>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="h2 text-navy">CONTÁCTANOS</h2>
          </Reveal>
        </div>
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-8">
            <Reveal className="flex flex-col gap-4 rounded-card bg-navy p-8 text-white sm:p-10">
              <span className="lbl text-white/80">WhatsApp</span>
              <p className="text-[30px] font-extrabold leading-10 sm:text-[34px]">{CONTACT.phone}</p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[52px] items-center gap-2.5 self-start rounded-full bg-whatsapp px-7 font-bold text-navy transition-colors duration-300 hover:bg-whatsapp-hover"
              >
                <WhatsAppIcon />
                Escribir por WhatsApp
              </a>
            </Reveal>
            <Reveal>
              <form ref={form} action={onSubmit} className="flex flex-col gap-4">
                <span className="lbl text-navy">O déjanos tu mensaje</span>
                <label className="flex flex-col gap-1.5 text-sm font-bold text-navy">
                  Nombre
                  <input className="field" type="text" name="name" autoComplete="name" required />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-bold text-navy">
                  Teléfono
                  <input className="field" type="tel" name="phone" autoComplete="tel" required />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-bold text-navy">
                  Mensaje
                  <textarea className="field resize-none" name="message" rows={5} required />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-12 self-start rounded-md bg-navy px-7 font-bold text-white transition-colors duration-300 hover:bg-navy-soft disabled:opacity-70"
                >
                  {loading ? 'Enviando…' : 'Enviar'}
                </button>
              </form>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="flex flex-col gap-7">
            <ul>
              {data.map(({ icon: Icon, text }, i) => (
                <li
                  key={text}
                  className={`flex items-center gap-4 border-t border-surface-card py-[18px] text-[17px] ${i === data.length - 1 ? 'border-b' : ''}`}
                >
                  <Icon className="shrink-0 text-navy" />
                  <span className="break-all sm:break-normal">{text}</span>
                </li>
              ))}
            </ul>
            <iframe
              title="Mapa: Paraguay 1275, Recoleta, CABA"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.0168878895174!2d-58.38383908417407!3d-34.59640688046189!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccaa21c1d890d%3A0x51f706465e9331e5!2sParaguay%201275%2C%20C1057AAU%20CABA%2C%20Argentina!5e0!3m2!1sen!2sus!4v1653669972079!5m2!1sen!2sus"
              className="h-[340px] w-full rounded-xl border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
