import React from 'react'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

const Safety: React.FC = () => {
  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Shield className="w-16 h-16 mx-auto mb-6 text-psychedelic-green" />
          <h1 className="text-4xl md:text-6xl font-bold mb-8 psychedelic-text font-display">
            Safety & Harm Reduction
          </h1>
          <div className="glass-card p-8 text-left max-w-4xl mx-auto">
            <p className="text-lg text-gray-300 leading-relaxed">
              Coming soon: Essential safety protocols, harm reduction information, 
              and responsible use guidelines for psychedelic exploration.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Safety
