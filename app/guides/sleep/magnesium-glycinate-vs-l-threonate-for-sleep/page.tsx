import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/src/lib/seo'

const path = '/guides/sleep/magnesium-glycinate-vs-l-threonate-for-sleep/'

export const metadata: Metadata = {
  title: 'Magnesium Glycinate vs L-Threonate for Sleep',
  description:
    'Compare magnesium glycinate and magnesium L-threonate for sleep by evidence, dose clarity, cost, tolerability, and when each form makes sense.',
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: {
    title: 'Magnesium Glycinate vs L-Threonate for Sleep',
    description: 'A practical sleep-focused comparison of two popular magnesium forms.',
    url: `${SITE_URL}${path}`,
    type: 'article',
    images: ['/og-default.jpg'],
  },
}

const quickTake = [
  'Magnesium glycinate is usually the cleaner first sleep pick because it is simpler, commonly tolerated, and easier to dose by elemental magnesium.',
  'Magnesium L-threonate is more cognition-branded and more expensive. Sleep claims are interesting but not strong enough to beat glycinate for most first trials.',
  'Do not buy either form only because the front label number looks big. Elemental magnesium, serving size, tolerability, and medication spacing matter more.',
]

const comparisonRows = [
  {
    factor: 'Best first sleep trial',
    glycinate: 'Usually yes',
    threonate: 'Maybe, but less necessary',
    call: 'Glycinate wins for most readers.',
  },
  {
    factor: 'Dose clarity',
    glycinate: 'Often clearer if elemental magnesium is listed',
    threonate: 'Can be confusing because total compound weight is emphasized',
    call: 'Check elemental magnesium, not just capsule weight.',
  },
  {
    factor: 'Tolerability',
    glycinate: 'Often gentle, though not guaranteed',
    threonate: 'Usually not as bowel-active as citrate, but product-specific',
    call: 'Both can be reasonable; individual response matters.',
  },
  {
    factor: 'Cost',
    glycinate: 'Usually cheaper',
    threonate: 'Usually premium-priced',
    call: 'Do not pay premium unless the use case is clear.',
  },
  {
    factor: 'Sleep evidence framing',
    glycinate: 'Magnesium evidence plus practical form logic',
    threonate: 'Emerging, product-specific, cognition-adjacent claims',
    call: 'Neither deserves miracle-sleep language.',
  },
]

const sections = [
  {
    heading: 'The practical answer',
    body: [
      'For most people comparing magnesium forms for sleep, magnesium glycinate or bisglycinate is the default first experiment. It is widely available, usually easier to tolerate than citrate, and fits the common sleep use case: physical tension, low intake, or general nervous-system calm.',
      'Magnesium L-threonate is not useless. It is simply not the obvious first sleep purchase for most readers. It is usually marketed around brain magnesium and cognition, costs more, and the sleep story is still not strong enough to justify treating it as universally better.',
    ],
  },
  {
    heading: 'Evidence grade: form-specific claims are weaker than magnesium claims',
    body: [
      'The broad magnesium sleep evidence is already limited to moderate depending on the population and outcome. Once you narrow the claim to one exact form beating another exact form for sleep, the evidence gets weaker.',
      'That is why this guide makes a practical call instead of a dramatic clinical claim: glycinate is the cleaner first buy for most sleep-focused users; L-threonate is a more expensive niche option with a less direct sleep rationale.',
    ],
  },
  {
    heading: 'How to read the label',
    body: [
      'Ignore the biggest front-label number until you know whether it refers to elemental magnesium or the total compound weight. A product can say hundreds or thousands of milligrams while delivering much less elemental magnesium.',
      'For sleep, a conservative range often discussed on this site is 100-300 mg elemental magnesium in the evening. Start low if you are sensitive to supplements, have bowel issues, or already get a lot of magnesium from diet and other products.',
    ],
  },
  {
    heading: 'When L-threonate may make sense',
    body: [
      'L-threonate may make more sense when the buyer is specifically interested in cognition-adjacent magnesium claims and accepts the price premium. Even then, sleep should be tracked as an outcome, not assumed.',
      'If the goal is simply better sleep quality with fewer variables, glycinate is usually the less complicated route. A simple, lower-cost experiment beats a premium supplement that solves the wrong problem.',
    ],
  },
  {
    heading: 'Safety and interaction notes',
    body: [
      'Both forms are magnesium supplements. The same high-level cautions apply: avoid unsupervised use in significant kidney disease, and separate magnesium from medications it can bind, including certain antibiotics, thyroid medication, and bisphosphonates.',
      'Loose stools, nausea, dizziness, or next-day fog are reasons to reassess the dose, form, or the whole sleep plan. Do not stack magnesium with multiple calming products and assume more ingredients equals better sleep.',
    ],
  },
]

const references = [
  {
    label: 'Oral magnesium supplementation for insomnia review, PubMed',
    href: 'https://pubmed.ncbi.nlm.nih.gov/33865376/',
  },
  {
    label: 'Magnesium L-threonate summary and evidence caveats',
    href: 'https://en.wikipedia.org/wiki/Magnesium_L-threonate',
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
        <span className="font-medium text-ink">Magnesium Glycinate vs L-Threonate</span>
      </nav>

      <article className="space-y-8">
        <header className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10 dark:border-white/10 dark:bg-[var(--surface-card)]">
          <p className="eyebrow-label">Sleep comparison guide</p>
          <h1 className="heading-premium mt-3 text-ink dark:text-[var(--text-primary)]">Magnesium Glycinate vs L-Threonate for Sleep</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted dark:text-[var(--text-secondary)]">
            This comparison fills a buyer-intent gap: people know they want magnesium for sleep, but they get stuck between glycinate and L-threonate. The answer is less glamorous than the labels make it sound.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-brand-800 dark:text-[var(--text-primary)]">
            <span className="rounded-full border border-brand-900/10 bg-brand-50 px-3 py-1 dark:border-white/10 dark:bg-[var(--surface-subtle)]">10 min read</span>
            <span className="rounded-full border border-brand-900/10 bg-brand-50 px-3 py-1 dark:border-white/10 dark:bg-[var(--surface-subtle)]">Buyer intent</span>
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
          <h2 className="text-xl font-semibold text-ink dark:text-[var(--text-primary)]">Decision table</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-brand-900/10 dark:border-white/10">
                  <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink dark:text-[var(--text-primary)]">Factor</th>
                  <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink dark:text-[var(--text-primary)]">Glycinate</th>
                  <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink dark:text-[var(--text-primary)]">L-threonate</th>
                  <th className="py-3 text-xs font-bold uppercase tracking-wider text-ink dark:text-[var(--text-primary)]">Call</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.factor} className="border-b border-brand-900/5 align-top last:border-0 dark:border-white/10">
                    <td className="py-3 pr-4 font-semibold text-ink dark:text-[var(--text-primary)]">{row.factor}</td>
                    <td className="py-3 pr-4 text-muted dark:text-[var(--text-secondary)]">{row.glycinate}</td>
                    <td className="py-3 pr-4 text-muted dark:text-[var(--text-secondary)]">{row.threonate}</td>
                    <td className="py-3 text-muted dark:text-[var(--text-secondary)]">{row.call}</td>
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
          <h2 className="text-xl font-semibold text-ink dark:text-[var(--text-primary)]">Clean next step</h2>
          <p className="mt-2 text-sm leading-7 text-muted dark:text-[var(--text-secondary)]">
            If you are still early in the sleep decision, start with the broader magnesium guide, then use this page only when the form choice is the bottleneck.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/guides/sleep/magnesium-for-sleep/" className="text-brand-800 hover:underline dark:text-[var(--text-primary)]">Magnesium for sleep →</Link>
            <Link href="/guides/sleep/best-magnesium-for-sleep/" className="text-brand-800 hover:underline dark:text-[var(--text-primary)]">Best magnesium for sleep →</Link>
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
