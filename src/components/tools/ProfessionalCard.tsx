import React from 'react'
import '../tools/styles/special-styles.css'

type ProfessionalCardProps = {
  image: string
  name: string,
  title: string,
  description: string,
  socialMedia: string,
}

const ProfessionalCard = ({ image, name, title, description, socialMedia }: ProfessionalCardProps) => {
  return (
    <div className='w-1/2 flex justify-center items-center'>
      <div className='professional-card flex justify-start items-center py-[40px] pl-[40px] pr-[25px]'>
        <div className='w-2/5 h-4/5 flex justify-center items-center'>
          <img src={image} alt="Profesional Génesis" className='w-[150px]' />
        </div>
        <div className='w-3/5 h-4/5 flex justify-starts items-start flex-col'>
          <h1 className='text-3xl font-bold pb-1'>{name}</h1>
          <h2 className='text-xl font-normal'>{title}</h2>
          <h3 className='text-base font-light'>{description}</h3>
          <a target='_blank' href={socialMedia}>aaaa</a>
        </div>
      </div>
    </div>
  )
}

export default ProfessionalCard