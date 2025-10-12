import React from 'react'
import Meta from '../components/Meta'
import Hero from '../components/Hero'
import StatRow from '../components/StatRow'
import { siteStats } from '../lib/stats'
import NewsletterCard from '@/components/NewsletterCard'

export default function Home() {
  return (
    <>
      <Meta
        title='The Hippie Scientist — Mindful Exploration of Psychoactive Herbs'
        description='Independent research on psychoactive herbs, entheogens, and natural neurochemistry.'
        path='/'
        pageType='website'
      />
      <section
        id='home'
        aria-label='Site introduction'
        className='relative py-16 sm:py-24'
      >
        <div className='container-safe'>
          <Hero>
            <StatRow
              herbs={siteStats.herbs}
              compounds={siteStats.compounds}
              posts={siteStats.posts}
              className='mt-8 sm:mt-12'
            />
          </Hero>
        </div>
      </section>

      <div className='container-safe' aria-label='Newsletter signup'>
        <NewsletterCard />
      </div>
    </>
  )
}
