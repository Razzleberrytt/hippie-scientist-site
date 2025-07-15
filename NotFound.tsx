import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Home, Search, ArrowLeft } from 'lucide-react'

const NotFound: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found - The Hippie Scientist</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to explore consciousness research and psychedelic education." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen pt-20 px-4 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-card p-12 glow-subtle"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-8xl font-bold psychedelic-text mb-6"
            >
              404
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Page Not Found
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              The page you're looking for has drifted into another dimension. 
              Let's guide you back to familiar territory.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/"
                  className="glass-button bg-gradient-to-r from-psychedelic-purple to-psychedelic-pink text-white font-semibold px-8 py-4 rounded-full glow-medium inline-flex items-center gap-3"
                >
                  <Home className="w-5 h-5" />
                  Return Home
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/database"
                  className="glass-button px-8 py-4 rounded-full border border-psychedelic-cyan text-psychedelic-cyan hover:bg-psychedelic-cyan/10 inline-flex items-center gap-3"
                >
                  <Search className="w-5 h-5" />
                  Explore Database
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 pt-8 border-t border-gray-700"
            >
              <button
                onClick={() => {
                  window.history.back();
                }}
                className="text-psychedelic-cyan hover:text-psychedelic-purple transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default NotFound
