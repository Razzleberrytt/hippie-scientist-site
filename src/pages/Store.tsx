import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'

export default function Store() {
  return (
    <>
      <Helmet>
        <title>Store - The Hippie Scientist</title>
        <meta name='description' content='Merchandise and resources coming soon.' />
      </Helmet>

      <div className='min-h-screen px-4 pt-20'>
        <div className='mx-auto max-w-2xl text-center'>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='text-gradient mb-6 text-5xl font-bold'
          >
            Store
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='glass-card p-8'
          >
            <h2 className='mb-4 text-2xl font-bold text-white'>Coming Soon</h2>
            <p className='text-gray-300'>Check back soon for merch and digital resources.</p>
          </motion.div>
        </div>
      </div>
    </>
  )
}
