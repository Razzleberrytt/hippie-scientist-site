import React from 'react'
import Hero from '../components/Hero'
import StarfieldBackground from '../components/StarfieldBackground'
import MouseTrail from '../components/MouseTrail'
import FeaturedHerbCarousel from '../components/FeaturedHerbCarousel'

export default function Home() {
  return (
    <main
      id='home'
      aria-label='Site introduction'
      className='relative min-h-screen overflow-hidden bg-white pt-16 text-black dark:bg-black dark:text-white'
    >
      <StarfieldBackground />
      <MouseTrail />
      <Hero />
      <div className='hidden md:block'>
        <FeaturedHerbCarousel />
      </div>
    </main>
  )
}
