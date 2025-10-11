import React from 'react'
import CountUp from 'react-countup'
import { herbs } from '../data/herbs/herbsfull'
import { baseCompounds } from '../data/compounds/compoundData'
import posts from '../data/blog/posts.json'

type BlogPost = { slug?: string }

export default function StatsCounters({ className = '' }: { className?: string }) {
  const herbCount = herbs.length
  const compoundCount = baseCompounds.length
  const postCount = (posts as BlogPost[]).filter(post => Boolean(post?.slug)).length

  return (
    <div className={`mx-auto mt-4 flex max-w-4xl flex-col items-center justify-center gap-6 text-center ${className}`}>
      <div className='flex flex-col items-center gap-6 sm:flex-row sm:gap-12'>
        <div className='text-lg sm:text-xl'>
          <CountUp end={herbCount} duration={2} />+ psychoactive herbs indexed
        </div>
        <div className='text-lg sm:text-xl'>
          <CountUp end={compoundCount} duration={2} />+ active compounds mapped
        </div>
      </div>
      <p className='text-sm text-white/70 sm:text-base'>
        <span className='font-medium text-white/85'>
          <CountUp end={herbCount} duration={2} />+ herbs ·{' '}
          <CountUp end={compoundCount} duration={2} />+ compounds ·{' '}
          <CountUp end={postCount} duration={2} />+ articles
        </span>
      </p>
    </div>
  )
}
