import { useEffect, useState } from 'react'
import Meta from '../components/Meta'
import EmailCapture from '@/components/EmailCapture'
import Hero from '@/components/Hero'
import { loadSiteCounts, siteStats } from '@/lib/stats'

export default function Home() {
  const [counts, setCounts] = useState(siteStats)

  // eslint-disable-next-line no-console
  console.log('App mounted')
  // eslint-disable-next-line no-console
  console.log('Rendering homepage')

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

      <EmailCapture />
    </>
  )
}
