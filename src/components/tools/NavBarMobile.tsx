'use client'
import { motion } from 'framer-motion'
import React from 'react'

const NavBarMobile = () => {


  return (
    <div className='w-full h-full md:hidden flex justify-end items-center px-5'>
      <div className=''>
        <motion.button
          className='flex flex-col space-y-1'>
          <motion.span
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: 46, y: 6 }
            }}
            className='w-6 h-[2px] rounded-xl bg-black block'></motion.span>
          <motion.span
            variants={{
              closed: { opacity: 1 },
              open: { opacity: 0 }
            }}
            className='w-6 h-[2px] rounded-xl bg-black block'></motion.span>
          <motion.span
            variants={{
              closed: { rotate: 0 },
              open: { rotate: -46, y: -6 }
            }}
            className='w-6 h-[2px] rounded-xl bg-black block'></motion.span>
        </motion.button>
      </div>
    </div>
  )
}

export default NavBarMobile