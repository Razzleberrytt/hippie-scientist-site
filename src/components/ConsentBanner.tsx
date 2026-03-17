import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
    <div className='fixed inset-x-0 bottom-0 z-50 p-2 sm:p-3'>
      <div className='mx-auto max-w-3xl rounded-xl border border-white/10 bg-black/75 p-3 text-xs text-white/85 backdrop-blur md:text-sm'>
        <div className='flex flex-col gap-2.5 sm:gap-2 md:flex-row md:items-center md:justify-between md:gap-3'>
          <div className='space-y-0.5'>
            <strong className='font-semibold'>Privacy &amp; cookies</strong>
            <p className='leading-relaxed text-white/70'>
              We use privacy-friendly analytics to understand site usage. No personal data unless
              you opt in. Read our{' '}
              <Link className='underline' to='/privacy'>
                Privacy Policy
              </Link>
              .
              {dnt && (
                <span className='ml-1 text-amber-300'>
                  Do Not Track / GPC detected. Tracking stays off by default.
                </span>
              )}
            </p>
          </div>
          <div className='flex shrink-0 items-center gap-1.5 sm:gap-2'>
            <button
              className='rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs hover:bg-white/10 sm:px-3'
              onClick={() => {
                setConsent('denied')
                setShow(false)
              }}
            >
              Decline
            </button>
            <button
              className='rounded-lg border border-lime-300/20 bg-gradient-to-r from-lime-400/30 to-cyan-400/20 px-2.5 py-1.5 text-xs font-medium text-lime-200 hover:from-lime-400/40 hover:to-cyan-400/30 sm:px-3'
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
