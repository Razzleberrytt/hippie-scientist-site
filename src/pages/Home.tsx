import React from 'react'
import Meta from '../components/Meta'
import Hero from '../components/Hero'
import StarfieldBackground from '../components/StarfieldBackground'
import HeroCounters from '../components/HeroCounters'

const FALLBACK_COUNTS = { herbs: 381, compounds: 36, posts: 10 }

export default function Home() {
  const [counts, setCounts] = React.useState(FALLBACK_COUNTS)

  React.useEffect(() => {
    let alive = true
    const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/')
    fetch(`${base}stats.json`, { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : FALLBACK_COUNTS))
      .then((data: Partial<typeof FALLBACK_COUNTS>) => {
        if (!alive) return
        setCounts({
          herbs: typeof data.herbs === 'number' && data.herbs > 0 ? data.herbs : FALLBACK_COUNTS.herbs,
          compounds: typeof data.compounds === 'number' && data.compounds > 0 ? data.compounds : FALLBACK_COUNTS.compounds,
          posts: typeof data.posts === 'number' && data.posts > 0 ? data.posts : FALLBACK_COUNTS.posts,
        })
      })
      .catch(() => {
        if (alive) setCounts({ ...FALLBACK_COUNTS })
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
      <div
        id='home'
        aria-label='Site introduction'
        className='relative overflow-hidden text-midnight dark:bg-space-night dark:text-sand'
      >
        <div className='aurora absolute inset-0 -z-10' aria-hidden />
        <StarfieldBackground />
        <Hero>
          <HeroCounters
            items={[
              { label: 'psychoactive herbs', value: counts.herbs },
              { label: 'active compounds', value: counts.compounds },
              { label: 'articles', value: counts.posts },
            ]}
          />
        </Hero>
      </div>
    </>
  )
}
