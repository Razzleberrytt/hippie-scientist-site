import React from 'react'
import { AnimatePresence, motion } from '@/lib/motion'
import type { Herb } from '../types'
import HerbCard from './HerbCard'

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
  view?: 'grid' | 'list'
}
const HerbList: React.FC<Props> = ({
  herbs,
  highlightQuery = '',
  batchSize = 24,
  view = 'grid',
}) => {
  const [visible, setVisible] = React.useState(batchSize)

  const showMore = () => setVisible(v => Math.min(v + batchSize, herbs.length))

  if (herbs.length === 0) {
    return <p className='text-white/70/80 text-center'>No herbs match your search.</p>
  }

  return (
    <>
      <motion.div
        key={`${highlightQuery}-${herbs.map(h => h.id).join('-')}`}
        layout
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        viewport={{ once: true, amount: 0.2 }}
        className={
          view === 'grid'
            ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
            : 'flex flex-col gap-4'
        }
      >
        <AnimatePresence>
          {herbs.slice(0, visible).map(h => (
            <motion.div key={h.id || h.name} variants={itemVariants} layout>
              <HerbCard herb={h} performanceMode />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {visible < herbs.length && (
        <div className='mt-6 text-center'>
          <button
            type='button'
            onClick={showMore}
            className='rounded-md bg-black/30 px-4 py-2 text-white/70 backdrop-blur-md hover:bg-white/10'
          >
            Show More
          </button>
        </div>
      )}
    </>
  )
}

export default HerbList
