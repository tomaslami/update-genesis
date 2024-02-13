import React from 'react'
import '../tools/styles/special-styles.css'

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
      <div className='professional-card flex lg:flex-row flex-col justify-start items-center  md:pl-[50px] '>
        <div className='w-2/6 md:w-2/6 h-2/6 lg:full flex justify-center items-center flex-col'>
          <div className='w-full h-[178px] flex justify-center items-center'>
            <img src={image} alt="Profesional Génesis" className='w-[120px]' />
          </div>
        </div>
        <div className='w-5/6 h-4/6 md:h-full flex md:justify-center md:items-start justify-center items-center flex-col'>
          <h1 className='w-full md:text-3xl text-xl font-bold md:pb-1 text-center md:text-start '>{name}</h1>
          <h2 className='text-xl font-normal'>{title}</h2>
          <ul className='p-3 '>
            <li className='list-disc'>
              <h3 className='text-sm font-light '>{item1}</h3>
            </li>
            <li className='list-disc'>
              <h4 className='text-sm font-light '>{item2}</h4>
            </li>
            <li className='list-disc'>
              <h5 className='text-sm font-light '>{item3}</h5>
            </li>
            {
              item4 === '' ? <li></li> : <li className='list-disc'>
                <h6 className='text-sm font-light '>{item4}</h6>
              </li>
            }
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ProfessionalCard