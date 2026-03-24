import React from 'react'
import { motion } from '@/lib/motion'
import PanelWrapper from '../components/PanelWrapper'
import LearnTabs, { type LearnSection } from '../components/LearnTabs'
import StarfieldBackground from '../components/StarfieldBackground'
import FloatingParticles from '../components/FloatingParticles'
import Meta from '../components/Meta'

export default function Learn() {
  const [sections, setSections] = React.useState<LearnSection[] | null>(null)

  React.useEffect(() => {
    let alive = true
    import('../data/learnContent.enrichedXL')
      .then(module => {
        if (!alive) return
        setSections(module.learnSections as LearnSection[])
      })
      .catch(() => {
        if (!alive) return
        setSections([])
      })

    return () => {
      alive = false
    }
  }, [])

  return (
    <div className='relative min-h-screen px-4 pt-20'>
      <StarfieldBackground />
      <FloatingParticles />
      <div className='mx-auto max-w-5xl'>
        <Meta
          title='Learn - The Hippie Scientist'
          description='Educational resources on psychoactive herbs and practices.'
          path='/learning'
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className='mb-12 text-left'
        >
          <h1 className='gradient-text mb-4 text-5xl font-bold md:text-6xl'>
            🌿 The Hippie Scientist Codex
          </h1>
          <p className='mx-auto max-w-3xl text-xl text-white/70'>
            Welcome! Explore each topic below to deepen your understanding.
          </p>
        </motion.div>
        <PanelWrapper className='mx-auto max-w-5xl'>
          {sections ? (
            <LearnTabs sections={sections} />
          ) : (
            <div className='animate-pulse space-y-4' aria-busy='true' aria-live='polite'>
              <div className='h-8 w-64 rounded bg-white/10' />
              <div className='h-40 rounded-xl bg-white/10' />
            </div>
          )}
        </PanelWrapper>
      </div>
    </div>
  )
}
