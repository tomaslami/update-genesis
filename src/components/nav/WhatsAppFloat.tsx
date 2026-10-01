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
      className={`fixed bottom-[84px] right-4 z-40 lg:bottom-6 lg:right-6 inline-flex h-[60px] items-center gap-2.5 rounded-full bg-whatsapp pl-4 pr-4 font-extrabold text-navy shadow-lg transition-all duration-300 hover:bg-whatsapp-hover md:pr-6 ${
        hidden ? 'pointer-events-none translate-y-4 opacity-0' : 'opacity-100'
      }`}
    >
      <WhatsAppIcon size={28} />
      <span className="hidden md:inline">Contáctanos</span>
    </a>
  )
}
