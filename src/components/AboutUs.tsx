"use client"

import React from 'react'
import styled from 'styled-components';




const AboutUs = () => {
  return (
    <section id='nosotros' className='w-full h-screen flex flex-col bg-[#f3f3f3]  '>
      <div className='flex justify-center items-center w-full h-1/3'>
        <h1 className=' text-center text-3xl text-[#002337] font-extrabold '>¿QUIÉNES SOMOS?</h1>
      </div>
      <div className='w-full px-10 h-2/3 flex flex-row justify-center items-center gap-10'>
        <div className='w-1/2 flex justify-center items-center'>
          <img src="/ABOUT-US.webp" alt="Ejercicios" className='w-[500px] h-[300px]' />
        </div>
        <div className='w-1/2 h-full flex justify-center items-start flex-col'>
          <p className='w-11/12 font-extrabold text-justify text-lg'>
            Somos <span className='text-[#F28C38]'>GENESIS</span> un consultorio dedicado a la kinesiología que brinda servicios para la pronta recuperación de todos sus pacientes.
            Desde 2018 ofrecemos 8 tipos de rehabilitación distintos para todos los pacientes con cualquier capacidad, recomendado por los profesionales mas importantes del deporte, <span className='text-[#F28C38]'>GENESIS</span> fue premiado por la Universidad de Oxford como el “Mejor Consultorio Rehabilitador de 2021”
          </p>
        </div>
      </div>
    </section>
  )
}

export default AboutUs