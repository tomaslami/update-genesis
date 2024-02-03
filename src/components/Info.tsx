import React from 'react'
import InfoCard from './tools/InfoCard'
import { InfoCardElements } from '../helpers/data'

const Info = () => {
  return (
    <section id='servicio' className='w-full min-h-screen bg-[#002337] flex justify-center items-center flex-col overflow-hidden'>
      <h1 className='h-1/12 w-full text-center text-3xl p-8 text-white font-semibold nunito '>SERVICIOS DE REHABILITACION</h1>
      <div className='h-11/12 w-full flex-wrap flex justify-center items-center '>
        {InfoCardElements.map(info => (
          <InfoCard
            key={info.id}
            title={info.title}
            description={info.description}
            image={info.image}
            information_added={info.information_added}
          />

        ))}
      </div>
    </section>
  )
}

export default Info