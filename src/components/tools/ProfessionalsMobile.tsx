import React from 'react'


type ProfessionalCardProps = {
  image: string
  name: string,
  title: string,
  item1: string,
  item2: string,
  item3: string,
  item4: string
}

const ProfessionalsMobile = ({ image, name, title, item1, item2, item3, item4 }: ProfessionalCardProps) => {
  return (
    <div className='professional-card lg:hidden flex justify-center items-center '>
      <div className='w-2/5 h-full flex justify-center items-center flex-col'>
        <div className='w-full h-2/3 flex justify-center items-center'>
          <img src={image} alt="Profesional Génesis" className='w-[100px]' />
        </div>

      </div>
      <div className='w-3/5 h-full flex justify-center items-start flex-col gap-3 pt-12'>
        <div className='w-full h-2/6 flex flex-col justify-end items-start pr-2'>
          <h1 className='text-[18px] font-bold md:text-'>{name}</h1>
          <h2 className='text-base font-normal md:text-xs'>{title}</h2>
        </div>
        <ul className='w-full h-4/6 flex justify-start items-start flex-col pl-6'>
          <li className='list-disc'>
            <h3 className='text-xs font-light '>{item1}</h3>
          </li>
          <li className='list-disc'>
            <h4 className='text-xs font-light '>{item2}</h4>
          </li>
          <li className='list-disc'>
            <h5 className='text-xs font-light '>{item3}</h5>
          </li>
          <li className='list-disc'>
            <h6 className='text-xs font-light '>{item4}</h6>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default ProfessionalsMobile