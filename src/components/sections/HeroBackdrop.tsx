import Image from 'next/image'

/** Foto de portada desenfocada detrás del modelo, con velo azul de marca. */
export default function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[110svh] overflow-hidden">
      <Image src="/hero-bg.webp" alt="" fill priority sizes="100vw" className="hero-photo object-cover" />
      <div className="absolute inset-0 bg-navy/75" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-navy" />
    </div>
  )
}
