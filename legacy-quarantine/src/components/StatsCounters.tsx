import React from 'react'
import { useHerbData } from '../lib/herb-data'
import { useCountUp } from '../hooks/useCountUp'
import { baseCompounds } from '../data/compounds/compoundData'
import posts from '../data/blog/posts.json'
import { formatKpis } from '../lib/stats'

type BlogPost = { slug?: string }

export default function StatsCounters({ className = '' }: { className?: string }) {
  const herbs = useHerbData()
  const herbCount = herbs.length
  const compoundCount = baseCompounds.length
  const postCount = (posts as BlogPost[]).filter(post => Boolean(post?.slug)).length
  const animatedHerbCount = useCountUp(herbCount, 2000)
  const animatedCompoundCount = useCountUp(compoundCount, 2000)
  const animatedPostCount = useCountUp(postCount, 2000)
  const kpis = formatKpis({ herbs: herbCount, compounds: compoundCount, articles: postCount })

  return (
    <p className={`mt-6 text-center text-lg text-zinc-300 ${className}`} aria-label={kpis}>
      <span className="sr-only">{kpis}</span>
      <span aria-hidden="true" className="font-medium text-white/85">
        {animatedHerbCount}+ herbs |{' '}
        {animatedCompoundCount}+ compounds |{' '}
        {animatedPostCount}+ articles
      </span>
    </p>
  )
}
