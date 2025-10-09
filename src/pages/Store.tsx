import React from 'react'
import { motion } from 'framer-motion'
import Meta from '../components/Meta'

export default function Store() {
  return (
    <>
      <Meta
        title='Store - The Hippie Scientist'
        description='Merchandise and resources coming soon.'
        path='/store'
      />

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
            <h2 className='mb-6 text-3xl font-bold text-white'>Featured Items</h2>
            <ul className='mx-auto mb-6 max-w-md list-disc space-y-2 pl-5 text-left text-sand'>
              <li>Stickers and patches celebrating ethnobotany</li>
              <li>Digital field guides in PDF format</li>
              <li>Limited run T-shirts designed by community artists</li>
            </ul>
            <p className='text-sand'>
              Sign up to our newsletter to be notified when the shop goes live.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  )
}
