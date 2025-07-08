import React from 'react'
import { motion } from 'framer-motion'
import { Microscope, FileText, TrendingUp } from 'lucide-react'

const Research: React.FC = () => {
  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <Microscope className="w-16 h-16 mx-auto mb-6 text-psychedelic-purple" />
          <h1 className="text-4xl md:text-6xl font-bold mb-8 psychedelic-text font-display">
            Psychedelic Research
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Cutting-edge scientific studies and breakthrough research in consciousness exploration
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="glass-card p-6 glow-subtle hover:glow-medium transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-psychedelic-cyan mr-3" />
                <span className="text-sm text-gray-400">Research Study</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Psilocybin Treatment Study {index + 1}
              </h3>
              <p className="text-gray-300 mb-4">
                Clinical research examining the therapeutic potential of psilocybin in treating depression and anxiety disorders.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-psychedelic-green">Published 2024</span>
                <TrendingUp className="w-4 h-4 text-psychedelic-pink" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Research
