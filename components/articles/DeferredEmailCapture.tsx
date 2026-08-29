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
    <aside className='my-6 border-t border-[color:var(--hs-hairline-strong)] pt-4 sm:rounded-[var(--hs-radius)] sm:border sm:bg-[color:var(--surface-card)] sm:p-5'>
      <div className='space-y-1.5'>
        <p className='hs-label'>{eyebrow}</p>
        <h2 className='font-display text-[1.15rem] font-semibold leading-snug tracking-tight text-ink sm:text-xl'>{title}</h2>
        <p className='max-w-2xl text-sm leading-6 text-muted'>{description}</p>
      </div>
      <div className='mt-3 flex flex-wrap items-center gap-x-4 gap-y-2'>
        <button
          type='button'
          onClick={onActivate}
          className='button-primary inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold'
        >
          Get the free resource
        </button>
        <Link className='inline-flex min-h-11 items-center text-sm font-semibold text-[color:var(--tone-ink)] underline-offset-4 hover:underline' href={href}>
          Preview it first →
        </Link>
      </div>
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
