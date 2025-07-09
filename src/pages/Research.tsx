import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'

const Research: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Research - The Hippie Scientist</title>
        <meta name="description" content="Latest research in psychedelic science and consciousness studies." />
      </Helmet>
      
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 psychedelic-text">
              Research
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Exploring the frontiers of consciousness and psychedelic science
            </p>
          </motion.div>

          <div className="glass-card p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Coming Soon</h2>
            <p className="text-gray-300">
              This section will feature the latest research in psychedelic science, consciousness studies, and therapeutic applications.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Research
