import React from 'react'
import { motion } from 'framer-motion'
import { Users, MessageCircle, Calendar, Book } from 'lucide-react'
import Meta from '../components/Meta'

const Community: React.FC = () => {
  return (
    <>
      <Meta
        title='Community - The Hippie Scientist'
        description='Connect with fellow consciousness explorers and researchers.'
        path='/community'
      />

      <div className='min-h-screen px-4 pt-20'>
        <div className='mx-auto max-w-7xl'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='mb-20 text-center'
          >
            <h1 className='text-gradient mb-6 text-5xl font-bold md:text-6xl'>Community</h1>
            <p className='mx-auto max-w-3xl text-xl text-sand'>
              Connect with fellow consciousness explorers and researchers
            </p>
          </motion.div>

          {/* Community Features */}
          <div className='mb-12 grid grid-cols-1 gap-8 md:grid-cols-2'>
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
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className='glass-card p-8'
                >
                  <Icon className='mb-4 h-12 w-12 text-psychedelic-purple' aria-hidden='true' />
                  <h3 className='mb-4 text-2xl font-bold text-white'>{feature.title}</h3>
                  <p className='mb-6 text-sand'>{feature.description}</p>
                  <button className='glass-button rounded-lg px-6 py-3 font-medium text-white transition-all hover:scale-105'>
                    {feature.action}
                  </button>
                </motion.div>
              )
            })}
          </div>

          {/* Community Guidelines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className='glass-card p-8'
          >
            <h2 className='mb-6 text-center text-3xl font-bold text-white'>Community Guidelines</h2>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div>
                <h3 className='mb-3 text-xl font-semibold text-psychedelic-purple'>
                  Respect & Safety
                </h3>
                <ul className='space-y-2 text-sand'>
                  <li>• Treat all members with respect and kindness</li>
                  <li>• Prioritize harm reduction and safety</li>
                  <li>• No medical advice - consult professionals</li>
                </ul>
              </div>
              <div>
                <h3 className='mb-3 text-xl font-semibold text-psychedelic-purple'>
                  Quality Content
                </h3>
                <ul className='space-y-2 text-sand'>
                  <li>• Share evidence-based information</li>
                  <li>• Cite sources when possible</li>
                  <li>• Keep discussions constructive</li>
                </ul>
              </div>
            </div>
            <p className='mt-6 text-center text-sm text-sand'>
              Please remember that all interactions are moderated according to these guidelines.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default Community
