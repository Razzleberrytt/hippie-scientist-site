import React from 'react'
import { motion } from '@/lib/motion'

const LoadingSpinner: React.FC = () => {
  return (
    <div className='bg-cosmic-forest flex min-h-screen items-center justify-center'>
      <motion.div
        className='flex flex-col items-center space-y-4'
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className='relative'>
          <motion.div
            className='border-lichen h-16 w-16 rounded-full border-4 border-t-transparent'
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className='border-comet absolute inset-0 h-16 w-16 rounded-full border-4 border-b-transparent'
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <motion.p
          className='text-lg font-medium text-white'
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Loading...
        </motion.p>
      </motion.div>
    </div>
  )
}

export default LoadingSpinner
