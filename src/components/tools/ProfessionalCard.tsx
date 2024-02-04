import React from 'react'
import '../tools/styles/special-styles.css'
import ProfessionalsMobile from './ProfessionalsMobile'

type ProfessionalCardProps = {
  image: string
  name: string,
  title: string,
  description: string,
  socialMedia: string,
}

const ProfessionalCard = ({ image, name, title, description, socialMedia }: ProfessionalCardProps) => {
  return (
    <div className='md:w-1/2 w-full flex justify-center items-center'>
      <div className='professional-card hidden lg:flex justify-start items-center py-[40px] pl-[40px] pr-[25px]'>
        <div className='w-2/5 h-full flex justify-start items-center flex-col'>
          <div className='w-full h-2/3 flex justify-start items-center'>
            <img src={image} alt="Profesional Génesis" className='w-[100px]' />
          </div>
          <div className='w-full h-1/3 flex justify-start items-end'>
            <a target='_blank' href={socialMedia}><img src="/icons/LINKEDIN.svg" alt="" /></a>
          </div>
        </div>
        <div className='w-3/5 h-4/5 flex justify-starts items-start flex-col'>
          <h1 className='text-3xl font-bold pb-1'>{name}</h1>
          <h2 className='text-xl font-normal'>{title}</h2>
          <h3 className='text-base font-light'>{description}</h3>
        </div>
      </div>
      <ProfessionalsMobile image={image} name={name} title={title} description={description} socialMedia={socialMedia} />
    </div>
  )
}

export default ProfessionalCard