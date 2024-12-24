import { ArrowDownIcon } from '@heroicons/react/24/outline'
import React from 'react'
import { TypeAnimation } from 'react-type-animation'
import Title from './tools/Title'


const PrincipalLanding = () => {


  return (
    <section className='h-[100dvh] w-full relative overflow-hidden'>
      <div className="absolute inset-0 bg-[url(/Portada.png)] bg-cover bg-no-repeat bg-center opacity-90"></div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="w-full h-max flex justify-center items-center flex-col text-center px-[5%] mb-8">
          <h1 className="w-full md:w-[80%] text-[28px] md:text-5xl font-bold mb-6 text-white">
            Especialistas en RPG, Quiropraxia y Osteopatía
          </h1>
          <Title />
        </div>
        <a href="#servicios" className="inline-flex items-center bg-white text-[#002337] font-bold py-3 px-6 rounded-full hover:bg-blue-100 transition duration-300 absolute sm:mt-[40%] mt-[100%]">
          Explorar más
          <ArrowDownIcon className="w-5 h-5 ml-2" />
        </a>
      </div>
    </section>
  )
}

export default PrincipalLanding