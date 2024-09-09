"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import NavItems from './tools/NavItems'
import { cn } from '@/lib/utils'
import BarsIcon from './tools/BarsIcon'



const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [header, setHeader] = useState(false)

  const arrItems = [
    { title: 'Inicio', href: '#inicio' },
    { title: 'Servicios', href: '#servicios' },
    { title: 'Contacto', href: '#contacto' },
  ]
  return (
    <header className={cn(header ? "w-full h-[70px] fixed z-30 flex justify-start items-center top-0 lg:px-10 transition-all border-b-[1px] border-white/0" : "  bg-white w-full h-[70px] fixed z-30 flex justify-start items-center border-b-[1px] shadow-xl border-b-white/20 top-0 lg:px-10 transition-all",)}
      id='inicio'>
      <picture className='xl:w-[25%] h-full w-[60%] flex justify-center lg:justify-start items-center z-10'>
        <Link
          href={'/#inicio'}
        >
          <Image src={'/GNS-2.webp'} alt='Logo Lo de Lucas' width={210} height={210} quality={75} loading="lazy"></Image>
        </Link>
      </picture>
      <nav className='w-[65%] lg:w-full xl:w-[75%] h-full flex justify-end items-center xl:ml-[50%]'>
        <ul className='lg:flex hidden w-[50%] lg:w-full xl:w-[75%] justify-between items-center'>
          {arrItems.map((item, index) => (
            <NavItems key={index} title={item.title} href={item.href} className={cn(header ? "text-white" : "text-black")} />
          ))}
        </ul>
      </nav>

      <div className='w-[30%] h-full flex justify-center items-center lg:hidden'>
        <div className=" relative lg:hidden block z-50 rounded-xl">
          {
            isOpen === true || header === false ?
              <BarsIcon isOpen={isOpen} setIsOpen={setIsOpen} />
              :
              <svg onClick={() => setIsOpen(!isOpen)} width="50" height="50" viewBox="0 0 50 50" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.3335 35.9792V33.8958H41.6668V35.9792H8.3335ZM8.3335 26.0417V23.9583H41.6668V26.0417H8.3335ZM8.3335 16.1042V14.0208H41.6668V16.1042H8.3335Z" fill="white" />
              </svg>
          }
        </div>
      </div>

      <aside
        className={cn(header ?
          "fixed top-0 left-0 w-full h-screen bg-white lg:hidden flex flex-col -translate-x-full transition-all duration-500 justify-between items-center" :

          "fixed top-0 left-0 w-full h-screen bg-white lg:hidden flex flex-col -translate-x-full transition-all duration-500 justify-between items-center",

          {
            "translate-x-0 transition-all duration-500 backdrop-filter": isOpen,
          }
        )}
      >
        <div className="w-full h-[calc(100vh_-_80px)] flex items-center justify-start flex-col mt-20">
          <span className='w-[90%] h-[1px] bg-black'></span>
          <ul className="w-[90%] h-max flex items-start justify-start flex-col gap-12 mt-12">
            {arrItems.map((item, index) => (
              <NavItems
                key={index}
                title={item.title}
                href={item.href}
                action={() => setIsOpen(false)}
              />
            ))}
          </ul>
        </div>
      </aside>
    </header>
  )
}

export default Header