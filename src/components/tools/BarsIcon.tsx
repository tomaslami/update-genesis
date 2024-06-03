import React from 'react'

type BarsIconProps = {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
}
const BarsIcon = ({ isOpen, setIsOpen }: BarsIconProps) => {
  return (
    <svg onClick={() => setIsOpen(!isOpen)} width="50" height="50" viewBox="0 0 50 50" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.3335 35.9792V33.8958H41.6668V35.9792H8.3335ZM8.3335 26.0417V23.9583H41.6668V26.0417H8.3335ZM8.3335 16.1042V14.0208H41.6668V16.1042H8.3335Z" fill="#0E0E0E" />
    </svg>
  )
}

export default BarsIcon
