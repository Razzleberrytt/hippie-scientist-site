import React from 'react'
import SEO from '../components/SEO'
import { motion } from 'framer-motion'

export default function About() {
  return (
    <>
      <SEO
        title='About | The Hippie Scientist'
        description='Independent site exploring psychoactive herbs with scientific rigor and cultural context.'
        canonical='https://thehippiescientist.net/about'
      />
      <div className='min-h-screen px-4 pt-20'>
        <div className='mx-auto max-w-3xl space-y-8'>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='text-gradient mb-6 text-center text-5xl font-bold'
          >
            About
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='text-lg text-sand'
          >
            The Hippie Scientist is a grassroots project exploring the world of visionary botanicals
            and the science of consciousness. Our goal is to share accurate information, celebrate
            traditional knowledge and encourage safe, responsible exploration.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className='text-lg text-sand'
          >
            This site is maintained by a small collective of enthusiasts who believe that open
            education and community dialogue can help demystify these powerful plants and
            substances. We do not offer medical advice or promote irresponsible use.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className='text-lg text-sand'
          >
            Whether you are new to the topic or a seasoned researcher, we hope you find resources
            here that spark curiosity and support your personal journey.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className='text-lg text-sand'
          >
            We are committed to open access education and welcome contributions from the community.
            If you have suggestions or wish to collaborate, please reach out through our contact
            links.
          </motion.p>
        </div>
      </div>
    </>
  )
}
