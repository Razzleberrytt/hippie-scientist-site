import React from 'react'
import { motion } from 'framer-motion'

interface Props {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<Props> = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <div className='mt-4 flex justify-center gap-2'>
      <button
        type='button'
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className='rounded px-2 py-1 text-sm text-sand disabled:opacity-50'
      >
        Prev
      </button>
      {pages.map(p => (
        <motion.button
          whileHover={{ scale: 1.1 }}
          key={p}
          onClick={() => onPageChange(p)}
          className={`rounded px-2 py-1 text-sm ${p === currentPage ? 'bg-cosmic-purple text-white' : 'text-sand'}`}
        >
          {p}
        </motion.button>
      ))}
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
