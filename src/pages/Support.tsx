import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'

export default function Support() {
  return (
    <>
      <Helmet>
        <title>Support Us - The Hippie Scientist</title>
        <meta name='description' content='Ways to support The Hippie Scientist project.' />
      </Helmet>

      <div className='min-h-screen px-4 pt-20'>
        <div className='mx-auto max-w-2xl'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='glass-card space-y-6 p-8 text-center'
          >
            <h1 className='text-gradient text-5xl font-bold'>Support Us</h1>
            <p className='text-lg text-sand'>
              If you enjoy our content and want to help the project grow, consider leaving a tip or buying us a coffee.
            </p>
            <div className='mx-auto h-24 w-48 rounded-md bg-black/20 dark:bg-white/10' />
            <p className='text-sm text-sand'>
              Placeholder for BuyMeACoffee or other tipping platform integration.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  )
}
