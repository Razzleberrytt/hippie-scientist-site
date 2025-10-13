import React from 'react'
import Meta from '../components/Meta'
import Hero from '../components/Hero'
import Stats from '@/components/Stats'
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
        <div className='mt-6'>
          <Stats
            items={[
              { value: siteStats.herbs, label: 'psychoactive herbs' },
              { value: siteStats.compounds, label: 'active compounds' },
              { value: siteStats.posts, label: 'articles' },
            ]}
          />
        </div>
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
