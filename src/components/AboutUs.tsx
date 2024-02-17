"use client"

import React from 'react'

const AboutUs = () => {
  return (
    <main id='nosotros' className='w-full md:h-[500px] h-[700px] flex flex-col justify-center items-center gap-5 lg:gap-8 '>
      <div className='flex justify-center items-center w-full h-1/12 '>
        <h1 className='text-center text-3xl text-[#002337] font-extrabold '>¿QUIÉNES SOMOS?</h1>
      </div>
      <div className='w-full px-10 h-10/12 flex md:flex-row flex-col justify-center items-center gap-7'>
        <div className='lg:w-1/2 w-full flex justify-end items-center'>
          <img src="/ABOUT-US.webp" alt="Ejercicios" className='lg:w-[500px] w-[400px] h-[200px] lg:h-[300px]' />
        </div>
        <div className='w-full lg:w-1/2 h-full flex justify-center items-start flex-col'>
          <p className='w-10/12 font-bold md:text-justify text-center text-base md:text-lg'>
            Somos <span className='text-[#F28C38]'>GENESIS</span> es un centro especializado en la evaluación y tratamiento de patologias osteomusculares. Es atendido única y exclusivamente por profesionales licenciados en Kinesiología y Fisiatría cada uno especializado en su método y con una amplia carrera en la profesión habiendo ejercido en centros y hospitales de renombre tanto del ambito pubico como privado.
          </p>
        </div>
      </div>
    </main>
  )
}

export default AboutUs