import React from 'react'
import { motion } from 'framer-motion'

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-cosmic-gradient flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          className="w-24 h-24 mx-auto mb-4 bg-psychedelic-gradient rounded-full flex items-center justify-center"
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
          <span className="text-2xl font-bold text-white">HS</span>
        </motion.div>
        
        <motion.h2
          className="text-2xl font-display font-bold psychedelic-text mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Loading Consciousness
        </motion.h2>
      </div>
    </div>
  )
}
