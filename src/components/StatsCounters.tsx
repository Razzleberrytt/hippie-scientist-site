import React from 'react'
import CountUp from 'react-countup'
import herbs from '../data/herbs'
import { baseCompounds } from '../data/compoundData'

export default function StatsCounters() {
  return (
    <div className='mx-auto mt-4 flex max-w-4xl flex-col items-center justify-center gap-6 text-center sm:flex-row sm:gap-12'>
      <div className='text-lg sm:text-xl'>
        <CountUp end={herbs.length} duration={2} />+ psychoactive herbs indexed
      </div>
      <div className='text-lg sm:text-xl'>
        <CountUp end={baseCompounds.length} duration={2} />+ active compounds mapped
      </div>
      <div className='text-lg sm:text-xl'>Updated daily</div>
    </div>
  )
}
