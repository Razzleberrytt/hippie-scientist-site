import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Atom, Brain, Heart, Users } from 'lucide-react'

const Home: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>The Hippie Scientist - Consciousness Research</title>
        <meta name="description" content="Explore consciousness through psychedelic research, ancient wisdom, and modern science." />
      </Helmet>
      
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 psychedelic-text">
              The Hippie Scientist
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Bridging ancient wisdom and modern science to explore the depths of consciousness
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {[
              { icon: Brain, title: 'Research', description: 'Latest findings in psychedelic science' },
              { icon: Atom, title: 'Database', description: 'Comprehensive substance information' },
              { icon: Heart, title: 'Safety', description: 'Harm reduction resources' },
              { icon: Users, title: 'Community', description: 'Connect with like-minded individuals' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="glass-card p-6 text-center"
              >
                <feature.icon className="h-12 w-12 mx-auto mb-4 text-psychedelic-purple" />
                <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
