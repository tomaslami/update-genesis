import { NavElements } from '@/helpers/data'
import Link from 'next/link'
import React from 'react'


const MenuItems = () => {
  return (
    <ul className='w-3/5 hidden md:flex justify-evenly'>
      {
        NavElements.map(({ id, link, title }) =>
          <li key={id} className=''>
            <Link className='font-bold text-[#0a0a0a] hover:text-[#5c5c5c] transition' href={link}>{title}</Link>
          </li>
        )
      }
    </ul>
  )
}

export default MenuItems