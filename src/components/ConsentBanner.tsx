'use client'

import React, { useEffect, useState } from 'react'
import { Link } from '../lib/router-compat'
import { getConsent, setConsent, initConsentDefault, getSystemNoTracking } from '@/lib/consent'

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
        aria-live='polite'
        className='mx-auto max-w-3xl rounded-2xl border border-[#d5ad6c]/25 bg-[linear-gradient(145deg,rgba(70,63,83,0.97),rgba(42,38,49,0.98))] px-4 py-3 text-sm text-[#fffaf3] shadow-[0_16px_42px_rgba(34,29,41,0.30)] backdrop-blur-md'
      >
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='min-w-0 leading-snug text-[#f2ecf4]'>
            We use privacy-friendly analytics.{' '}
            <Link className='rounded font-semibold text-[#fffaf3] underline underline-offset-2 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d5ad6c]' to='/info/privacy'>
              Read our privacy policy
            </Link>
            .
            {dnt && (
              <span className='mt-1 block text-amber-300'>DNT/GPC detected: tracking stays off.</span>
            )}
          </p>
          <div className='flex shrink-0 flex-wrap items-center justify-end gap-2'>
            <button
              type='button'
              className='inline-flex min-h-11 flex-1 items-center justify-center rounded-lg px-3 text-sm font-semibold text-white/85 underline underline-offset-2 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d5ad6c] sm:flex-none'
              onClick={() => {
                setConsent('denied')
                setShow(false)
              }}
            >
              Decline
            </button>
            <button
              type='button'
              className='inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-[#d5ad6c]/50 bg-[#fffaf3] px-4 text-sm font-bold text-[#302c39] transition-colors hover:bg-[#f2e9dd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d5ad6c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#302c39] sm:flex-none'
              onClick={() => {
                setConsent(dnt ? 'denied' : 'granted')
                setShow(false)
                if (!dnt) {
                  import('../lib/loadAnalytics')
                    .then(module => module.loadAnalytics())
                    .catch(() => {
                      // Ignore analytics load failures.
                    })
                }
              }}
            >
              {dnt ? 'Continue without tracking' : 'Accept'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
