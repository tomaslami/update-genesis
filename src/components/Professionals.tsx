import React from 'react'
import ProfessionalCard from './tools/ProfessionalCard'
import { CardProfessionalsElements } from '../helpers/data'


const Professionals = () => {



  return (
    <section id='profesionales' className='w-full min-h-screen flex justify-start items-start md:p-10 p-4 flex-col gap-10'>
      <div className='flex justify-center items-center w-full h-1/5 '>
        <h1 className='w-full text-center text-2xl text-[#002337] font-extrabold '>NUESTROS PROFESIONALES</h1>
      </div>
      <div className='w-full h-full flex flex-col gap-24 items-end py-10' >
        {CardProfessionalsElements.map(pro => (
          <div className='w-full flex' style={{ flexDirection: pro.id % 2 === 0 ? 'row-reverse' : 'row' }}>
            <ProfessionalCard
              key={pro.id}
              image={pro.img}
              name={pro.name}
              title={pro.title}
              description={pro.description}
              socialMedia={pro.socialMedia}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default Professionals        