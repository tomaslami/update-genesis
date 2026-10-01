import type { ReactNode } from 'react'

/** Numeración de lámina: "Lámina 02 — Kinesiología". */
export default function SectionLabel({ n, children, dark = false }: { n: string; children: ReactNode; dark?: boolean }) {
  return (
    <div className={`lbl flex items-center gap-3 ${dark ? 'text-white/80' : 'text-navy'}`}>
      <span aria-hidden="true" className={`inline-block h-px w-8 ${dark ? 'bg-white/60' : 'bg-navy'}`} />
      Lámina {n} — {children}
    </div>
  )
}
