import { Swiper, SwiperSlide } from 'swiper/react';
import { CarouselElements } from '../../helpers/data'

const CardsCarousel = () => {

  return (

    <div className='w-full h-full justify-center items-center flex px-5 gap-20 '>

      <Swiper
        centeredSlides={true}
        centerInsufficientSlides={true}
        slidesPerView={3}
        spaceBetween={40}
        loop={true}
        className='overflow-hidden w-full h-full flex justify-center items-center '
      >
        {CarouselElements.map(carousel => (
          <SwiperSlide key={carousel.id} className='w-[200px] h-[300px] justify-center items-center flex'>
            <img src={carousel.img} alt={`Imagen ${carousel.id}`} className='w-full h-full flex justify-center items-center rounded-xl' />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CardsCarousel;