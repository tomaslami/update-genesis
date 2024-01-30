import React from 'react'


const NavElements = [
  {
    title: 'SERVICIOS',
    link: '#info'
  },
  {
    title: 'NOSOTROS',
    link: '#nosotros'

  },
  {
    title: 'PROFESIONALES',
    link: '#profesionales'
  },
  {
    title: 'CONTACTO',
    link: '#contacto'
  }
]

const Header = () => {
  return (
    <header className='w-full h-[85px] bg-[#f3f3f3] absolute'>
      <nav className='w-full h-full flex justify-center items-center'>
        <div className='w-2/5 h-full flex justify-start items-center'>
          <img src="GNS-2.webp" alt="Génesis_Logo" className='w-[200px] h-[45px]' />
        </div>
        <ul className='w-3/5 flex justify-evenly '>
          {
            NavElements.map(({ title, link }, index) =>
              <li key={index} className=''>
                <a className='font-normal text-[#0a0a0a] hover:text-[#5c5c5c] transition' href={link}>{title}</a>
              </li>
            )
          }
        </ul>
      </nav>
    </header>
  )
}

export default Header