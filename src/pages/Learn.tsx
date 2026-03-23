import React from 'react'
import { motion } from '@/lib/motion'
import PanelWrapper from '../components/PanelWrapper'
import LearnTabs from '../components/LearnTabs'
import StarfieldBackground from '../components/StarfieldBackground'
import FloatingParticles from '../components/FloatingParticles'
import { learnSections } from '../data/learnContent.enrichedXL'
import Meta from '../components/Meta'

export default function Learn() {
  return (
    <div className='relative min-h-screen px-4 pt-20'>
      <StarfieldBackground />
      <FloatingParticles />
      <div className='mx-auto max-w-5xl'>
        <Meta
          title='Learn - The Hippie Scientist'
          description='Educational resources on psychoactive herbs and practices.'
          path='/learn'
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className='mb-12 text-left'
        >
          <h1 className='text-gradient drop-shadow-glow mb-4 text-5xl font-bold md:text-6xl'>
            🌿 The Hippie Scientist Codex
          </h1>
          <p className='text-sand mx-auto max-w-3xl text-xl'>
            Welcome! Explore each topic below to deepen your understanding.
          </p>
        </motion.div>
        <PanelWrapper className='mx-auto max-w-5xl'>
          <LearnTabs sections={learnSections} />
        </PanelWrapper>
      </div>
    </div>
  )
}
