import { NavElements } from '@/helpers/data'
import React from 'react'


const MenuItems = () => {
  return (
    <ul className='w-3/5 hidden md:flex justify-evenly'>
      {
        NavElements.map(nav =>
          <li key={nav.id} className=''>
            <a className='font-normal text-[#0a0a0a] hover:text-[#5c5c5c] transition' href={nav.link}>{nav.title}</a>
          </li>
        )
      }
    </ul>
  )
}

export default MenuItems