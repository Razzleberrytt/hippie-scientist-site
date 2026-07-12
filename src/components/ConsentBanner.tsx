'use client'

import React, { useEffect, useState } from 'react'
import { Link } from '../lib/router-compat'
import { getConsent, setConsent, initConsentDefault, getSystemNoTracking } from '../lib/consent'

export default function ConsentBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    initConsentDefault()
    const consent = getConsent()
    setShow(consent === null)

    if (consent === 'granted') {
      import('../lib/loadAnalytics')
        .then(module => module.loadAnalytics())
        .catch(() => {
          // Ignore analytics load failures.
        })
    }
  }, [])

  if (!show) return null

  const dnt = getSystemNoTracking()

  return (
    <div className='fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] z-[100] px-3 md:bottom-0 md:px-4 md:pb-4'>
      <div
        role='region'
        aria-label='Privacy notice'
        className='mx-auto max-w-3xl rounded-2xl border border-white/20 bg-[#123c2f]/95 px-4 py-3 text-sm text-white shadow-[0_10px_35px_rgba(18,60,47,0.28)] backdrop-blur-md'
      >
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='min-w-0 leading-snug text-white/90'>
            We use privacy-friendly analytics.{' '}
            <Link className='font-semibold text-white underline underline-offset-2 hover:text-white' to='/info/privacy'>
              Read our privacy policy
            </Link>
            .
            {dnt && (
              <span className='ml-1 text-amber-300'>DNT/GPC detected: tracking stays off.</span>
            )}
          </p>
          <div className='flex shrink-0 items-center justify-end gap-2'>
            <button
              type='button'
              className='inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold text-white/85 underline underline-offset-2 transition-colors hover:bg-white/10 hover:text-white'
              onClick={() => {
                setConsent('denied')
                setShow(false)
              }}
            >
              Decline
            </button>
            <button
              type='button'
              className='inline-flex min-h-11 items-center justify-center rounded-lg border border-[#d8c08d]/50 bg-[#fffdf8] px-4 text-sm font-bold text-[#123c2f] transition-colors hover:bg-[#f5efe2]'
              onClick={() => {
                setConsent('granted')
                setShow(false)
                import('../lib/loadAnalytics')
                  .then(module => module.loadAnalytics())
                  .catch(() => {
                    // Ignore analytics load failures.
                  })
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
