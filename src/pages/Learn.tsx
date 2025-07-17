import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { BookOpen, BrainCircuit, Compass } from 'lucide-react'

const modules = [
  {
    icon: BookOpen,
    title: 'Intro to Ethnobotany',
    description: 'Study the cultural history of visionary plants.',
  },
  {
    icon: BrainCircuit,
    title: 'Neuroscience Basics',
    description: 'Explore how these compounds affect the brain.',
  },
  {
    icon: Compass,
    title: 'Integration Practices',
    description: 'Techniques to ground and apply insights.',
  },
]

export default function Learn() {
  return (
    <>
      <Helmet>
        <title>Learn - The Hippie Scientist</title>
        <meta
          name='description'
          content='Educational resources to deepen your understanding of herbs and psychedelics.'
        />
      </Helmet>

      <div className='min-h-screen px-4 pt-20'>
        <div className='mx-auto max-w-7xl'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='mb-20 text-center'
          >
            <h1 className='text-gradient mb-6 text-5xl font-bold md:text-6xl'>Learn</h1>
            <p className='mx-auto max-w-3xl text-xl text-gray-300'>
              Self-paced lessons to expand your knowledge.
            </p>
          </motion.div>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
            {modules.map(({ icon: Icon, title, description }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className='glass-card p-6 text-center'
              >
                <Icon className='mx-auto mb-4 h-12 w-12 text-psychedelic-purple' />
                <h3 className='mb-2 text-xl font-bold text-white'>{title}</h3>
                <p className='text-gray-300'>{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
