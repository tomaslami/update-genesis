import Link from 'next/link'
import React from 'react'
import { cn } from '@/lib/utils';


type NavItemsProps = {
  title: string
  href: string
  action?: () => void
  className?: string
}

const NavItems = ({ title, href, action, className }: NavItemsProps) => {
  return (
    <li className='list-none'>
      <Link onClick={action} href={href} className={cn(`font-normal text-lg`, className)}>{title}</Link>
    </li>
  )
}

export default NavItems