'use client'

import { useState } from 'react'

export interface FAQItem {
  question: string
  answer: string
}

interface Props {
  faqs: FAQItem[]
  heading?: string
}

export default function FAQAccordion({ faqs, heading = 'Frequently Asked Questions' }: Props) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-6">
      {heading && (
        <h2 className="mb-4 text-xl font-bold text-ink">{heading}</h2>
      )}
      <div className="divide-y divide-brand-900/5 dark:divide-white/10">
        {faqs.map((faq, i) => (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="flex min-h-11 w-full items-center justify-between gap-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[var(--surface-card)]"
              aria-expanded={open === i}
            >
              <span className="text-sm font-semibold text-ink sm:text-base">{faq.question}</span>
              <span
                aria-hidden="true"
                className="shrink-0 text-xl font-light leading-none text-brand-700 dark:text-brand-200"
              >
                {open === i ? '−' : '+'}
              </span>
            </button>
            {open === i && (
              <p className="pb-3 pr-8 text-xs leading-relaxed text-muted sm:text-sm">
                {faq.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
