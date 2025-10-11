import React from 'react'
import CountUp from 'react-countup'
import { herbs } from '../data/herbs/herbsfull'
import { baseCompounds } from '../data/compounds/compoundData'
import posts from '../data/blog/posts.json'
import { formatKpis } from '../lib/stats'

type BlogPost = { slug?: string }

export default function StatsCounters({ className = '' }: { className?: string }) {
  const herbCount = herbs.length
  const compoundCount = baseCompounds.length
  const postCount = (posts as BlogPost[]).filter(post => Boolean(post?.slug)).length
  const kpis = formatKpis({ herbs: herbCount, compounds: compoundCount, posts: postCount })

  return (
    <p className={`mt-6 text-lg text-zinc-300 text-center ${className}`} aria-label={kpis}>
      <span className='sr-only'>{kpis}</span>
      <span aria-hidden='true' className='font-medium text-white/85'>
        <CountUp end={herbCount} duration={2} />+ herbs ·{' '}
        <CountUp end={compoundCount} duration={2} />+ compounds ·{' '}
        <CountUp end={postCount} duration={2} />+ articles
      </span>
    </p>
  )
}
