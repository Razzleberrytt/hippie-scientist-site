import React from 'react'
import Meta from '../components/Meta'
import Hero from '../components/Hero'
import StarfieldBackground from '../components/StarfieldBackground'
import AuroraHero from '../components/AuroraHero'

export default function Home() {
  return (
    <>
      <Meta
        title='The Hippie Scientist — Mindful Exploration of Psychoactive Herbs'
        description='Independent research on psychoactive herbs, entheogens, and natural neurochemistry.'
        path='/'
        pageType='website'
      />
      <main
        id='home'
        aria-label='Site introduction'
        className='bg-cosmic-forest animate-gradient relative min-h-screen overflow-hidden pt-16 text-midnight dark:bg-space-night dark:text-sand'
      >
        <StarfieldBackground />
        <AuroraHero
          title="The Hippie Scientist"
          subtitle="Psychedelic Botany & Conscious Exploration"
        />
        <Hero />
      </main>
    </>
  )
}
