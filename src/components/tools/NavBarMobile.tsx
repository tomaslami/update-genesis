"use client"

import { NavElements, variants } from '@/helpers/data'
import { AnimatePresence, motion, useCycle, useScroll } from 'framer-motion'
import React, { useEffect } from 'react'

const NavBarMobile = () => {
  const [mobileNav, toggleMobileNav] = useCycle(false, true)


  return (
    <div className='w-full h-full md:hidden flex justify-end items-center px-5'>
      <div className={` z-10 ${mobileNav ? 'open' : 'closed'} ${mobileNav ? 'fixed' : 'flex'}`}>

        <motion.button
          animate={mobileNav ? 'open' : 'closed'}
          onClick={() => { toggleMobileNav() }}
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