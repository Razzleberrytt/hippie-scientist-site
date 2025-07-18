import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Herb } from '../types'
import HerbCardAccordion from './HerbCardAccordion'

interface Props {
  herbs: Herb[]
}

const HerbList: React.FC<Props> = ({ herbs }) => {
  if (herbs.length === 0) {
    return <p className='text-center text-sand/80'>No herbs match your search.</p>
  }

  return (
    <motion.div
      layout
      className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
    >
      <AnimatePresence>
        {herbs.map(h => (
          <HerbCardAccordion key={h.id || h.name} herb={h} />
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

export default HerbList
