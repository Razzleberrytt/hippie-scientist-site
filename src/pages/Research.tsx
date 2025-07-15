import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'

const Research: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Research - The Hippie Scientist</title>
        <meta
          name='description'
          content='Latest research in psychedelic science and consciousness studies.'
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
            <h1 className='text-gradient mb-6 text-5xl font-bold md:text-6xl'>Research</h1>
            <p className='mx-auto max-w-3xl text-xl text-gray-300'>
              Exploring the frontiers of consciousness and psychedelic science
            </p>
          </motion.div>

          <div className='glass-card p-8 text-center'>
            <h2 className='mb-4 text-2xl font-bold text-white'>Coming Soon</h2>
            <p className='text-gray-300'>
              This section will feature the latest research in psychedelic science, consciousness
              studies, and therapeutic applications.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Research
