import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Heart, Phone } from 'lucide-react'

const Safety: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Safety - The Hippie Scientist</title>
        <meta name="description" content="Essential harm reduction resources and safety information." />
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
              Safety First
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive harm reduction resources and safety guidelines
            </p>
          </motion.div>

          {/* Emergency Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-card p-6 mb-8 border-2 border-red-500 border-opacity-50"
          >
            <div className="flex items-center mb-4">
              <Phone className="h-6 w-6 text-red-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Emergency Resources</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Crisis Hotlines</h3>
                <p className="text-gray-300">Emergency: 911</p>
                <p className="text-gray-300">Crisis Text Line: Text HOME to 741741</p>
                <p className="text-gray-300">National Suicide Prevention Lifeline: 988</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Poison Control</h3>
                <p className="text-gray-300">National Poison Control: 1-800-222-1222</p>
                <p className="text-gray-300">Online: poison.org</p>
              </div>
            </div>
          </motion.div>

          {/* Safety Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Set & Setting',
                description: 'Understanding the importance of mindset and environment for safe experiences.',
              },
              {
                icon: Heart,
                title: 'Health Screening',
                description: 'Pre-experience health considerations and contraindications.',
              },
              {
                icon: AlertTriangle,
                title: 'Risk Assessment',
                description: 'Identifying and mitigating potential risks and interactions.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="glass-card p-6"
              >
                <item.icon className="h-12 w-12 mx-auto mb-4 text-psychedelic-purple" />
                <h3 className="text-xl font-bold mb-4 text-white text-center">{item.title}</h3>
                <p className="text-gray-300 text-center">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Safety
