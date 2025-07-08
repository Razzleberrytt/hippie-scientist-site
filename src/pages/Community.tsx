import React from 'react'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'

const Community: React.FC = () => {
  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Users className="w-16 h-16 mx-auto mb-6 text-psychedelic-pink" />
          <h1 className="text-4xl md:text-6xl font-bold mb-8 psychedelic-text font-display">
            Community Hub
          </h1>
          <div className="glass-card p-8 text-left max-w-4xl mx-auto">
            <p className="text-lg text-gray-300 leading-relaxed">
              Coming soon: Connect with fellow consciousness explorers, 
              share experiences, and learn from our growing community.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Community
