import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Search, Filter, Database as DatabaseIcon } from 'lucide-react'

const Database: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Database - The Hippie Scientist</title>
        <meta name="description" content="Comprehensive database of psychoactive substances and their effects." />
      </Helmet>
      
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 psychedelic-text">
              Database
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive information on psychoactive substances
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-card p-6 mb-8"
          >
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search substances..."
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-psychedelic-purple"
                />
              </div>
              <button className="glass-button p-3 rounded-lg hover:scale-105 transition-all">
                <Filter className="h-5 w-5 text-white" />
              </button>
            </div>
          </motion.div>

          {/* Database Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Psilocybin', category: 'Tryptamine', status: 'Research Active' },
              { name: 'LSD', category: 'Lysergamide', status: 'Research Active' },
              { name: 'MDMA', category: 'Phenethylamine', status: 'Clinical Trials' },
              { name: 'DMT', category: 'Tryptamine', status: 'Research Active' },
              { name: 'Ketamine', category: 'Dissociative', status: 'FDA Approved' },
              { name: 'Mescaline', category: 'Phenethylamine', status: 'Research Active' },
            ].map((substance, index) => (
              <motion.div
                key={substance.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="glass-card p-6 hover:scale-105 transition-all cursor-pointer"
              >
                <div className="flex items-center mb-3">
                  <DatabaseIcon className="h-6 w-6 text-psychedelic-purple mr-3" />
                  <h3 className="text-xl font-bold text-white">{substance.name}</h3>
                </div>
                <p className="text-gray-300 mb-2">Category: {substance.category}</p>
                <span className="inline-block px-3 py-1 bg-psychedelic-purple bg-opacity-20 text-psychedelic-purple rounded-full text-sm">
                  {substance.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Database
