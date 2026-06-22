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
    </section>
  )
}

export type { FAQItem }
