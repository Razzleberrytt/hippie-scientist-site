import React from 'react'
import { Helmet } from 'react-helmet-async'
import Hero from '../components/Hero'
import StarfieldBackground from '../components/StarfieldBackground'

export default function Home() {
  return (
    <main
      id='home'
      aria-label='Site introduction'
      className='relative min-h-screen overflow-hidden bg-cosmic-forest animate-gradient pt-16 text-midnight dark:bg-space-night dark:text-sand'
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
      
    </main>
  )
}
