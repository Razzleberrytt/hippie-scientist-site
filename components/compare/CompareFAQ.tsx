import Link from 'next/link'

interface FAQItem {
  question: string
  answer: string
}

interface CompareFAQProps {
  faqs: FAQItem[]
}

export default function CompareFAQ({ faqs }: CompareFAQProps) {
  if (faqs.length === 0) return null

  return (
    <section className="max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">FAQ</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          Common Questions
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <details
            key={index}
            open={index === 0}
            className="group rounded-2xl border border-brand-900/10 bg-white/80"
          >
            <summary className="flex cursor-pointer select-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-ink marker:content-none">
              <span>{faq.question}</span>
              <svg
                className="h-4 w-4 shrink-0 text-brand-700 transition-transform duration-200 group-open:rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-5 pb-5">
              <p className="text-sm leading-relaxed text-muted">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>

      <div className="rounded-2xl border border-brand-900/10 bg-brand-50/80 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
            Need a faster decision?
          </p>
          <p className="text-sm leading-6 text-muted">
            Use the preference quiz above, or browse the full compare hub for nearby tradeoffs.
          </p>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:mt-0 sm:flex-row">
          <a
            href="#compare-decision"
            className="rounded-full bg-brand-700 px-4 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-brand-600"
          >
            Get a personal pick ↑
          </a>
          <Link
            href="/guides/compare/"
            className="rounded-full border border-brand-900/10 bg-white px-4 py-2 text-center text-xs font-bold text-brand-800 transition-colors hover:bg-brand-100"
          >
            Compare hub →
          </Link>
        </div>
      </div>
    </section>
  )
}

export type { FAQItem }
