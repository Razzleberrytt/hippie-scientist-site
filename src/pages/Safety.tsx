import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Heart, Phone } from 'lucide-react'

const Safety: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Safety - The Hippie Scientist</title>
        <meta
          name='description'
          content='Essential harm reduction resources and safety information.'
        />
      </Helmet>

      <div className='min-h-screen px-4 pt-20'>
        <div className='mx-auto max-w-7xl'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='mb-20 text-center'
          >
            <h1 className='text-gradient mb-6 text-5xl font-bold md:text-6xl'>Safety First</h1>
            <p className='mx-auto max-w-3xl text-xl text-gray-300'>
              Comprehensive harm reduction resources and safety guidelines
            </p>
          </motion.div>

          {/* Emergency Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='glass-card mb-8 border-2 border-red-500 border-opacity-50 p-6'
          >
            <div className='mb-4 flex items-center'>
              <Phone className='mr-3 h-6 w-6 text-red-400' />
              <h2 className='text-2xl font-bold text-white'>Emergency Resources</h2>
            </div>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <h3 className='mb-2 text-lg font-semibold text-white'>Crisis Hotlines</h3>
                <p className='text-gray-300'>Emergency: 911</p>
                <p className='text-gray-300'>Crisis Text Line: Text HOME to 741741</p>
                <p className='text-gray-300'>National Suicide Prevention Lifeline: 988</p>
              </div>
              <div>
                <h3 className='mb-2 text-lg font-semibold text-white'>Poison Control</h3>
                <p className='text-gray-300'>National Poison Control: 1-800-222-1222</p>
                <p className='text-gray-300'>Online: poison.org</p>
              </div>
            </div>
          </motion.div>

          {/* Safety Guidelines */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {(
              [
                {
                  icon: Shield,
                  title: 'Set & Setting',
                  description:
                    'Understanding the importance of mindset and environment for safe experiences.',
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
              ] as { icon: React.ElementType; title: string; description: string }[]
            ).map(({ icon: Icon, title, description }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className='glass-card p-6'
              >
                <Icon className='mx-auto mb-4 h-12 w-12 text-psychedelic-purple' />
                <h3 className='mb-4 text-center text-xl font-bold text-white'>{title}</h3>
                <p className='text-center text-gray-300'>{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Safety
