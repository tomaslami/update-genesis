import { FooterElements } from '@/helpers/data'
import React from 'react'

const FooterIcons = () => {
  return (
    <div className='w-1/2 h-3/6 flex flex-col justify-center items-center gap-10'>
      {FooterElements.map(footer => (
        <div className='w-full flex justify-center items-center'>

          <ul key={footer.id} className='w-full flex justify-start items-center flex-row gap-4'>
            <li>
              <img src={footer.icon} alt={footer.img_alt} className='text-white text-lg font-light' />
            </li>
            <li>
              <h1 className='text-white text-lg font-normal'>{footer.text}</h1>
            </li>
          </ul>
        </div>
      ))}
      <ul className='w-full flex justify-between'>
        <li>
          <img src="/icons/IG.svg" alt="" />
        </li>
        <li>
          <img src="/icons/FB.svg " alt="" />
        </li>
        <li>
          <img src="/icons/WPP.svg" alt="" />
        </li>
      </ul>
    </div>
  )
}

export default FooterIcons