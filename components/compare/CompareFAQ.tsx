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
        <p className="eyebrow-label">FAQ</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--hs-ink)]">
          Common Questions
        </h2>
      </div>

      <div className="border-y border-[color:var(--hs-hairline-strong)] divide-y divide-[color:var(--hs-hairline)]">
        {faqs.map((faq, index) => (
          <details
            key={faq.question}
            open={index === 0}
            className="group !border-0 !bg-transparent !p-0 !shadow-none"
          >
            <summary className="flex min-h-12 cursor-pointer list-none select-none items-center justify-between gap-4 py-4 text-sm font-semibold text-[color:var(--hs-ink)] [&::-webkit-details-marker]:hidden">
              <span className="flex min-w-0 items-start gap-3">
                <span className="font-display text-sm tabular-nums text-[color:var(--hs-gold)]" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{faq.question}</span>
              </span>
              <svg
                className="h-4 w-4 shrink-0 text-[color:var(--hs-body)] transition-transform duration-200 group-open:rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="pb-5 pl-8 pr-1">
              <p className="max-w-3xl text-sm leading-7 text-[color:var(--hs-body)]">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>

      <div className="rounded-2xl border border-[color:var(--hs-hairline-strong)] bg-[color:var(--hs-surface-2)] p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--tone-ink)]">
            Need a clearer next step?
          </p>
          <p className="text-sm leading-6 text-[color:var(--hs-body)]">
            Review the decision guide above, or browse the full compare hub for nearby tradeoffs.
          </p>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:mt-0 sm:flex-row">
          <a
            href="#compare-decision"
            className="button-primary rounded-full px-4 py-2 text-center text-xs font-bold"
          >
            Review decision guide ↑
          </a>
          <Link
            href="/guides/compare/"
            className="button-secondary rounded-full px-4 py-2 text-center text-xs font-bold"
          >
            Compare hub →
          </Link>
        </div>
      </div>
    </section>
  )
}

export type { FAQItem }
