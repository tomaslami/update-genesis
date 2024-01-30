"use client"
import React from 'react'
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import CardsCarousel from './tools/CardsCarousel';

const Carousel = () => {


  return (
    <article className='w-full h-screen bg-[#f3f3f3] flex flex-col justify-center items-center'>

      <span className='bg-[#002337] w-full h-[100px]'></span>
      <div className='flex justify-center flex-row items-center w-full h-full order-1 z-0'>
        <CardsCarousel />
      </div>
      <div className='flex justify-center items-center w-full h-full order-1'>
      </div>
    </article>
  )
}

export default Carousel