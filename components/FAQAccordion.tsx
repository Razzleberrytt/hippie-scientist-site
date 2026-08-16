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
    <section>
      {heading && (
        <div className="mb-4">
          <p className="eyebrow-label">FAQ</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--hs-ink)]">{heading}</h2>
        </div>
      )}

      <div className="border-y border-[color:var(--hs-hairline-strong)] divide-y divide-[color:var(--hs-hairline)]">
        {faqs.map((faq, i) => (
          <div key={faq.question}>
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="flex min-h-12 w-full items-center justify-between gap-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-4"
              aria-expanded={open === i}
            >
              <span className="flex min-w-0 items-start gap-3">
                <span className="font-display text-sm tabular-nums text-[color:var(--hs-gold)]" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm font-semibold text-[color:var(--hs-ink)] sm:text-base">{faq.question}</span>
              </span>
              <svg
                className={`size-4 shrink-0 text-[color:var(--hs-body)] transition-transform ${open === i ? 'rotate-180' : ''}`}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {open === i && (
              <p className="max-w-3xl pb-5 pl-8 pr-1 text-sm leading-7 text-[color:var(--hs-body)]">
                {faq.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
