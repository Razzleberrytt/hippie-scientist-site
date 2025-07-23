import React from 'react'
import CountUp from 'react-countup'
import herbData from '../data/herbData'

export default function StatsCounters({ className = '' }: { className?: string }) {
  const herbCount = herbData.filter(e => 'slug' in e).length
  const compoundCount = herbData.filter(e => 'foundIn' in e).length

  return (
    <div
      className={`mx-auto mt-4 flex max-w-4xl flex-col items-center justify-center gap-6 text-center sm:flex-row sm:gap-12 ${className}`}
    >
      <div className='text-lg sm:text-xl'>
        <CountUp end={herbCount} duration={2} />+ psychoactive herbs indexed
      </div>
      <div className='text-lg sm:text-xl'>
        <CountUp end={compoundCount} duration={2} />+ active compounds mapped
      </div>
      <div className='text-lg sm:text-xl'>Updated daily</div>
    </div>
  )
}
