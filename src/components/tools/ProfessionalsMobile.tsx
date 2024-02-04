import React from 'react'


type ProfessionalCardProps = {
  image: string
  name: string,
  title: string,
  description: string,
  socialMedia: string,
}

const ProfessionalsMobile = ({ image, name, title, description, socialMedia }: ProfessionalCardProps) => {
  return (
    <div className='professional-card lg:hidden flex justify-center items-center py-[20px] pl-[20px] pr-[20px]'>
      <div className='w-2/5 h-full flex justify-start items-center flex-col'>
        <div className='w-full h-2/3 flex justify-start items-center'>
          <img src={image} alt="Profesional Génesis" className='w-[100px]' />
        </div>
        <div className='w-full h-1/3 flex justify-start items-end'>
          <a target='_blank' href={socialMedia}><img src="/icons/LINKEDIN.svg" alt="" /></a>
        </div>
      </div>
      <div className='w-3/5 h-full flex justify-center items-start flex-col gap-3'>
        <h1 className='text-xl font-bold'>{name}</h1>
        <h3 className='text-sm font-light'>{description}</h3>
        <h2 className='text-base font-normal'>{title}</h2>
      </div>
    </div>
  )
}

export default ProfessionalsMobile