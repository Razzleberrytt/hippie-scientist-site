import Link from 'next/link'

const decisionGuides = [
  {
    href: '/guides/sleep/best-supplements-for-sleep/',
    label: 'Sleep',
    description: 'Compare sleep supports by the problem you are trying to solve.',
  },
  {
    href: '/guides/anxiety/best-herbs-for-anxiety/',
    label: 'Anxiety',
    description: 'Compare calming herbs with evidence and safety boundaries visible.',
  },
  {
    href: '/guides/best/supplements-for-stress/',
    label: 'Stress',
    description: 'Compare stress-support options without building an oversized stack.',
  },
  {
    href: '/guides/focus/best-nootropics-for-focus/',
    label: 'Focus',
    description: 'Separate acute attention, memory, and fatigue-related evidence.',
  },
]

export default function HomepageDecisionShortcuts() {
  return (
    <section className="border-t border-brand-900/10 bg-brand-50/50 px-5 py-12 sm:px-8 sm:py-16 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-200">
              Ready to compare?
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Jump straight to a decision guide
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
              If you already know your goal, skip the broad browsing step and open the focused guide for that decision.
            </p>
          </div>
          <Link href="/guides/best/" className="text-sm font-semibold text-brand-800 hover:underline dark:text-brand-100">
            Browse all best-of guides →
          </Link>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {decisionGuides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <h3 className="text-lg font-semibold text-ink">{guide.label}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{guide.description}</p>
              <span className="mt-4 inline-flex text-sm font-semibold text-brand-800 transition group-hover:translate-x-0.5 dark:text-brand-100">
                Open guide →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
