import React from 'react'
import { Helmet } from 'react-helmet-async'
import HeroSection from '../components/HeroSection'
import { useHerbs } from '../hooks/useHerbs'
import HerbList from '../components/HerbList'
import HerbCardAccordion from '../components/HerbCardAccordion'
import FloatingParticles from '../components/FloatingParticles'

export default function Home() {
  const herbs = useHerbs()
  const featured = herbs[0]

  return (
    <>
      <Helmet>
        <title>The Hippie Scientist</title>
        <meta name='description' content='Explore psychedelic botany and conscious exploration.' />
      </Helmet>
      <HeroSection />
      <div className='relative'>
        <FloatingParticles />
        <section className='relative mx-auto max-w-6xl space-y-12 px-4 py-16'>
          {featured && (
            <div>
              <h2 className='mb-4 font-display text-3xl text-gold'>Featured Herb</h2>
              <HerbCardAccordion herb={featured} />
            </div>
          )}
          <div>
            <h2 className='mb-4 font-display text-3xl text-gold'>Herb Index</h2>
            <HerbList herbs={herbs} />
          </div>
        </section>
      </div>
    </>
  )
}
