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
    <section className="rounded-2xl border border-brand-900/10 bg-white/90 p-6 shadow-sm">
      {heading && (
        <h2 className="text-xl font-bold text-ink mb-4">{heading}</h2>
      )}
      <div className="divide-y divide-brand-900/5">
        {faqs.map((faq, i) => (
          <div key={i} className="py-3 first:pt-0 last:pb-0">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 text-left"
              aria-expanded={open === i}
            >
              <span className="font-semibold text-ink text-sm sm:text-base">{faq.question}</span>
              <span
                aria-hidden="true"
                className="shrink-0 text-brand-700 text-xl font-light leading-none"
              >
                {open === i ? '−' : '+'}
              </span>
            </button>
            {open === i && (
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted pr-8">
                {faq.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
