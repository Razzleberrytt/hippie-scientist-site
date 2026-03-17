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
    <div className='fixed inset-x-0 bottom-0 z-50 p-1 sm:p-1.5'>
      <div className='mx-auto max-w-3xl rounded-xl border border-white/10 bg-black/65 px-2.5 py-1.5 text-[10px] text-white/80 backdrop-blur-md sm:text-[11px]'>
        <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-1.5'>
          <div className='space-y-0'>
            <strong className='font-semibold leading-tight text-white/90'>
              Privacy &amp; cookies
            </strong>
            <p className='leading-snug text-white/65'>
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
          <div className='flex shrink-0 items-center gap-1'>
            <button
              className='rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-[11px] transition-all duration-200 hover:scale-[1.01] hover:bg-white/10 active:scale-[0.98]'
              onClick={() => {
                setConsent('denied')
                setShow(false)
              }}
            >
              Decline
            </button>
            <button
              className='rounded-lg border border-lime-300/20 bg-gradient-to-r from-lime-400/25 to-cyan-400/15 px-2 py-1 text-[11px] font-medium text-lime-200 transition-all duration-200 hover:scale-[1.01] hover:from-lime-400/35 hover:to-cyan-400/25 active:scale-[0.98]'
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
