'use client'

import { useStore } from '@/lib/store'
import { WHATSAPP_URL } from '@/lib/site'
import { WhatsAppIcon } from '@/components/ui/icons'

export default function WhatsAppFloat() {
  // En el hero ya hay dos accesos a WhatsApp: el botón flotante aparece al bajar.
  const hidden = useStore((s) => s.active === 'inicio')
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contáctanos por WhatsApp"
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : undefined}
      className={`fixed bottom-6 right-6 z-40 hidden h-[60px] items-center gap-2.5 rounded-full bg-whatsapp pl-4 pr-6 font-extrabold text-white shadow-lg transition-all duration-300 hover:bg-whatsapp-hover lg:inline-flex ${
        hidden ? 'pointer-events-none translate-y-4 opacity-0' : 'opacity-100'
      }`}
    >
      <WhatsAppIcon size={28} />
      <span>Contáctanos</span>
    </a>
  )
}
