import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/src/lib/seo'

const path = '/guides/sleep/glycine-for-sleep/'

export const metadata: Metadata = {
  title: 'Glycine for Sleep: Dose, Evidence, and Best Fit',
  description:
    'Evidence-first guide to glycine for sleep, including 3 gram dosing context, who it fits, what the evidence can and cannot say, and how it compares with magnesium glycinate.',
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: {
    title: 'Glycine for Sleep',
    description: 'A cautious guide to glycine for sleep quality, next-day tiredness, and magnesium glycinate confusion.',
    url: `${SITE_URL}${path}`,
    type: 'article',
    images: ['/og-default.jpg'],
  },
}

const quickTake = [
  'Glycine is a higher-dose amino acid sleep experiment, not the same thing as magnesium glycinate.',
  'The most common sleep-oriented trial pattern is about 3 grams 30-60 minutes before bed, usually as powder because capsule counts get high fast.',
  'The best-fit use case is sleep quality, subjective refreshment, or next-day tiredness after short sleep. It is not a strong sedative or insomnia treatment.',
]

const fitRows = [
  {
    situation: 'You fall asleep but wake up unrefreshed',
    fit: 'Possible fit',
    why: 'Glycine has human evidence around subjective sleep quality and next-day fatigue, but effects are modest.',
  },
  {
    situation: 'You want a knockout sleep aid',
    fit: 'Poor fit',
    why: 'Glycine is better framed as sleep-quality support than as a heavy sedative.',
  },
  {
    situation: 'You already take magnesium glycinate',
    fit: 'Do not assume equivalence',
    why: 'The glycine attached to magnesium glycinate is usually far below a standalone 3 gram glycine trial.',
  },
  {
    situation: 'You have complex medication or metabolic issues',
    fit: 'Caution',
    why: 'Keep the experiment conservative and discuss it with a clinician if your situation is medically complex.',
  },
]

const sections = [
  {
    heading: 'What glycine is trying to solve',
    body: [
      'Glycine is an amino acid that also acts as a signaling molecule in the nervous system. For sleep, the practical idea is not to force sedation. The more defensible idea is to support a calmer sleep transition and possibly improve perceived sleep quality or next-day alertness.',
      'That makes glycine different from melatonin. Melatonin is mostly a timing signal. Glycine is not mainly about shifting the body clock. It belongs closer to the sleep-quality and recovery side of the decision tree.',
    ],
  },
  {
    heading: 'Evidence grade: limited but interesting',
    body: [
      'The glycine sleep evidence is smaller than the internet hype makes it sound. Human trials and reviews suggest possible improvements in subjective sleep quality, fatigue, or daytime performance, but this is not a giant insomnia evidence base.',
      'That means the honest framing is: glycine may be worth a clean, short trial for the right sleep problem, but it should not be sold as a guaranteed deep-sleep enhancer.',
    ],
  },
  {
    heading: 'Dose and timing',
    body: [
      'A common study-informed sleep dose is 3 grams before bed. Most people who try this use powder mixed in water because reaching 3 grams with capsules can require several pills.',
      'A practical experiment is 30-60 minutes before bed for several nights, while keeping caffeine timing, bedtime, light exposure, and other supplements stable. If you change everything at once, you cannot tell what helped.',
    ],
  },
  {
    heading: 'Glycine vs magnesium glycinate',
    body: [
      'Magnesium glycinate contains magnesium bound to glycine, but that does not make it a 3 gram glycine supplement. A magnesium glycinate product may be useful for magnesium intake and tolerability, while standalone glycine is a separate amino acid dose decision.',
      'If your problem is body tension, low magnesium intake, or muscle tightness, magnesium glycinate may be the cleaner first experiment. If the problem is subjective sleep quality or next-day tiredness despite enough sleep opportunity, glycine may deserve its own page in the decision tree.',
    ],
  },
  {
    heading: 'Safety notes',
    body: [
      'Glycine is generally well tolerated in short-term supplement contexts, but sleep use still deserves basic discipline: start with one change, avoid combining with multiple sedating products, and stop if you feel worse.',
      'People who are pregnant, breastfeeding, managing serious psychiatric or metabolic conditions, or using complex medication regimens should treat glycine like any other supplement experiment and get individualized guidance.',
    ],
  },
]

const references = [
  {
    label: 'Glycine and sleep-restricted daytime performance, PubMed',
    href: 'https://pubmed.ncbi.nlm.nih.gov/22529837/',
  },
  {
    label: 'Recent consumer evidence summary on glycine vs magnesium glycinate',
    href: 'https://www.health.com/glycine-vs-magnesium-glycinate-for-sleep-11898452',
  },
]

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/guides/" className="hover:text-ink">Guides</Link>
        <span className="mx-1.5">/</span>
        <Link href="/guides/sleep/" className="hover:text-ink">Sleep</Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-ink">Glycine for Sleep</span>
      </nav>

      <article className="space-y-8">
        <header className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10 dark:border-white/10 dark:bg-[var(--surface-card)]">
          <p className="eyebrow-label">Sleep gap guide</p>
          <h1 className="heading-premium mt-3 text-ink dark:text-[var(--text-primary)]">Glycine for Sleep: Dose, Evidence, and Best Fit</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted dark:text-[var(--text-secondary)]">
            Glycine is one of the cleaner long-tail sleep topics because people confuse it with magnesium glycinate. This page separates the amino acid dose from the magnesium form so the decision stays practical.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-brand-800 dark:text-[var(--text-primary)]">
            <span className="rounded-full border border-brand-900/10 bg-brand-50 px-3 py-1 dark:border-white/10 dark:bg-[var(--surface-subtle)]">9 min read</span>
            <span className="rounded-full border border-brand-900/10 bg-brand-50 px-3 py-1 dark:border-white/10 dark:bg-[var(--surface-subtle)]">Limited evidence</span>
            <span className="rounded-full border border-brand-900/10 bg-brand-50 px-3 py-1 dark:border-white/10 dark:bg-[var(--surface-subtle)]">Updated July 8, 2026</span>
          </div>
        </header>

        <section className="card-premium p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-ink dark:text-[var(--text-primary)]">TL;DR</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-muted dark:text-[var(--text-secondary)]">
            {quickTake.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-700" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card-premium p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-ink dark:text-[var(--text-primary)]">Best-fit decision table</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-brand-900/10 dark:border-white/10">
                  <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink dark:text-[var(--text-primary)]">Situation</th>
                  <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink dark:text-[var(--text-primary)]">Fit</th>
                  <th className="py-3 text-xs font-bold uppercase tracking-wider text-ink dark:text-[var(--text-primary)]">Why</th>
                </tr>
              </thead>
              <tbody>
                {fitRows.map((row) => (
                  <tr key={row.situation} className="border-b border-brand-900/5 align-top last:border-0 dark:border-white/10">
                    <td className="py-3 pr-4 font-semibold text-ink dark:text-[var(--text-primary)]">{row.situation}</td>
                    <td className="py-3 pr-4 text-muted dark:text-[var(--text-secondary)]">{row.fit}</td>
                    <td className="py-3 text-muted dark:text-[var(--text-secondary)]">{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {sections.map((section) => (
          <section key={section.heading} className="card-premium p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-ink dark:text-[var(--text-primary)]">{section.heading}</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-muted dark:text-[var(--text-secondary)]">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}

        <section className="rounded-2xl border border-emerald-800/15 bg-emerald-50/70 p-6 shadow-sm dark:border-white/10 dark:bg-[var(--surface-subtle)]">
          <h2 className="text-xl font-semibold text-ink dark:text-[var(--text-primary)]">Next comparison</h2>
          <p className="mt-2 text-sm leading-7 text-muted dark:text-[var(--text-secondary)]">
            If the decision is actually about the magnesium form, compare this with the magnesium buying guide instead of assuming all glycinate products behave like standalone glycine.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/guides/sleep/best-magnesium-for-sleep/" className="text-brand-800 hover:underline dark:text-[var(--text-primary)]">Best magnesium for sleep →</Link>
            <Link href="/guides/sleep/magnesium-for-sleep/" className="text-brand-800 hover:underline dark:text-[var(--text-primary)]">Magnesium for sleep →</Link>
          </div>
        </section>

        <section className="card-premium p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-ink dark:text-[var(--text-primary)]">References</h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-muted dark:text-[var(--text-secondary)]">
            {references.map((reference) => (
              <li key={reference.href}>
                <a href={reference.href} className="font-semibold text-brand-800 hover:underline dark:text-[var(--text-primary)]" rel="noreferrer" target="_blank">
                  {reference.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  )
}
