import { FooterElements } from '@/helpers/data'
import React from 'react'

const FooterIcons = () => {
  return (
    <div className='lg:w-2/3 w-full h-3/6 flex flex-col justify-center items-center gap-10 p-3'>
      {FooterElements.map(footer => (
        <div className='w-full flex justify-center items-center '>
          <ul key={footer.id} className='w-full flex justify-start items-center flex-row gap-4 '>
            <li>
              <img src={footer.icon} alt={footer.img_alt} className='text-white text-lg font-light' />
            </li>
            <li>
              <h4 className='text-white text-sm font-normal'>{footer.text}</h4>
            </li>
          </ul>
        </div>
      ))}
      <ul className='w-full flex lg:justify-between justify-around pt-10 lg:pt-0'>
        <li>
          <a href="https://www.instagram.com/consultoriogenesis.caba/">
            <img src="/icons/IG.svg" alt="Instagram" className='' />
          </a>
        </li>
        <li>
          <a href="https://www.facebook.com/consultoriogenesis.caba">
            <img src="/icons/FB.svg " alt="Facebook" className='' />
          </a>
        </li>
        <li>
          <a href="https://api.whatsapp.com/send?phone=5491122519048&amp;text=G-%20Hola%20encontr%C3%A9%20tus%20servicios%20en%20Google.%20Quisiera%20pedir%20informaci%C3%B3n%20sobre%20tratamientos." target="_blank">
            <img src="/icons/WPP.svg" alt="WhatsApp" className='' />
          </a>
        </li>
      </ul>
    </div>
  )
}

export default FooterIcons