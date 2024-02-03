import React from 'react'
import { FooterElements } from '@/helpers/data'
import FooterIcons from './tools/FooterIcons'
import ContactForm from './tools/ContactForm'

const Footer = () => {

  return (
    <footer className='w-full h-[600px] bg-[#002337] p-5 flex flex-row'>
      <div className='w-1/2 h-full flex flex-col justify-center items-center'>
        <div className='w-full h-4/6 flex justify-center items-center'>
          <img src="/icons/LOGO_GNS.svg" alt="" />
        </div>
        <FooterIcons />
      </div>
      <div className='w-1/2 h-full flex justify-center items-center flex-col'>
        <ContactForm />
      </div>
    </footer>
  )
}

export default Footer