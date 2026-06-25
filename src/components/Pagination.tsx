import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const baseButtonClasses =
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/12 bg-transparent px-3 text-sm font-medium text-white/70 transition-all hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-40'

const activePageClasses = 'border-[var(--accent-teal)]/40 bg-[var(--accent-teal)]/10 text-[var(--accent-teal)]'

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
    <nav aria-label='Pagination' className='mx-auto mb-8 mt-4 flex flex-wrap items-center justify-center gap-2'>
      <button
        type='button'
        aria-label='Previous page'
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={baseButtonClasses}
      >
        <ChevronLeft aria-hidden='true' size={16} />
      </button>

      {pages.map((p, i) =>
        typeof p === 'number' ? (
          <button
            key={p}
            type='button'
            aria-label={`Go to page ${p}`}
            aria-current={p === currentPage ? 'page' : undefined}
            onClick={() => onPageChange(p)}
            className={`${baseButtonClasses} ${p === currentPage ? activePageClasses : ''}`.trim()}
          >
            {p}
          </button>
        ) : (
          <span
            key={`ellipsis-${i}`}
            aria-hidden='true'
            className='inline-flex min-h-11 min-w-11 items-center justify-center text-sm font-medium text-white/40'
          >
            {p}
          </span>
        )
      )}

      <button
        type='button'
        aria-label='Next page'
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={baseButtonClasses}
      >
        <ChevronRight aria-hidden='true' size={16} />
      </button>
    </nav>
  )
}

export default Pagination
