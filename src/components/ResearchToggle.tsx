'use client'

import { useEffect, useState } from 'react'
import { useResearchStore } from '../store/useResearchStore'

interface ResearchToggleProps {
  itemSlug: string
}

export default function ResearchToggle({ itemSlug }: ResearchToggleProps) {
  const { researchList, addToResearch, removeFromResearch } = useResearchStore()
  const [mounted, setMounted] = useState(false)

  // Hydration guard to prevent SSR/CSR mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        type='button'
        disabled
        className='inline-flex items-center justify-center rounded-full bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-400 cursor-not-allowed border border-neutral-200'
      >
        Loading...
      </button>
    )
  }

  const isResearching = researchList.includes(itemSlug)

  const handleToggle = () => {
    if (isResearching) {
      removeFromResearch(itemSlug)
    } else {
      addToResearch(itemSlug)
    }
  }

  return (
    <button
      onClick={handleToggle}
      type='button'
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition-all duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
        isResearching
          ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-100 border border-transparent'
          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
      }`}
      aria-label={isResearching ? `Remove ${itemSlug} from research list` : `Add ${itemSlug} to research list`}
    >
      <span className='mr-1.5 flex h-2 w-2 items-center justify-center'>
        {isResearching ? (
          <span className='h-2 w-2 rounded-full bg-white animate-pulse' />
        ) : (
          <span className='h-2 w-2 rounded-full bg-slate-300' />
        )}
      </span>
      {isResearching ? '✓ Researching' : '+ Add to Research'}
    </button>
  )
}
