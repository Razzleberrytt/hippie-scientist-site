import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Herb } from '../types'
import HerbCardAccordion from './HerbCardAccordion'
import ErrorBoundary from './ErrorBoundary'
import HerbCardError from './HerbCardError'
import { sanitizeHerb } from '../utils/sanitizeHerb'

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
const HerbList: React.FC<Props> = ({ herbs, highlightQuery = '', batchSize = 24 }) => {
  const [visible, setVisible] = React.useState(batchSize)

  const safeHerbs = React.useMemo(() => {
    return herbs.map((h, i) => {
      try {
        return sanitizeHerb(h)
      } catch (e) {
        console.warn(`Bad herb at index ${i}:`, h)
        return sanitizeHerb({})
      }
    })
  }, [herbs])

  const showMore = () => setVisible(v => Math.min(v + batchSize, safeHerbs.length))

  if (safeHerbs.length === 0) {
    return <p className='text-center text-sand/80'>No valid herbs found.</p>
  }

  return (
    <>
      <motion.div
        key={safeHerbs.map(h => h.id).join('-')}
        layout
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
      >
        <AnimatePresence>
          {safeHerbs.slice(0, visible).map((h, idx) => (
            <motion.div key={h.id || h.name || idx} variants={itemVariants} layout>
              <ErrorBoundary fallback={<HerbCardError />}>
                <HerbCardAccordion herb={h} highlight={highlightQuery} />
              </ErrorBoundary>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {visible < safeHerbs.length && (
        <div className='mt-6 text-center'>
          <button
            type='button'
            onClick={showMore}
            className='rounded-md bg-black/30 px-4 py-2 text-sand backdrop-blur-md hover:bg-white/10'
          >
            Show More
          </button>
        </div>
      )}
    </>
  )
}

export default HerbList
