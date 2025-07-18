import React from 'react'
import { Link } from 'react-router-dom'
import HeroSection from '../components/HeroSection'

export default function Home() {
  return (
    <main className='min-h-screen bg-white text-black dark:bg-black dark:text-white px-4 py-10'>
      <HeroSection />
      <section className='mx-auto max-w-4xl space-y-8 text-center'>
        <p className='text-lg sm:text-xl text-opal'>
          Discover visionary plants and natural allies for dreaming and healing.
        </p>
        <Link
          to='/database'
          className='inline-block rounded-md bg-black/30 px-6 py-3 text-white backdrop-blur-md hover:bg-white/10'
        >
          🌿 Explore the Herb Database
        </Link>
      </section>
    </main>
  )
}
