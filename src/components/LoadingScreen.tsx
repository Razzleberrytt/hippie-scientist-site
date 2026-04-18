import React from 'react'

export const LoadingScreen: React.FC = () => {
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-[#07080F]'
      role='status'
      aria-live='polite'
    >
      <div className='text-center'>
        <h2 className='font-display text-2xl italic text-white/80'>Hippie Scientist</h2>
        <div className='mx-auto mt-4 h-0.5 w-24 animate-pulse rounded-full bg-[var(--accent-teal)]' />
        <span className='sr-only'>Loading content, please wait</span>
      </div>
    </div>
  )
}
