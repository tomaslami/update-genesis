"use client"
import { motion } from 'framer-motion';
import React, { useState } from 'react';

type InfoCardProps = {
  title: string;
  description: string;
  image: string;
  information_added: string;
};

const InfoCard = ({ title, description, image, information_added }: InfoCardProps) => {
  const [showInfo, setShowInfo] = useState(false);

  const handleToggleInfoAdd = () => {
    setShowInfo(!showInfo);
  };

  //  const handleToggleInfoDelete = () => {
  //  setShowInfo(!showInfo);
  // };

  const mergedText = showInfo ? `${description} ${information_added}` : description;
  const descriptionToShow = showInfo ? mergedText : `${description}..`;

  return (
    <div className='md:w-1/2 w-full h-10/12  flex justify-center items-center md:px-4 '>
      <div className='w-[502px] md:h-[275px] h-[250px]  flex flex-col justify-start items-center'>
        <div className='w-full h-1/5 flex justify-start items-center flex-row gap-3'>
          <h1 className=' text-white font-medium text-2xl'>{title}</h1>
          <img src={image} alt='Logo_Especial' />
        </div>
        <div className='w-full flex flex-col gap-3'>
          <motion.p

            className={`h-11/12 w-full text-clip text-white font-normal md:text-[16px] text-[14px] ${showInfo ? 'max-h-[500px] overflow-y-auto' : ''}`}>{descriptionToShow}</motion.p>
          <div className='flex justify-start items-center w-full h-1/12'>

            {!showInfo && (
              <button onClick={handleToggleInfoAdd} className='text-[#002337] bg-white rounded-md w-[115px] h-[33px] font-bold'>
                Ver más
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default InfoCard;