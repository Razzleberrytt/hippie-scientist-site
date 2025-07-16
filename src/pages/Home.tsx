import React from 'react'
import { Helmet } from 'react-helmet-async'
import HeroSection from '../components/HeroSection'
import { useHerbs } from '../hooks/useHerbs'
import HerbCard from '../components/HerbCard'

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
      <section className='mx-auto max-w-6xl space-y-12 px-4 py-16'>
        {featured && (
          <div>
            <h2 className='mb-4 font-display text-3xl text-gold'>Featured Herb</h2>
            <HerbCard herb={featured} />
          </div>
        )}
        <div>
          <h2 className='mb-4 font-display text-3xl text-gold'>Herb Index</h2>
          <div className='grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
            {herbs.map(h => (
              <HerbCard key={h.id || h.name} herb={h} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
