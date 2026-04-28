import React, { useEffect, useState } from 'react'
import { Link } from '@/lib/router-compat'
import { getConsent, setConsent, initConsentDefault, getSystemNoTracking } from '../lib/consent'

export default function ConsentBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    initConsentDefault()
    const c = getConsent()
    setShow(c === null)
  }, [])

  if (!show) return null

  const dnt = getSystemNoTracking()

  return (
    <div className='fixed inset-x-0 bottom-0 z-50 p-1 sm:p-1.5'>
      <div className='mx-auto max-w-3xl rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs text-white/80 backdrop-blur-sm'>
        <div className='flex items-center justify-between gap-2'>
          <p className='min-w-0 truncate leading-tight text-white/75'>
            We use privacy-friendly analytics.{' '}
            <Link className='underline' to='/privacy'>
              Privacy
            </Link>
            .
            {dnt && (
              <span className='ml-1 text-amber-300'>DNT/GPC detected: tracking stays off.</span>
            )}
          </p>
          <div className='flex shrink-0 items-center gap-2'>
            <button
              className='text-[11px] text-white/60 underline underline-offset-2 transition-colors hover:text-white/80'
              onClick={() => {
                setConsent('denied')
                setShow(false)
              }}
            >
              Decline
            </button>
            <button
              className='rounded-md border border-lime-300/20 bg-gradient-to-r from-lime-400/25 to-cyan-400/15 px-2 py-1 text-[11px] font-medium text-lime-200 transition-all duration-200 hover:from-lime-400/35 hover:to-cyan-400/25'
              onClick={() => {
                setConsent('granted')
                setShow(false)
                import('../lib/loadAnalytics').then(module => module.loadAnalytics())
              }}
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
