"use client"
import React from 'react'
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import CardsCarousel from './tools/CardsCarousel';

const Carousel = () => {


  return (
    <article className='w-full h-screen bg-[#f3f3f3] flex flex-col justify-center items-center'>
      <div className='flex justify-center  items-center w-full h-full'>
        <span className='bg-[#002337] w-full h-[150px] absolute '></span>
        <CardsCarousel />
      </div>
      <div className='flex justify-center items-center w-full h-full'>
      </div>
    </article>
  )
}

export default Carousel