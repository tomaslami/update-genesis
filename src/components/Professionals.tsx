import React from 'react'
import ProfessionalCard from './tools/ProfessionalCard'
import { CardProfessionalsElements } from '../helpers/data'


const Professionals = () => {

  return (
    <section id='profesionales' className='min-h-screen w-full flex justify-start items-start md:p-10 p-4 flex-col gap-10 bg-cover bg-no-repeat bg-center bg-[url(/FondoProfesionales_Mobile.png)] lg:bg-[url(/FondoProfesionales.svg)]'>
      <div className='flex flex-col justify-center items-center w-full h-1/5  '>
        <h1 className='w-full text-center text-2xl text-[#002337] font-extrabold '>NUESTROS PROFESIONALES</h1>
      </div>
      <div className='w-full h-full flex flex-col gap-24 items-end py-10' >
        {CardProfessionalsElements.map(pro => (
          <div key={pro.id}
            className='w-full flex ' style={{ flexDirection: pro.id % 2 === 0 ? 'row-reverse' : 'row' }}>
            <ProfessionalCard
              image={pro.img}
              name={pro.name}
              title={pro.title}
              item1={pro.item1}
              item2={pro.item2}
              item3={pro.item3}
              item4={pro.item4}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default Professionals        