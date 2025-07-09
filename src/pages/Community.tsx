import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Users, MessageCircle, Calendar, Book } from 'lucide-react'

const Community: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Community - The Hippie Scientist</title>
        <meta name="description" content="Connect with fellow consciousness explorers and researchers." />
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
              Community
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connect with fellow consciousness explorers and researchers
            </p>
          </motion.div>

          {/* Community Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {[
              {
                icon: MessageCircle,
                title: 'Discussion Forums',
                description: 'Join conversations about research, experiences, and insights.',
                action: 'Join Discussions',
              },
              {
                icon: Calendar,
                title: 'Events & Workshops',
                description: 'Attend virtual and in-person educational events.',
                action: 'View Events',
              },
              {
                icon: Book,
                title: 'Study Groups',
                description: 'Collaborate on research and share knowledge.',
                action: 'Find Groups',
              },
              {
                icon: Users,
                title: 'Mentorship',
                description: 'Connect with experienced researchers and practitioners.',
                action: 'Find Mentors',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="glass-card p-8"
              >
                <feature.icon className="h-12 w-12 mb-4 text-psychedelic-purple" />
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-300 mb-6">{feature.description}</p>
                <button className="glass-button px-6 py-3 rounded-lg text-white font-medium hover:scale-105 transition-all">
                  {feature.action}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Community Guidelines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="glass-card p-8"
          >
            <h2 className="text-3xl font-bold mb-6 text-white text-center">Community Guidelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-psychedelic-purple">Respect & Safety</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Treat all members with respect and kindness</li>
                  <li>• Prioritize harm reduction and safety</li>
                  <li>• No medical advice - consult professionals</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-psychedelic-purple">Quality Content</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Share evidence-based information</li>
                  <li>• Cite sources when possible</li>
                  <li>• Keep discussions constructive</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default Community
