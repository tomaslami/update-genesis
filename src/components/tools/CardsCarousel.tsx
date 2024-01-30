import React from 'react'



const CardsCarousel = () => {

  const CarouselElements = [
    {
      id: 1,
      img: '../../carousel/Imagen1.jpg',
    },
    {
      id: 2,
      img: '../../carousel/Imagen2.jpg',
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
      img: '../../carousel/Imagen7.webp',
    },
    {
      id: 8,
      img: '../../carousel/Imagen8.webp',
    },
    {
      id: 9,
      img: '../../carousel/Imagen9.webp',
    }
  ]

  const duplicatedElements = [...CarouselElements, ...CarouselElements, ...CarouselElements];

  return (
    <div className='flex w-full h-full overflow-hidden gap-10'>
      {duplicatedElements.map((item: { id: React.Key | null | undefined; img: string | undefined }) => (
        <div key={item.id} className='flex justify-center items-center  w-[250px] h-[300px] flex-shrink-0 animate-scroll scroll'>
          <img src={item.img} alt="Consultorio Génesis" className='w-full h-full' />
        </div>
      ))}
    </div>
  )
}

export default CardsCarousel