import type { Metadata } from 'next'
import Link from 'next/link'

import SchemaOrg from '@/components/SchemaOrg'
import PrintChecklistButton from '@/components/lead-magnets/PrintChecklistButton'
import { buildPageMetadata, SITE_URL } from '@/src/lib/seo'

const PATH = '/lead-magnets/adhd-supplement-starter-checklist'
const TITLE = 'ADHD Supplement Starter Checklist'
const DESCRIPTION =
  'Printable ADHD supplement starter checklist with safety reminders, evidence-first questions, and tracking prompts.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  robots: { index: false, follow: true },
})

const BASELINE_ITEMS = [
  'Sleep quality baseline',
  'Focus and attention baseline',
  'Energy baseline',
  'Anxiety and stress baseline',
  'Current medications and supplement list',
  'Caffeine intake',
  'Diet and protein consistency',
]

const STARTING_LANES = [
  'If sleep is the biggest issue: review sleep habits and whether magnesium is appropriate for you.',
  'If calm focus is the biggest issue: review the evidence and safety notes for L-theanine.',
  'If long-term baseline support is the goal: review the evidence and product-quality questions for omega-3s.',
  'If brain fog is the biggest issue: review the evidence and safety notes for citicoline.',
  'If caffeine causes anxiety: consider a caffeine-free routine before adding another stimulant.',
]

const FOUR_WEEK_PLAN = [
  'Week 1: Pick one change only and record your baseline first.',
  'Week 2: Track sleep, focus, mood, anxiety, and side effects.',
  'Week 3: Continue only if tolerated. Do not stack aggressively.',
  'Week 4: Review your notes and decide whether to keep, stop, or discuss an adjustment with a clinician.',
]

const AVOID_ITEMS = [
  'High-dose multi-supplement stacks',
  'Proprietary blends with hidden doses',
  'Stimulant-heavy products',
  'Products claiming to treat, cure, or replace ADHD medication',
  'Starting several new supplements at once',
  'Giving supplements to children without clinician guidance',
]

function ChecklistSection({
  number,
  title,
  items,
}: {
  number: string
  title: string
  items: string[]
}) {
  return (
    <section className="break-inside-avoid rounded-[1.5rem] border border-brand-900/10 bg-[var(--surface-card)] p-5 shadow-sm print:rounded-none print:border-slate-300 print:bg-white print:p-4 print:shadow-none sm:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700 print:text-slate-700">
        Section {number}
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink print:text-xl">
        {title}
      </h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 print:grid-cols-2 print:gap-2">
        {items.map((item) => (
          <li key={item}>
            <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-brand-900/10 bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-6 text-ink print:min-h-0 print:rounded-none print:border-slate-300 print:bg-white print:px-2 print:py-1.5">
              <input
                type="checkbox"
                className="mt-1 size-4 shrink-0 accent-brand-700"
              />
              <span>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function AdhdSupplementStarterChecklistPage() {
  const canonical = `${SITE_URL}${PATH}/`

  return (
    <>
      <SchemaOrg
        schema={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: TITLE,
          description: DESCRIPTION,
          url: canonical,
          isPartOf: {
            '@type': 'WebSite',
            name: 'The Hippie Scientist',
            url: `${SITE_URL}/`,
          },
        }}
      />

      <div
        data-printable-checklist
        className="mx-auto max-w-5xl space-y-5 px-4 py-8 print:max-w-none print:space-y-3 print:px-0 print:py-0 sm:px-6 sm:py-12 lg:px-8"
      >
        <div className="print:hidden">
          <Link
            href="/guides/adhd/"
            className="text-sm font-semibold text-brand-800 underline decoration-brand-700/30 underline-offset-4 hover:text-brand-900"
          >
            ← Back to ADHD guides
          </Link>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-brand-900/12 bg-gradient-to-br from-brand-50 via-[var(--surface-card)] to-[var(--surface)] p-6 shadow-sm print:rounded-none print:border-slate-400 print:bg-white print:p-5 print:shadow-none sm:p-10">
          <p className="eyebrow-label print:text-slate-700">Free printable tool · No signup required</p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-tight tracking-tight text-ink print:text-3xl sm:text-5xl">
            {TITLE}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted print:text-sm print:leading-6 print:text-slate-700">
            Record your baseline, choose one careful change, and use the 28-day sheet to notice patterns without turning a supplement into a substitute for ADHD care.
          </p>

          <div className="mt-6 rounded-2xl border border-amber-700/25 bg-amber-50/80 p-4 text-sm leading-6 text-amber-950 dark:border-amber-300/20 dark:bg-amber-950/30 dark:text-amber-100 print:rounded-none print:border-slate-400 print:bg-white print:text-slate-900">
            <strong>Educational only — not medical advice.</strong> Supplements should not replace prescribed ADHD treatment. Talk with a qualified healthcare professional before starting supplements, especially if you take medication, are pregnant, have a medical condition, or are choosing supplements for a child.
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 print:hidden">
            <PrintChecklistButton />
            <Link
              href="/info/supplement-safety-checklist/"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-900/15 bg-[var(--surface-card)] px-5 py-3 text-sm font-bold text-brand-800 transition hover:border-brand-700/30 hover:bg-brand-50"
            >
              Review the general safety checklist
            </Link>
          </div>
        </section>

        <ChecklistSection number="1" title="Record your baseline" items={BASELINE_ITEMS} />
        <ChecklistSection number="2" title="Choose one starting lane to research" items={STARTING_LANES} />
        <ChecklistSection number="3" title="Use a four-week review window" items={FOUR_WEEK_PLAN} />
        <ChecklistSection number="4" title="Avoid these common mistakes" items={AVOID_ITEMS} />

        <section className="rounded-[1.5rem] border border-brand-900/10 bg-[var(--surface-card)] p-5 shadow-sm print:rounded-none print:border-slate-300 print:bg-white print:p-4 print:shadow-none sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700 print:text-slate-700">
            Section 5
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink print:text-xl">
            28-day tracking sheet
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted print:hidden">
            On a phone, scroll the table sideways. For the full worksheet, use the print button above.
          </p>
          <div className="mt-5 overflow-x-auto rounded-xl border border-brand-900/10 print:mt-3 print:overflow-visible print:rounded-none print:border-slate-400">
            <table className="w-full min-w-[860px] border-collapse bg-[var(--surface-card)] text-left text-xs print:min-w-0 print:bg-white print:text-[9px]">
              <thead>
                <tr className="bg-brand-50 text-ink print:bg-slate-100">
                  {['Day', 'Date', 'Supplement', 'Dose', 'Energy', 'Focus', 'Mood', 'Sleep', 'Notes'].map((heading) => (
                    <th key={heading} scope="col" className="border-b border-r border-brand-900/10 px-3 py-2 font-bold uppercase tracking-wide last:border-r-0 print:border-slate-400 print:px-1 print:py-1">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 28 }, (_, index) => (
                  <tr key={index + 1}>
                    <th scope="row" className="border-b border-r border-brand-900/10 px-3 py-2 font-semibold text-ink print:border-slate-300 print:px-1 print:py-1">
                      {index + 1}
                    </th>
                    {Array.from({ length: 8 }, (_, cellIndex) => (
                      <td key={cellIndex} className="h-10 border-b border-r border-brand-900/10 px-3 py-2 last:border-r-0 print:h-5 print:border-slate-300 print:px-1 print:py-1" />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="text-center text-xs leading-5 text-muted print:text-left print:text-[10px] print:text-slate-700">
          TheHippieScientist.net · Educational supplement research, not medical advice.
        </p>
      </div>
    </>
  )
}
