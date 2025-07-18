import React from 'react'
import { Link } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import StarfieldBackground from '../components/StarfieldBackground'

export default function Home() {
  return (
    <main className='relative min-h-screen overflow-hidden bg-white text-black dark:bg-black dark:text-white px-4 py-10'>
      <StarfieldBackground />
      <HeroSection />
      <section className='mx-auto max-w-4xl text-center'>
        <Link
          to='/database'
          className='mt-8 inline-block rounded-md bg-black/30 px-6 py-3 text-white backdrop-blur-md hover:bg-white/10'
        >
          🌿 Browse Database
        </Link>
      </section>
    </main>
  )
}
