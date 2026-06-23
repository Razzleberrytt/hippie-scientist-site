'use client'

import dynamic from 'next/dynamic'

const StackBuilderClient = dynamic(
  () => import('../../../src/components/stacks/StackBuilderClient'),
  {
    ssr: false,
    loading: () => (
      <div className='rounded-[1.5rem] border border-brand-900/10 bg-white/80 p-6 sm:p-8'>
        <div className='animate-pulse space-y-4'>
          <div className='h-6 w-64 rounded-lg bg-brand-900/10' />
          <div className='h-4 w-full rounded bg-brand-900/10' />
          <div className='h-4 w-3/4 rounded bg-brand-900/10' />
          <div className='mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='h-20 rounded-xl bg-brand-900/10' />
            ))}
          </div>
        </div>
      </div>
    ),
  }
)

export default StackBuilderClient
