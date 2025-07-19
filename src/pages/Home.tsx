import React from 'react'
import { Link } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import StarfieldBackground from '../components/StarfieldBackground'
import MouseTrail from '../components/MouseTrail'
import FeaturedHerbCarousel from '../components/FeaturedHerbCarousel'
import StatsCounters from '../components/StatsCounters'

export default function Home() {
  return (
    <main className='relative min-h-screen overflow-hidden bg-white px-4 pt-20 pb-0 md:pb-10 text-black dark:bg-black dark:text-white'>
      <StarfieldBackground />
      <MouseTrail />
      <HeroSection />
      <FeaturedHerbCarousel />
      <StatsCounters />
      <section className='mx-auto max-w-4xl text-center'>
        <Link
          to='/database'
          className='hover-glow mt-8 inline-block rounded-md bg-black/30 px-6 py-3 text-white backdrop-blur-md hover:rotate-1'
        >
          🌿 Browse Database
        </Link>
      </section>
    </main>
  )
}
