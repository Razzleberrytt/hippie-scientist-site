import React from 'react'
import SEO from '../components/SEO'
import Hero from '../components/Hero'
import StarfieldBackground from '../components/StarfieldBackground'
import NewsletterSignup from '../components/NewsletterSignup'

export default function Home() {
  return (
    <main
      id='home'
      aria-label='Site introduction'
      className='bg-cosmic-forest animate-gradient relative min-h-screen overflow-hidden pt-16 text-midnight dark:bg-space-night dark:text-sand'
    >
      <SEO
        title='The Hippie Scientist - Psychedelic Botany'
        description='Explore visionary botanicals, cognitive enhancers and research insights.'
        keywords={['psychedelics', 'herbs', 'consciousness']}
      />
      <StarfieldBackground />
      <Hero />
      <NewsletterSignup />
    </main>
  )
}
