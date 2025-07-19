import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Herb } from '../types'
import type Fuse from 'fuse.js'
import HerbCardAccordion from './HerbCardAccordion'
import Pagination from './Pagination'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

interface Props {
  herbs: Herb[]
  highlightQuery?: string
  matches?: Record<string, Fuse.FuseResultMatch[]>
  compact?: boolean
  pageSize?: number
}
const HerbList: React.FC<Props> = React.memo(({
  herbs,
  highlightQuery = '',
  matches = {},
  compact = false,
  pageSize = 30,
}) => {
  const [page, setPage] = React.useState(1)
  const totalPages = Math.ceil(herbs.length / pageSize)
  const current = React.useMemo(
    () => herbs.slice((page - 1) * pageSize, page * pageSize),
    [herbs, page, pageSize]
  )

  if (herbs.length === 0) {
    return <p className='text-center text-sand/80'>No herbs match your search.</p>
  }

  return (
    <>
      <motion.div
        key={current.map(h => h.id).join('-')}
        layout
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
      >
        <AnimatePresence>
          {current.map(h => (
            <motion.div
              key={h.id || h.name}
              variants={itemVariants}
              layout
              exit='exit'
            >
              <HerbCardAccordion herb={h} highlight={highlightQuery} matches={matches[h.id]} compact={compact} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </>
  )
})

export default HerbList
