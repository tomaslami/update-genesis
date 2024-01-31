import { Html } from 'next/document';
import React, { useEffect, useRef } from 'react';
import SwiperCore from 'swiper';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';



const CardsCarousel = () => {


  const CarouselElements = [
    {
      id: 1,
      img: '../../carousel/Imagen1.jpg',
    },
    {
      id: 2,
      img: '../../carousel/Imagen7.webp',
    },
    {
      id: 3,
      img: '../../carousel/Imagen3.jpg',
    },
    {
      id: 4,
      img: '../../carousel/Imagen4.jpg',
    },
    {
      id: 5,
      img: '../../carousel/Imagen5.webp',
    },
    {
      id: 6,
      img: '../../carousel/Imagen6.webp',
    },
    {
      id: 7,
      img: '../../carousel/Imagen2.jpg',
    },
    {
      id: 8,
      img: '../../carousel/Imagen9.webp',
    },
    {
      id: 9,
      img: '../../carousel/Imagen8.webp',
    }
  ]



  return (

    <div className='w-full h-full justify-center items-center flex px-5 gap-20 '>

      <Swiper
        centeredSlides={true}
        centerInsufficientSlides={true}
        slidesPerView={3}
        spaceBetween={40}
        loop={true}
        autoplay={{
          delay: 1000,
          disableOnInteraction: false,
        }}
        className='overflow-hidden w-full h-full flex justify-center items-center '
      >
        {CarouselElements.map(({ id, img }) => (
          <SwiperSlide key={id} className='w-[200px] h-[300px] justify-center items-center flex'>
            <img src={img} alt={`Imagen ${id}`} className='w-full h-full flex justify-center items-center rounded-xl' />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CardsCarousel;