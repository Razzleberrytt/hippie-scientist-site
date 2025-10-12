import React from 'react'
import Meta from '../components/Meta'
import Hero from '../components/Hero'
import StatRow from '../components/StatRow'
import { siteStats } from '../lib/stats'

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
        className='aurora relative isolate overflow-hidden text-text'
      >
        <Hero>
          <StatRow
            herbs={siteStats.herbs}
            compounds={siteStats.compounds}
            posts={siteStats.posts}
          />
        </Hero>
      </section>
    </>
  )
}
