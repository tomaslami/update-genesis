import React from 'react'
import InfoCard from './tools/InfoCard'
import { InfoCardElements } from '../helpers/data'

const Info = () => {
  return (
    <section id='servicios' className='w-full min-h-screen bg-[#002337] flex justify-center items-center flex-col overflow-hidden'>
      <h1 className='h-1/12 w-full text-center md:text-3xl text-xl pt-8 text-white font-semibold nunito '>SERVICIOS DE REHABILITACION</h1>
      <div className='h-11/12 w-full md:flex-wrap flex-nowrap flex-col md:flex-row flex items-start md:items-center justify-center p-8 lg:gap-0 gap-5'>
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