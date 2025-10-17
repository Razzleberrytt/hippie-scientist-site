import { useEffect, useState } from 'react'
import Meta from '../components/Meta'
import NewsletterCard from '@/components/NewsletterCard'
import Hero from '@/components/Hero'
import { loadSiteCounts, siteStats } from '@/lib/stats'

export default function Home() {
  const [counts, setCounts] = useState(siteStats)

  useEffect(() => {
    let alive = true
    loadSiteCounts()
      .then(data => {
        if (!alive) return
        setCounts(data)
      })
      .catch(() => {
        /* ignore */
      })

    return () => {
      alive = false
    }
  }, [])

  return (
    <>
      <Meta
        title='The Hippie Scientist — Mindful Exploration of Psychoactive Herbs'
        description='Independent research on psychoactive herbs, entheogens, and natural neurochemistry.'
        path='/'
        pageType='website'
      />

      <Hero counts={counts} />

      <section
        aria-label='Newsletter signup'
        className='container mx-auto max-w-screen-md px-4 pb-12'
      >
        <NewsletterCard />
      </section>
    </>
  )
}
