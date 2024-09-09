import React from 'react'
import FooterIcons from './tools/FooterIcons'

const Footer = () => {

  return (
    <footer id='contacto' className='w-full scroll-m-10 lg:h-[400px] bg-[#002337] p-3 flex lg:flex-row flex-col justify-center items-center gap-8'>
      <div className='w-[90%] md:w-1/2 h-1/2 md:h-full flex flex-col justify-center items-center gap-5 order-2 lg:order-1'>
        <FooterIcons />
      </div>
      <div className='md:w-1/2 w-[90%] h-full flex justify-center items-center flex-col order-1 lg:order-2 '>
        <div className='w-full h-4/6 flex justify-center items-center'>
          <img src="/icons/LOGO_GNS.svg" alt="Logo Génesis" className=' lg:w-auto lg:h-auto' />
        </div>
      </div>
    </footer>
  )
}

export default Footer