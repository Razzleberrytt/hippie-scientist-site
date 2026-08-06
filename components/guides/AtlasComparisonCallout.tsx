'use client'

import Link from 'next/link'

type AtlasComparisonCalloutProps = {
  eyebrow?: string
  title: string
  description: string
  href: string
  cta: string
  secondaryHref?: string
  secondaryCta?: string
  trackingSource?: string
}

type AtlasClickTarget = 'primary' | 'secondary'

function trackAtlasCalloutClick({
  source,
  target,
  destination,
}: {
  source: string
  target: AtlasClickTarget
  destination: string
}) {
  if (typeof window === 'undefined') return

  const event = {
    event: 'atlas_callout_click',
    atlas_source: source,
    atlas_target: target,
    atlas_destination: destination,
  }

  const analyticsWindow = window as typeof window & {
    dataLayer?: Array<Record<string, unknown>>
    gtag?: (...args: unknown[]) => void
  }

  analyticsWindow.dataLayer = analyticsWindow.dataLayer || []
  analyticsWindow.dataLayer.push(event)
  analyticsWindow.gtag?.('event', 'atlas_callout_click', {
    source,
    target,
    destination,
  })
}

export function AtlasComparisonCallout({
  eyebrow = 'Compare the evidence',
  title,
  description,
  href,
  cta,
  secondaryHref = '/tools/botanical-activity-atlas/',
  secondaryCta = 'Open the full atlas',
  trackingSource = 'editorial_callout',
}: AtlasComparisonCalloutProps) {
  return (
    <section className="mb-12 rounded-2xl border border-brand-700/20 bg-brand-50/60 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-800 dark:text-brand-100">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{description}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={href}
          onClick={() =>
            trackAtlasCalloutClick({
              source: trackingSource,
              target: 'primary',
              destination: href,
            })
          }
          data-atlas-source={trackingSource}
          data-atlas-target="primary"
          className="inline-flex min-h-[44px] items-center rounded-full bg-brand-700 px-5 text-sm font-semibold text-white transition hover:bg-brand-800"
        >
          {cta} →
        </Link>
        <Link
          href={secondaryHref}
          onClick={() =>
            trackAtlasCalloutClick({
              source: trackingSource,
              target: 'secondary',
              destination: secondaryHref,
            })
          }
          data-atlas-source={trackingSource}
          data-atlas-target="secondary"
          className="inline-flex min-h-[44px] items-center rounded-full border border-brand-900/10 bg-white/70 px-5 text-sm font-semibold text-ink transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          {secondaryCta}
        </Link>
      </div>
    </section>
  )
}
