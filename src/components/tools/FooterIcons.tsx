import { FooterElements } from '@/helpers/data'
import React from 'react'
import WhatsApp from '@/../public/icons/WPP.svg'
import Facebook from '@/../public/icons/FB.svg'
import Instagram from '@/../public/icons/IG.svg'
import Link from 'next/link'

const FooterIcons = () => {
  return (
    <div className='lg:w-2/3 w-full h-3/6 flex flex-col justify-center items-center gap-7 '>
      {FooterElements.map(({ id, icon, img_alt, text }) => (
        <div className='w-full flex justify-center items-center'>
          <ul className='w-full flex justify-center items-center flex-col gap-2 pl-1'>
            <li key={id} className='w-full flex justify-items-center items-center flex-row gap-4 '>
              <img src={icon} alt={img_alt} className='text-white text-lg font-light w-[24px] h-[24px]' />
              <h4 className='text-white text-sm md:text-lg font-normal'>{text}</h4>
            </li>
          </ul>
        </div>
      ))}
      <ul className='w-full flex justify-between lg:pt-0'>
        <li>
          <Link target='_blank' href="https://www.instagram.com/consultoriogenesis.caba/">
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24"><path fill="white" d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3" /></svg>
          </Link>
        </li>
        <li>
          <Link target='_blank' href="https://www.facebook.com/consultoriogenesis.caba">
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24"><path fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 2h-3a5 5 0 0 0-5 5v3H6v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
          </Link>
        </li>
        <li>
          <Link href="https://api.whatsapp.com/send?phone=5491122519048&amptext=G-%20Hola%20encontr%C3%A9%20tus%20servicios%20en%20Google.%20Quisiera%20pedir%20informaci%C3%B3n%20sobre%20tratamientos." target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24"><path fill="white" d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.264 8.264 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07c0 1.22.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28" /></svg>
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default FooterIcons