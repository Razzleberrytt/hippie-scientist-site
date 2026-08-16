import FAQSchema from '@/components/seo/FAQSchema'

type LegacyGuideFaqItem = {
  question: string
  answer: string
}

type LegacyGuideFAQProps = {
  questions: LegacyGuideFaqItem[]
  pagePath: string
}

/**
 * Shared compatibility boundary for hand-authored legacy guides. The same FAQ
 * array powers both visible content and FAQ structured data so the two surfaces
 * cannot drift independently.
 */
export default function LegacyGuideFAQ({ questions, pagePath }: LegacyGuideFAQProps) {
  if (!questions.length) return null

  return (
    <>
      <FAQSchema pagePath={pagePath} questions={questions} />
      <section
        id="frequently-asked-questions"
        className="card-premium scroll-mt-24 p-6 space-y-4 max-w-4xl"
        data-visible-faq="true"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Frequently asked questions</h2>
        <div className="space-y-4">
          {questions.map((faq) => (
            <div key={faq.question} className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
              <h3 className="font-semibold text-ink">{faq.question}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
            </div>
          ))}
        </div>
        <a href="#frequently-asked-questions" className="sr-only">Permanent link to frequently asked questions</a>
      </section>
    </>
  )
}
