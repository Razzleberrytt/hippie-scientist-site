import React from 'react'
import SEO from '../components/SEO'
import HeroSection from '../components/HeroSection'
import FeatureSection from '../components/FeatureSection'
import NewsletterSignup from '../components/NewsletterSignup'

export default function Home() {
  return (
    <main id='home' aria-label='Site introduction' className='space-y-24'>
      <SEO
        title='The Hippie Scientist - Psychedelic Botany'
        description='Explore visionary botanicals, cognitive enhancers and research insights.'
        keywords={['psychedelics', 'herbs', 'consciousness']}
      />
      <HeroSection />
      <FeatureSection />
      <NewsletterSignup />
    </main>
  )
}
