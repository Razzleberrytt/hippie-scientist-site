'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
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
type ArticleCapturePlacement = 'inline' | 'end'

type ArticleEmailCaptureExperimentProps = {
  location: string
  className?: string
}

let volatileSubject: string | null = null

function makeAnonymousSubject(): string {
  return typeof window.crypto?.randomUUID === 'function'
    ? window.crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function getAnonymousExperimentSubject(): string {
  try {
    const existing = window.localStorage.getItem(SUBJECT_STORAGE_KEY)
    if (existing) return existing

    const generated = makeAnonymousSubject()
    window.localStorage.setItem(SUBJECT_STORAGE_KEY, generated)
    return generated
  } catch {
    // Storage can be unavailable in strict privacy modes. Keep a volatile,
    // page-session identifier rather than collapsing those readers into one
    // shared experiment bucket.
    volatileSubject ??= makeAnonymousSubject()
    return volatileSubject
  }
}

function placementFor(variant: ArticleCaptureVariant): ArticleCapturePlacement {
  return variant.startsWith('inline-') ? 'inline' : 'end'
}

function titleFor(variant: ArticleCaptureVariant): string {
  return variant.endsWith('-safety')
    ? 'Get the safety checklist + weekly evidence updates'
    : 'Get weekly supplement evidence updates'
}

function createInlineMount(): HTMLElement | null {
  const articleBody = document.querySelector<HTMLElement>('[data-article-body]')
  if (!articleBody) return null

  const mount = document.createElement('div')
  mount.dataset.articleEmailCapture = 'inline'
  mount.className = 'my-10'

  const headings = Array.from(articleBody.querySelectorAll<HTMLElement>('h2'))
  const insertionHeading = headings[1] ?? headings[0]
  if (insertionHeading?.parentElement) {
    insertionHeading.parentElement.insertBefore(mount, insertionHeading)
    return mount
  }

  const children = Array.from(articleBody.children)
  if (!children.length) {
    articleBody.appendChild(mount)
    return mount
  }

  const insertionIndex = Math.min(children.length - 1, Math.max(0, Math.floor(children.length * 0.4)))
  children[insertionIndex].insertAdjacentElement('afterend', mount)
  return mount
}

export default function ArticleEmailCaptureExperiment({
  location,
  className = '',
}: ArticleEmailCaptureExperimentProps) {
  const [variant, setVariant] = useState<ArticleCaptureVariant | null>(null)
  const [inlineMount, setInlineMount] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const subject = getAnonymousExperimentSubject()
    setVariant(assignExperimentVariant(EXPERIMENT_ID, subject, VARIANTS))
  }, [])

  useEffect(() => {
    if (!variant || placementFor(variant) !== 'inline') return

    const mount = createInlineMount()
    setInlineMount(mount)

    return () => {
      mount?.remove()
      setInlineMount(null)
    }
  }, [variant])

  const placement = variant ? placementFor(variant) : null
  const isRenderable = placement === 'end' || (placement === 'inline' && Boolean(inlineMount))

  useEffect(() => {
    if (!variant || !isRenderable) return
    trackExperimentImpression({
      experimentId: EXPERIMENT_ID,
      variant,
      location,
    })
  }, [isRenderable, location, variant])

  if (!variant || !isRenderable) return null

  const signup = (
    <NewsletterSignup
      title={titleFor(variant)}
      description='One practical email on evidence quality, safety flags, and better supplement decisions. Includes the free safety checklist.'
      ctaLabel='Get the checklist'
      location={location}
      variant={placement === 'inline' ? 'editorial' : 'card'}
      className={className}
      experiment={{ id: EXPERIMENT_ID, variant, location }}
    />
  )

  if (placement === 'inline' && inlineMount) return createPortal(signup, inlineMount)
  return signup
}
