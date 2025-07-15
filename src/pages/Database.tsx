// src/pages/Database.tsx

import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { HerbCard } from '../components/HerbCard'
import SearchFilter from '../components/SearchFilter'
import { herbsData } from '../data/herbs'

export default function Database() {
  const [filteredHerbs, setFilteredHerbs] = React.useState(herbsData)

  return (
    <>
      <Helmet>
        <title>Database - The Hippie Scientist</title>
        <meta
          name='description'
          content='Browse herbal entries and expand each to learn more about their effects and usage.'
        />
      </Helmet>

      <div className='min-h-screen px-4 pt-20'>
        <div className='mx-auto max-w-7xl'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='mb-8 text-center'
          >
            <h1 className='psychedelic-text mb-6 text-5xl font-bold'>Herb Database</h1>
            <p className='mx-auto max-w-3xl text-xl text-gray-300'>
              Explore our collection of herbs. Click any entry to see detailed information.
            </p>
          </motion.div>

          <SearchFilter herbs={herbsData} onFilter={setFilteredHerbs} />

          <div className='space-y-4'>
            {filteredHerbs.map(herb => (
              <HerbCard key={herb.id} herb={herb} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
