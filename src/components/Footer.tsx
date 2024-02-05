import React from 'react'
import { FooterElements } from '@/helpers/data'
import FooterIcons from './tools/FooterIcons'
import ContactForm from './tools/ContactForm'

const Footer = () => {

  return (
    <footer id='contacto' className='w-full  lg:h-[600px] bg-[#002337] p-5 flex lg:flex-row flex-col justify-center items-center gap-20'>
      <div className='w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center items-center gap-5'>
        <div className='w-full h-4/6 flex justify-center items-center'>
          <img src="/icons/LOGO_GNS.svg" alt="Logo Génesis" className=' lg:w-auto lg:h-auto' />
        </div>
        <FooterIcons />
      </div>
      <div className='md:w-1/2 w-full h-full flex justify-center items-center flex-col'>
        <ContactForm />
      </div>
    </footer>
  )
}

export default Footer