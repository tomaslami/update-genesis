import { FooterElements } from '@/helpers/data'
import React from 'react'

const FooterIcons = () => {
  return (
    <div className='lg:w-2/3 w-full h-3/6 flex flex-col justify-center items-center gap-10'>
      {FooterElements.map(footer => (
        <div className='w-full flex justify-center items-center'>

          <ul key={footer.id} className='w-full flex justify-start items-center flex-row gap-4'>
            <li>
              <img src={footer.icon} alt={footer.img_alt} className='text-white text-lg font-light' />
            </li>
            <li>
              <h4 className='text-white text-base font-normal'>{footer.text}</h4>
            </li>
          </ul>
        </div>
      ))}
      <ul className='w-full flex justify-between pt-10 lg:pt-0'>
        <li>
          <img src="/icons/IG.svg" alt="Instagram" className='' />
        </li>
        <li>
          <img src="/icons/FB.svg " alt="Facebook" className='' />
        </li>
        <li>
          <img src="/icons/WPP.svg" alt="WhatsApp" className='' />
        </li>
      </ul>
    </div>
  )
}

export default FooterIcons