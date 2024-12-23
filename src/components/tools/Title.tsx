"use client"
import React from 'react'
import { TypeAnimation } from 'react-type-animation'

const Title = () => {
  const contents = [
    ' recuperar tu movilidad...',
    ' mejorar tu calidad de vida...',
    ' realizar una rehabilitación efectiva...',
    ' recuperar tu equilibrio y fuerza..',
  ]
  return (
    <p className="text-xl md:text-2xl mb-8 text-white">
      Te ayudamos a
      <TypeAnimation
        sequence={[
          contents[0],
          2000,
          contents[1],
          2000,
          contents[2],
          2000,
          contents[3],
          2000,
          contents[4],
          2000,
          contents[5],
          2000,
        ]}
        wrapper="span"
        speed={30}
        deletionSpeed={40}
        repeat={Infinity}

      /></p>
  )
}

export default Title