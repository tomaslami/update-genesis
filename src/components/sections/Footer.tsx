import Image from 'next/image'
import { CONTACT, SECTIONS, WHATSAPP_URL } from '@/lib/site'
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '@/components/ui/icons'
import IsotypeOutline from '@/components/ui/IsotypeOutline'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy text-white">
      <IsotypeOutline stroke="#ffffff" className="pointer-events-none absolute -bottom-56 -right-32 h-[620px] w-[620px] opacity-[0.22]" />
      <div className="wrap relative flex flex-col gap-12 pb-28 pt-20 md:pb-10">
        <div className="flex flex-wrap justify-between gap-10">
          <Image src="/genesis-logo-blanco.webp" alt="Génesis" width={1612} height={346} className="h-11 w-auto self-start" />
          <nav aria-label="Pie de página" className="flex flex-col gap-3.5">
            {SECTIONS.filter((s) => s.id !== 'inicio').map((s) => (
              <a key={s.id} href={`#${s.id}`} className="lbl transition-colors duration-300 hover:text-orange">
                {s.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-3 leading-6">
            <span>{CONTACT.phone}</span>
            <span>{CONTACT.email}</span>
            <span>{CONTACT.address}</span>
            <div className="mt-2 flex gap-2">
              {[
                { href: CONTACT.instagram, label: 'Instagram', icon: <InstagramIcon /> },
                { href: CONTACT.facebook, label: 'Facebook', icon: <FacebookIcon /> },
                { href: WHATSAPP_URL, label: 'WhatsApp', icon: <WhatsAppIcon size={24} /> },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={l.label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300 hover:text-orange"
                >
                  {l.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
        <p className="border-t border-white/20 pt-6 text-sm text-white/80">
          © {new Date().getFullYear()} Génesis. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
