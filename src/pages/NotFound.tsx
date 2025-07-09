import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

const NotFound: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | The Hippie Scientist</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Helmet>
      
      <div className="min-h-screen pt-20 px-4 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="glass-card p-12"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-8xl font-bold psychedelic-text mb-4">404</h1>
              <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
              <p className="text-xl text-gray-300 mb-8">
                Looks like this page got lost in the cosmic void. Let's get you back on track!
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/"
                className="glass-button px-8 py-4 rounded-lg text-white font-medium hover:scale-105 transition-all flex items-center justify-center space-x-2"
              >
                <Home className="h-5 w-5" />
                <span>Go Home</span>
              </Link>
              <button
                onClick={() => window.history.back()}
                className="glass-button px-8 py-4 rounded-lg text-white font-medium hover:scale-105 transition-all flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Go Back</span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default NotFound
