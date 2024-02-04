import React from 'react'

const PrincipalLanding = () => {
  return (
    <section className='h-screen w-full bg-cover bg-no-repeat bg-center bg-fixed bg-[url(/PORTADA.webp)]' >
      <div className='w-full h-full flex justify-end items-center flex-col minimal-bounce pb-5'>
        <a href="#servicios" className='flex justify-center items-center flex-col'>
          <h3 className='text-white font-medium text-base'>VER MÁS</h3>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="white" className="w-6 h-6 ">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
          </svg>
        </a>
      </div>
    </section>
  )
}

export default PrincipalLanding