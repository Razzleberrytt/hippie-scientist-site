import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Herb } from '../types'
import HerbCardAccordion from './HerbCardAccordion'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

interface Props {
  herbs: Herb[]
  highlightQuery?: string
  batchSize?: number
}

const isValidHerb = (h: any): h is Herb =>
  h && typeof h.name === 'string' && typeof h.id === 'string' && Array.isArray(h.effects)

const HerbList: React.FC<Props> = ({ herbs, highlightQuery = '', batchSize = 24 }) => {
  const [visible, setVisible] = React.useState(batchSize)

  const showMore = () => setVisible(v => Math.min(v + batchSize, herbs.length))

  const invalid = React.useMemo(() => herbs.filter(h => !isValidHerb(h)), [herbs])
  if (invalid.length) {
    console.error('Invalid herb data passed to HerbList:', invalid)
    return (
      <p className='text-center text-red-500'>Error loading herb entries.</p>
    )
  }

  if (herbs.length === 0) {
    return <p className='text-center text-sand/80'>No herbs match your search.</p>
  }

  return (
    <>
      <motion.div
        key={herbs.map(h => h.id).join('-')}
        layout
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
      >
        <AnimatePresence>
          {herbs.slice(0, visible).map(h => (
            <motion.div key={h.id || h.name} variants={itemVariants} layout>
              <HerbCardAccordion herb={h} highlight={highlightQuery} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {visible < herbs.length && (
        <div className='mt-6 text-center'>
          <button
            type='button'
            onClick={showMore}
            className='rounded-md bg-black/30 px-4 py-2 text-sand hover:bg-white/10 backdrop-blur-md'
          >
            Show More
          </button>
        </div>
      )}
    </>
  )
}

export default HerbList
