import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Herb } from '../types'
import HerbCardAccordion from './HerbCardAccordion'

interface Props {
  herbs: Herb[]
  highlightQuery?: string
  batchSize?: number
}
const HerbList: React.FC<Props> = ({ herbs, highlightQuery = '', batchSize = 24 }) => {
  const [visible, setVisible] = React.useState(batchSize)

  const showMore = () => setVisible(v => Math.min(v + batchSize, herbs.length))

  if (herbs.length === 0) {
    return <p className='text-center text-sand/80'>No herbs match your search.</p>
  }

  return (
    <>
      <motion.div
        layout
        className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
      >
        <AnimatePresence>
          {herbs.slice(0, visible).map(h => (
            <HerbCardAccordion
              key={h.id || h.name}
              herb={h}
              highlight={highlightQuery}
            />
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
