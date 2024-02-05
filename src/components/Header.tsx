import React from 'react'
import MenuItems from './tools/MenuItems'
import NavBarMobile from './tools/NavBarMobile'



const Header = () => {
  return (
    <header className='w-full h-[85px] bg-[#f3f3f3]'>
      <nav className='w-full h-full flex justify-center items-center'>
        <div className='w-2/5 h-full justify-start items-center hidden md:flex'>
          <img src="GNS-2.webp" alt="Génesis_Logo" className='w-[200px] h-[45px]' />
        </div>
        <MenuItems />
        <NavBarMobile />
      </nav>
    </header>
  )
}

export default Header