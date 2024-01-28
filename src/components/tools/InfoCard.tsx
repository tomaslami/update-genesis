import React from 'react'

type InfoCardProps = {
  title: string
  description: string
  image: string

}

const InfoCard = ({ title, description, image }: InfoCardProps) => {
  return (
    <div className='w-1/2 h-10/12 p-10 flex justify-center items-center'>
      <div className='w-[502px] h-[174px] gap-3 flex flex-col justify-center items-center'>
        <div className='w-full h-1/5 flex justify-start items-center flex-row  gap-3'>
          <h1 className='text-white font-medium text-2xl'>{title}</h1>
          <img src={image} alt='Logo_Especial' />
        </div>
        <div className='w-full flex flex-col gap-3'>
          <h2 className=' text-white font-normal text-[16px]'>{description}</h2>
          <button className=' text-[#002337] bg-white rounded-md w-[115px] h-[33px] font-bold'>Ver más</button>
        </div>
      </div>
    </div>
  )
}

export default InfoCard