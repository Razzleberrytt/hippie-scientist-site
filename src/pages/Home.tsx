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
        className='relative py-16 sm:py-24'
      >
        <div className='mx-auto max-w-5xl px-4 sm:px-6'>
          <Hero>
            <StatRow
              herbs={siteStats.herbs}
              compounds={siteStats.compounds}
              posts={siteStats.posts}
              className='mt-10 sm:mt-14'
            />
          </Hero>
        </div>
      </section>

      <section className='mx-auto mt-12 max-w-5xl px-4 sm:px-6' aria-label='Newsletter signup'>
        <div className='glass-card p-5 sm:p-6'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h2 className='text-2xl font-semibold tracking-tight'>Stay in the loop</h2>
              <p className='mt-1 text-sm text-neutral-100/70 sm:text-base'>
                Get field notes on new psychoactive herbs, blends, and research drops.
              </p>
            </div>
            <a
              className='btn-primary shrink-0'
              href='/#/newsletter'
            >
              Join the newsletter
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
