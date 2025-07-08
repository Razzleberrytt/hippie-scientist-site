import React from 'react'
import { motion } from 'framer-motion'
import { Database as DatabaseIcon, Search, Filter } from 'lucide-react'

const Database: React.FC = () => {
  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <DatabaseIcon className="w-16 h-16 mx-auto mb-6 text-psychedelic-cyan" />
          <h1 className="text-4xl md:text-6xl font-bold mb-8 psychedelic-text font-display">
            Sacred Database
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Comprehensive collection of psychoactive compounds, plants, and traditional medicines
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="glass-card p-6 mb-12"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search substances..."
                className="w-full pl-10 pr-4 py-3 bg-glass-dark border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-psychedelic-purple"
              />
            </div>
            <button className="glass-button flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filter
            </button>
          </div>
        </motion.div>

        {/* Database Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {['Psilocybin', 'LSD', 'DMT', 'MDMA', 'Ayahuasca', 'Cannabis'].map((substance, index) => (
            <motion.div
              key={substance}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="glass-card p-6 glow-subtle hover:glow-medium transition-all duration-300 cursor-pointer"
            >
              <h3 className="text-xl font-bold mb-3 psychedelic-text">
                {substance}
              </h3>
              <p className="text-gray-300 mb-4">
                Detailed information about {substance.toLowerCase()}, including effects, dosage, and safety protocols.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-psychedelic-green">Plant Medicine</span>
                <span className="text-sm text-psychedelic-pink">View Details</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Database
