import React from 'react'
import '../tools/styles/special-styles.css'
import Image from 'next/image'

type ProfessionalCardProps = {
  image: string
  name: string,
  title: string,
  item1: string,
  item2: string,
  item3: string,
  item4: string
}

const ProfessionalCard = ({ image, name, title, item1, item2, item3, item4 }: ProfessionalCardProps) => {
  return (
    <div className='md:w-1/2 w-full flex justify-center items-center card-container'>
      <div className='professional-card flex lg:flex-row flex-col justify-start items-center lg:pl-[50px] '>
        <div className='w-2/6 md:w-2/6 h-2/6 lg:full flex justify-center items-center flex-col'>
          <div className='w-full h-[178px] flex justify-center items-center'>
            <Image src={image} alt="Profesional Génesis" width={120} height={120} className='rounded-xl' />
          </div>
        </div>
        <div className='w-5/6 h-4/6 md:h-full flex md:justify-center md:items-start justify-center items-center flex-col md:gap-3'>
          <div className='flex justify-center items-start flex-col w-full h-1/4 pt-5'>
            <h1 className='w-full md:text-3xl text-xl font-bold md:pb-1 text-center md:text-start text-[#002337]'>{name}</h1>
            <h2 className='text-xl font-normal'>{title}</h2>
          </div>
          <ul className='w-full h-3/4 px-3 flex justify-start items-start flex-col '>
            <li className='list-disc'>
              <h3 className='text-sm md:text-base font-light '>{item1}</h3>
            </li>
            <li className='list-disc'>
              <h4 className='text-sm md:text-base font-light '>{item2}</h4>
            </li>
            <li className='list-disc'>
              <h5 className='text-sm md:text-base font-light '>{item3}</h5>
            </li>
            {
              item4 === '' ? <li></li> : <li className='list-disc'>
                <h6 className='text-sm md:text-base font-light '>{item4}</h6>
              </li>
            }
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ProfessionalCard