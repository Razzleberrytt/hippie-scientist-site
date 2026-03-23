import React from 'react'
import { motion } from '@/lib/motion'

export const LoadingScreen: React.FC = () => {
  return (
    <div
      className='bg-cosmic-gradient fixed inset-0 z-50 flex items-center justify-center'
      role='status'
      aria-live='polite'
    >
      <div className='text-center'>
        <motion.div
          className='bg-psychedelic-gradient mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full'
          animate={{
            rotate: 360,
            boxShadow: [
              '0 0 20px rgba(139, 92, 246, 0.5)',
              '0 0 40px rgba(236, 72, 153, 0.8)',
              '0 0 20px rgba(139, 92, 246, 0.5)',
            ],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <span className='text-2xl font-bold text-white'>HS</span>
        </motion.div>

        <motion.h2
          className='font-display text-2xl font-bold text-white'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        >
          Loading...
        </motion.h2>
        <span className='sr-only'>Loading content, please wait</span>
      </div>
    </div>
  )
}
