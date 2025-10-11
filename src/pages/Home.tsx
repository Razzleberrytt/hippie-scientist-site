import React from 'react'
import Meta from '../components/Meta'
import Hero from '../components/Hero'
import StarfieldBackground from '../components/StarfieldBackground'

export default function Home() {
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
        <Hero />
      </div>
    </>
  )
}
