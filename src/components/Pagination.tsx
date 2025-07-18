import React from 'react'
import { motion } from 'framer-motion'

interface Props {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<Props> = ({ currentPage, totalPages, onPageChange }) => {
  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | string)[] = [1]
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    if (start > 2) pages.push('…')
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < totalPages - 1) pages.push('…')
    pages.push(totalPages)
    return pages
  }
  const pages = getPages()
  return (
    <div className='mb-8 mt-4 flex flex-nowrap justify-center gap-2 overflow-x-auto sm:flex-wrap'>
      <button
        type='button'
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className='rounded px-2 py-1 text-sm text-sand disabled:opacity-50'
      >
        Prev
      </button>
      {pages.map((p, i) =>
        typeof p === 'number' ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            key={p}
            onClick={() => onPageChange(p)}
            className={`rounded px-2 py-1 text-sm ${p === currentPage ? 'bg-cosmic-purple text-white' : 'text-sand'}`}
          >
            {p}
          </motion.button>
        ) : (
          <span key={`ellipsis-${i}`} className='px-2 py-1 text-sand'>
            {p}
          </span>
        )
      )}
      <button
        type='button'
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className='rounded px-2 py-1 text-sm text-sand disabled:opacity-50'
      >
        Next
      </button>
    </div>
  )
}

export default Pagination
