'use client'

import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type DeferredEmailCaptureProps = {
  title: string
  description: string
  ctaLabel: string
  magnet: string
  resourceUrl?: string
  resourceLabel?: string
  eyebrow?: string
  placement?: string
  disclaimer?: string
}

const EmailCapture = lazy(() => import('./EmailCapture'))
const DEFAULT_RESOURCE_URL = '/lead-magnets/adhd-supplement-starter-checklist/'

function CapturePreview({
  title,
  description,
  resourceUrl,
  eyebrow = 'Free research resource',
  onActivate,
}: Pick<DeferredEmailCaptureProps, 'title' | 'description' | 'resourceUrl' | 'eyebrow'> & { onActivate: () => void }) {
  const href = resourceUrl || DEFAULT_RESOURCE_URL

  return (
    <aside className='my-10 rounded-3xl border border-brand-900/10 bg-[var(--surface-card)] p-5 shadow-sm sm:p-7'>
      <div className='space-y-3'>
        <p className='eyebrow-label'>{eyebrow}</p>
        <h2 className='font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl'>{title}</h2>
        <p className='max-w-2xl text-base leading-7 text-muted'>{description}</p>
        <p className='text-sm leading-6 text-muted'>
          Want to review it first?{' '}
          <Link className='font-semibold text-brand-800 underline decoration-brand-700/35 underline-offset-4 hover:text-brand-900' href={href}>
            Preview the resource
          </Link>
          .
        </p>
      </div>
      <button
        type='button'
        onClick={onActivate}
        className='mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-brand-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2'
      >
        Get the free resource
      </button>
    </aside>
  )
}

export default function DeferredEmailCapture(props: DeferredEmailCaptureProps) {
  const [ready, setReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ready) return
    const node = containerRef.current
    if (!node) return

    if (typeof IntersectionObserver === 'undefined') {
      setReady(true)
      return
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      setReady(true)
      observer.disconnect()
    }, { rootMargin: '900px 0px' })

    observer.observe(node)
    return () => observer.disconnect()
  }, [ready])

  const preview = (
    <CapturePreview
      title={props.title}
      description={props.description}
      resourceUrl={props.resourceUrl}
      eyebrow={props.eyebrow}
      onActivate={() => setReady(true)}
    />
  )

  return (
    <div ref={containerRef} data-deferred-email-capture>
      {ready ? (
        <Suspense fallback={preview}>
          <EmailCapture {...props} />
        </Suspense>
      ) : preview}
    </div>
  )
}
