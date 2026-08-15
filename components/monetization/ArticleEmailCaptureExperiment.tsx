'use client'

import { useEffect, useState } from 'react'
import NewsletterSignup from '@/components/NewsletterSignup'
import { trackExperimentImpression } from '@/lib/analytics'
import { assignExperimentVariant } from '@/lib/experiment-assignment'

const EXPERIMENT_ID = 'article-email-capture-v1'
const SUBJECT_STORAGE_KEY = 'ths:experiment-subject:v1'

const VARIANTS = [
  { id: 'inline-weekly' },
  { id: 'inline-safety' },
  { id: 'end-weekly' },
  { id: 'end-safety' },
] as const

type ArticleCaptureVariant = (typeof VARIANTS)[number]['id']
type ArticleCaptureSlot = 'inline' | 'end'

type ArticleEmailCaptureExperimentProps = {
  slot: ArticleCaptureSlot
  location: string
  className?: string
}

function getAnonymousExperimentSubject(): string {
  try {
    const existing = window.localStorage.getItem(SUBJECT_STORAGE_KEY)
    if (existing) return existing

    const generated =
      typeof window.crypto?.randomUUID === 'function'
        ? window.crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

    window.localStorage.setItem(SUBJECT_STORAGE_KEY, generated)
    return generated
  } catch {
    // Storage can be unavailable in strict privacy modes. A session-stable
    // fallback avoids collecting identity while keeping the experience usable.
    return 'storage-unavailable'
  }
}

function placementFor(variant: ArticleCaptureVariant): ArticleCaptureSlot {
  return variant.startsWith('inline-') ? 'inline' : 'end'
}

function titleFor(variant: ArticleCaptureVariant): string {
  return variant.endsWith('-safety')
    ? 'Get the safety checklist + weekly evidence updates'
    : 'Get weekly supplement evidence updates'
}

export default function ArticleEmailCaptureExperiment({
  slot,
  location,
  className = '',
}: ArticleEmailCaptureExperimentProps) {
  const [variant, setVariant] = useState<ArticleCaptureVariant | null>(null)

  useEffect(() => {
    const subject = getAnonymousExperimentSubject()
    setVariant(assignExperimentVariant(EXPERIMENT_ID, subject, VARIANTS))
  }, [])

  useEffect(() => {
    if (!variant || placementFor(variant) !== slot) return
    trackExperimentImpression({
      experimentId: EXPERIMENT_ID,
      variant,
      location,
    })
  }, [location, slot, variant])

  if (!variant || placementFor(variant) !== slot) return null

  return (
    <NewsletterSignup
      title={titleFor(variant)}
      description='One practical email on evidence quality, safety flags, and better supplement decisions. Includes the free safety checklist.'
      ctaLabel='Get the checklist'
      location={location}
      variant={slot === 'inline' ? 'editorial' : 'card'}
      className={className}
      experiment={{ id: EXPERIMENT_ID, variant, location }}
    />
  )
}
