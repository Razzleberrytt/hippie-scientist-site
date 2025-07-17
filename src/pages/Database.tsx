// src/pages/Database.tsx

import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import HerbList from '../components/HerbList'
import TagFilterBar from '../components/TagFilterBar'
import FloatingParticles from '../components/FloatingParticles'
import { useHerbs } from '../hooks/useHerbs'

export default function Database() {
  const herbs = useHerbs()
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])

  const allTags = React.useMemo(() => {
    const t = herbs.reduce<string[]>((acc, h) => acc.concat(h.tags), [])
    return Array.from(new Set(t))
  }, [herbs])

  const filtered = React.useMemo(() => {
    if (!selectedTags.length) return herbs
    return herbs.filter(h => selectedTags.every(t => h.tags.includes(t)))
  }, [herbs, selectedTags])

  return (
    <>
      <Helmet>
        <title>Database - The Hippie Scientist</title>
        <meta
          name='description'
          content='Browse herbal entries and expand each to learn more about their effects and usage.'
        />
      </Helmet>

      <div className='relative min-h-screen px-4 pt-20'>
        <FloatingParticles />
        <div className='relative mx-auto max-w-3xl'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='mb-8 text-center'
          >
            <h1 className='text-gradient mb-6 text-5xl font-bold'>Herb Database</h1>
            <p className='mx-auto max-w-3xl text-xl text-gray-300'>
              Explore our collection of herbs. Click any entry to see detailed information.
            </p>
          </motion.div>

          <TagFilterBar tags={allTags} selected={selectedTags} onChange={setSelectedTags} />
          <HerbList herbs={filtered} />
        </div>
      </div>
    </>
  )
}
