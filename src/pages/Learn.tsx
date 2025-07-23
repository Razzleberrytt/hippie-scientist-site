import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import PanelWrapper from '../components/PanelWrapper'
import LearnTabs from '../components/LearnTabs'
import { learnSections } from '../data/learnContent.enrichedXL'

export default function Learn() {
  return (
    <div className='min-h-screen px-4 pt-20'>
      <div className='mx-auto max-w-5xl'>
        <Helmet>
          <title>Learn - The Hippie Scientist</title>
          <meta
            name='description'
            content='Educational resources on psychoactive herbs and practices.'
          />
        </Helmet>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className='mb-12 text-center'
        >
          <h1 className='text-gradient mb-4 text-5xl font-bold md:text-6xl'>
            🌿 The Hippie Scientist Codex
          </h1>
          <p className='mx-auto max-w-3xl text-xl text-sand'>
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
