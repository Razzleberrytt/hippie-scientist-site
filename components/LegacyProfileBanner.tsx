'use client'

import { useState } from 'react'
import Link from 'next/link'

interface LegacyProfileBannerProps {
  newSlug: string
  herbName: string
}

export default function LegacyProfileBanner({ newSlug, herbName }: LegacyProfileBannerProps) {
  const storageKey = `dismissed-legacy-banner-${newSlug.replace(/[^a-z0-9-]/gi, '')}`

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.localStorage.getItem(storageKey) === 'true'
    } catch {
      return false
    }
  })

  if (isDismissed) return null

  const handleDismiss = () => {
    setIsDismissed(true)
    try {
      window.localStorage.setItem(storageKey, 'true')
    } catch {
      // ignore storage errors (private mode etc)
    }
  }

  return (
    <div
      role="alert"
      className="mb-4 rounded-[0.75rem] border border-brand-700/20 bg-brand-50/70 px-4 py-3 text-sm text-ink shadow-sm"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="leading-snug">
          This profile has been updated. View the new evidence-based profile for{' '}
          <span className="font-semibold">{herbName}</span> with citations, safety context, and sourcing guidance.
        </p>
        <div className="flex items-center gap-2 sm:ml-4">
          <Link
            href={newSlug}
            className="inline-flex items-center rounded-full bg-brand-700 px-3 py-1 text-xs font-bold text-white transition hover:bg-brand-800"
          >
            View updated profile →
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss this banner"
            className="rounded p-1 text-brand-800/70 hover:bg-white/60 hover:text-brand-900"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
