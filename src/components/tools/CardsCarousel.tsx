import { Swiper, SwiperSlide } from 'swiper/react';
import { CarouselElements } from '../../helpers/data'
import { useEffect, useState } from 'react';

const CardsCarousel = () => {
  const [slidesToShow, setSlidesToShow] = useState(1.5);

  useEffect(() => {
    const handleResize = () => {
      // Actualizar el estado basado en el ancho de la pantalla
      if (window.innerWidth > 768) {
        setSlidesToShow(3);
      } else {
        setSlidesToShow(1.5);
      }
    };

    // Agregar un listener para el evento resize
    window.addEventListener('resize', handleResize);

    // Limpieza del efecto al desmontar el componente
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [])
  return (
    <div className='w-full md:h-[500px] h-[300px] justify-center items-center flex md:px-5  gap-20 '>
      <Swiper
        centeredSlides={true}
        centerInsufficientSlides={true}
        slidesPerView={slidesToShow}
        spaceBetween={40}
        loop={true}
        className='overflow-hidden w-full h-full flex justify-center items-center '
      >
        {CarouselElements.map(carousel => (
          <SwiperSlide key={carousel.id} className=' justify-center items-center flex'>
            <img src={carousel.img} alt={`Imagen ${carousel.id}`} className='w-full h-full flex justify-center items-center rounded-xl' />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CardsCarousel;