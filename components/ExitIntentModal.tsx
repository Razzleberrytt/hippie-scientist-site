'use client'

import { useEffect, useState } from 'react'
import NewsletterSignup from './NewsletterSignup'

type ExitIntentModalProps = {
  storageKey?: string
}

export default function ExitIntentModal({ storageKey = 'phase3b-exit-intent' }: ExitIntentModalProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (window.sessionStorage.getItem(storageKey) === '1') return

    const openOnce = () => {
      window.sessionStorage.setItem(storageKey, '1')
      setOpen(true)
    }

    const onMouseLeave = (event: MouseEvent) => {
      if (event.clientY <= 0) openOnce()
    }

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (scrollable > 0 && window.scrollY / scrollable > 0.72) openOnce()
    }

    document.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('scroll', onScroll)
    }
  }, [storageKey])

  if (!open) return null

  return (
    <div className='fixed inset-0 z-[120] flex items-end justify-center bg-black/35 px-4 py-6 backdrop-blur-sm sm:items-center' role='dialog' aria-modal='true' aria-labelledby='exit-intent-title'>
      <div className='relative w-full max-w-2xl rounded-[1.5rem] bg-white p-3 shadow-2xl'>
        <button
          type='button'
          onClick={() => setOpen(false)}
          className='absolute right-4 top-4 z-10 rounded-full bg-white px-2 py-1 text-sm font-bold text-muted shadow-sm hover:bg-stone-100'
          aria-label='Close safety checklist signup'
        >
          x
        </button>
        <NewsletterSignup
          title="Don't leave empty-handed - get the free Safety Checklist"
          description='Five questions to ask before taking any supplement: medications, dose, form, stacking risk, and product quality.'
          ctaLabel='Send me the checklist'
          location='homepage-exit-intent'
          variant='inline'
          className='border-emerald-800/20 bg-emerald-50/50'
        />
      </div>
    </div>
  )
}
