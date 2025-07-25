import React from 'react'
import { Helmet } from 'react-helmet-async'
import Hero from '../components/Hero'
import StarfieldBackground from '../components/StarfieldBackground'
import FeaturedHerbTeaser from '../components/FeaturedHerbTeaser'

export default function Home() {
  return (
    <main
      id='home'
      aria-label='Site introduction'
      className='relative min-h-screen overflow-hidden bg-sunset-gradient animate-gradient pt-16 text-midnight dark:bg-space-night dark:text-sand'
    >
      <Helmet>
        <title>The Hippie Scientist - Psychedelic Botany</title>
        <meta
          name='description'
          content='Explore visionary botanicals, cognitive enhancers and research insights.'
        />
      </Helmet>
      <StarfieldBackground />
      <Hero />
      <section className='mx-auto mt-10 max-w-2xl space-y-4 rounded-xl bg-white/20 p-6 text-center backdrop-blur-md dark:bg-black/30'>
        <p>
          Welcome to The Hippie Scientist, a hub for psychedelic botany and conscious exploration.
          Browse our herb database, read up on the latest research and craft your own herbal blends.
        </p>
        <p className='text-sm text-sand/90'>Information provided is for educational purposes only.</p>
      </section>
      <FeaturedHerbTeaser />
    </main>
  )
}
