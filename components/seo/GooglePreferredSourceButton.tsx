'use client'

import Script from 'next/script'

type GooglePreferredSourceButtonProps = {
  className?: string
}

export default function GooglePreferredSourceButton({ className = '' }: GooglePreferredSourceButtonProps) {
  return (
    <aside
      aria-label='Prefer The Hippie Scientist in Google'
      className={`rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4 ${className}`.trim()}
    >
      <Script
        id='google-preferred-source-publisher'
        src='https://news.google.com/swg/js/v1/publisher.js'
        strategy='afterInteractive'
      />
      <p className='mb-2 text-sm font-semibold text-[var(--text-primary)]'>
        Want more evidence-first results from us in Google?
      </p>
      <div {...({ 'google-add-preferred-source-btn': '' } as Record<string, string>)} />
    </aside>
  )
}
