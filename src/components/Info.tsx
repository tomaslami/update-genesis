import React from 'react'
import InfoCard from './tools/InfoCard'

const Info = () => {
  return (
    <section id='info' className='w-full min-h-screen bg-[#002337] flex justify-center items-center flex-col'>
      <h1 className='h-1/12 w-full text-center text-3xl p-8 text-white font-semibold nunito '>SERVICIOS DE REHABILITACION</h1>
      <div className='h-11/12 w-full flex-wrap flex justify-center items-center '>
        <InfoCard
          title='QUIROPRAXIA'
          description='Es una método utilizado para diagnosticar, tratar y prevenir alteraciones del sistema músculo-esquelético, y de los desórdenes que puedan provocar en la función del sistema nervioso y la salud...'
          image='/SKELETON.svg' />
        <InfoCard
          title='R.P.G'
          description='El método RPG (Reeducacion Postural Global) es un método basado en la individualidad de cada paciente, partiendo de los síntomas que presenta para así detectar y tratar la causa... ' image='/BONES.svg' />
        <InfoCard
          title='OSTEOPATIA'
          description='La Osteopatía es una terapéutica manual con bases filosóficas y científicas. Considera al cuerpo como una totalidad, la Osteopatía se basa en conocimientos científicos, de la anatomía, fisiología y biomecánica...'
          image='/BODY.svg' />
      </div>
    </section>
  )
}

export default Info