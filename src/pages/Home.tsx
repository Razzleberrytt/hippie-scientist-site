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
      <Hero>
        <StatRow
          herbs={siteStats.herbs}
          compounds={siteStats.compounds}
          posts={siteStats.posts}
          className='mt-6'
        />
      </Hero>

      <section
        aria-label='Newsletter signup'
        className='mx-auto max-w-screen-md w-full px-4 pb-12'
      >
        <NewsletterCard />
      </section>
    </>
  )
}
