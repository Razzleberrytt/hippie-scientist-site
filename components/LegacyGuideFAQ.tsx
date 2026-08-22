import FAQSchema from '@/components/seo/FAQSchema'

type LegacyGuideFaqItem = {
  question: string
  answer: string
}

type LegacyGuideFAQProps = {
  questions: readonly LegacyGuideFaqItem[]
  pagePath: string
  /**
   * Where "Verify sources" points. Callers already pass this — five pages did
   * so while the prop was undeclared, which broke the production build — and a
   * guide whose references live elsewhere needs to override the default anchor.
   */
  referencesHref?: string
}

/**
 * Shared compatibility boundary for hand-authored legacy guides. The same FAQ
 * array powers both visible content and FAQ structured data so the two surfaces
 * cannot drift independently.
 */
export default function LegacyGuideFAQ({ questions, pagePath, referencesHref = '#references' }: LegacyGuideFAQProps) {
  if (!questions.length) return null

  return (
    <>
      <FAQSchema pagePath={pagePath} questions={[...questions]} />
      <section
        id="frequently-asked-questions"
        className="card-premium scroll-mt-24 p-6 space-y-4 max-w-4xl"
        data-visible-faq="true"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Frequently asked questions</h2>
        <div className="space-y-4">
          {questions.map((faq) => (
            <div key={faq.question} className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4 dark:border-white/10 dark:bg-[var(--surface-subtle)]">
              <h3 className="font-semibold text-ink">{faq.question}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
            </div>
          ))}
        </div>
        <a
          href={referencesHref}
          data-citation-sources="true"
          className="inline-flex min-h-11 items-center rounded-lg text-xs font-semibold text-brand-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 focus-visible:ring-offset-2 dark:text-brand-200"
        >
          Verify sources →
        </a>
        <a href="#frequently-asked-questions" className="sr-only">Permanent link to frequently asked questions</a>
      </section>
    </>
  )
}
