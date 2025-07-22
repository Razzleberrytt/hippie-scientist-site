import React from 'react'
import Hero from '../components/Hero'
import StarfieldBackground from '../components/StarfieldBackground'
import MouseTrail from '../components/MouseTrail'

export default function Home() {
  return (
    <main
      id='home'
      aria-label='Site introduction'
      className='relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-950 via-blue-950 to-green-900 animate-gradient pt-16 text-black dark:text-white'
    >
      <StarfieldBackground />
      <MouseTrail />
      <Hero />
    </main>
  )
}
