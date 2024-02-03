"use client"

import { NavElements, variants } from '@/helpers/data'
import { AnimatePresence, motion, useCycle } from 'framer-motion'
import React from 'react'

const NavBarMobile = () => {
  const [mobileNav, toggleMobileNav] = useCycle(false, true)

  return (
    <div className='w-full h-full md:hidden flex justify-end items-center px-5'>
      <motion.button
        animate={mobileNav ? 'open' : 'closed'}
        onClick={() => toggleMobileNav()}
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
      <AnimatePresence>
        {mobileNav && (
          <motion.div
            variants={{
              open: {
                x: '0%'

              },
              closed: {
                x: '-100%',

              }
            }}
            exit="closed"
            initial="closed"
            animate="open"
            className='absolute overflow-y-hidden bg-[#f3f3f3] -inset-x-60 inset-y-0 z-50 md:hidden flex flex-col items-center justify-center w-full min-h-screen'>
            <ul className='w-[200px] h-[400px] flex items-start flex-col justify-evenly'>
              {
                NavElements.map(nav =>
                  <motion.li
                    variants={variants}
                    key={nav.id}
                    animate={mobileNav ? 'open' : 'closed'}
                    onClick={() => toggleMobileNav()}
                    className='list-none text-center flex flex-col justify-center items-center  '
                  >
                    <a className=' text-[#0a0a0a] hover:text-[#5c5c5c] transition font-bold' href={nav.link}>{nav.title}</a>
                  </motion.li>
                )
              }
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NavBarMobile