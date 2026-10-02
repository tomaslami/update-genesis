import AnatomyStage from '@/components/anatomy/AnatomyStage'
import Menu from '@/components/nav/Menu'
import ScrollTracker from '@/components/nav/ScrollTracker'
import SpineNav from '@/components/nav/SpineNav'
import WhatsAppFloat from '@/components/nav/WhatsAppFloat'
import Abordaje from '@/components/sections/Abordaje'
import Consultorio from '@/components/sections/Consultorio'
import Contacto from '@/components/sections/Contacto'
import Footer from '@/components/sections/Footer'
import Hero from '@/components/sections/Hero'
import HeroBackdrop from '@/components/sections/HeroBackdrop'
import Kinesiologia from '@/components/sections/Kinesiologia'
import Metodo from '@/components/sections/Metodo'
import Nosotros from '@/components/sections/Nosotros'
import Profesionales from '@/components/sections/Profesionales'
import Servicios from '@/components/sections/Servicios'

export default function Home() {
  return (
    <>
      <ScrollTracker />
      <SpineNav />
      <Menu />
      <main>
        {/* Zona anatómica: el modelo 3D queda fijo mientras pasan estas cuatro secciones. */}
        <div className="lamina-grid relative bg-navy text-white">
          <HeroBackdrop />
          <AnatomyStage />
          <Hero />
          <Kinesiologia />
          <Abordaje />
          <Servicios />
        </div>
        <Metodo />
        <Nosotros />
        <Profesionales />
        <Consultorio />
        <Contacto />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
