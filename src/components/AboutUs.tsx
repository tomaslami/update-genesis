"use client"

import React from 'react'
import Carousel from './Carousel'

const AboutUs = () => {
  return (
    <main id='nosotros' className='w-full md:min-h-screen h-screen flex flex-col justify-center items-center gap-20 lg:gap-0 pt-7 md:pt-0 '>
      <div className='flex justify-center items-center w-full h-1/5 '>
        <h1 className='text-center text-3xl text-[#002337] font-extrabold '>¿QUIÉNES SOMOS?</h1>
      </div>
      <div className='w-full px-10 h-3/5 flex md:flex-row flex-col justify-center items-center gap-7'>
        <div className='md:w-1/2 w-full flex justify-center items-center'>
          <img src="/ABOUT-US.webp" alt="Ejercicios" className='md:w-[500px] w-[400px] h-[200px] md:h-[300px]' />
        </div>
        <div className='w-full md:w-1/2 h-full flex justify-center items-center flex-col'>
          <p className='w-11/12 font-bold text-justify text-base'>
            Somos <span className='text-[#F28C38]'>GENESIS</span> es un centro especializado en la evaluación y tratamiento de patologias osteomusculares. Es atendido única y exclusivamente por profesionales licenciados en Kinesiología y Fisiatria cada uno especializado en su método y con una amplia carrera en la profesión habiendo ejercido en centros y hospitales de renombre tanto del ambito pubico como privado.
          </p>
        </div>
      </div>
    </main>
  )
}

export default AboutUs