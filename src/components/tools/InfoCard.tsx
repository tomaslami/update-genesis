import React from 'react'

type InfoCardProps = {
  title: string
  description: string
  image: string

}

const InfoCard = ({ title, description, image }: InfoCardProps) => {
  return (
    <div className='w-1/2 h-10/12 p-10'>
      <div className='w-[502px] h-[174px] px-5 gap-5 flex flex-col'>
        <div className='w-full h-1/5 flex justify-start items-center flex-row  gap-5'>
          <h1 className='text-white font-medium text-2xl'>{title}</h1>
          <img src={image} alt='Logo_Especial' />
        </div>
        <h2 className='h-3/5 text-white font-thin text-sm'>{description}</h2>
        <div className='w-full h-1/5'>
          <button className='text-[#002337] bg-white rounded-md w-[115px] h-[33px] font-bold'>Ver más</button>
        </div>
      </div>
    </div>
  )
}

export default InfoCard