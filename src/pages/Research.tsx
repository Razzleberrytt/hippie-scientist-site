import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import NeuroHerbGraph from '../components/NeuroHerbGraph'

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
            <p className='mx-auto max-w-3xl text-xl text-sand'>
              Exploring the frontiers of consciousness and psychedelic science
            </p>
          </motion.div>

          <div className='glass-card p-8'>
            <h2 className='mb-6 text-center text-3xl font-bold text-white'>Current Studies</h2>
            <ul className='mx-auto mb-6 max-w-xl list-disc space-y-2 pl-5 text-left text-sand'>
              <li>Clinical trials evaluating psychedelic-assisted therapy</li>
              <li>Neuroimaging projects exploring brain connectivity</li>
              <li>Longitudinal surveys on integration practices</li>
            </ul>
            <p className='text-center text-sand'>
              This list highlights a few ongoing areas of investigation. Check back regularly for
              detailed summaries and links to published papers.
            </p>
            <div className='mt-8'>
              <NeuroHerbGraph />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Research
