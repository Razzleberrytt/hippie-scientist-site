import React from 'react'

export const LoadingScreen: React.FC = () => {
  return (
    <div
      className='fixed inset-0 bg-[#07080F] z-50 flex items-center justify-center'
      role='status'
      aria-live='polite'
    >
      <div className='text-center'>
        <h2 className='font-display italic text-2xl text-white/80'>Hippie Scientist</h2>
        <div className='mx-auto mt-4 w-24 h-0.5 bg-[var(--accent-teal)] animate-pulse rounded-full' />
        <span className='sr-only'>Loading content, please wait</span>
      </div>
    </div>
  )
}
