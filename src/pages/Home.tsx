import React from 'react'
import Hero from '../components/Hero'
import StarfieldBackground from '../components/StarfieldBackground'
import MouseTrail from '../components/MouseTrail'

export default function Home() {
  return (
    <main
      id='home'
      aria-label='Site introduction'
      className='relative min-h-screen overflow-hidden bg-gradient-to-br from-light-beige via-white to-light-beige animate-gradient pt-16 text-midnight dark:from-space-night dark:via-black dark:to-space-night dark:text-sand'
    >
      <StarfieldBackground />
      <MouseTrail />
      <Hero />
    </main>
  )
}
