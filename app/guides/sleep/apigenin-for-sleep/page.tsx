import type { Metadata } from 'next'
import Link from 'next/link'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import SleepResearchNextActions from '@/components/SleepResearchNextActions'
import { SITE_URL, buildTwitterMetadata, faqPageJsonLd } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'

const path = '/guides/sleep/apigenin-for-sleep/'

export const metadata: Metadata = {
  title: 'Apigenin for Sleep: Evidence, Dose Caution, and Reality Check',
  description:
    'A cautious evidence review of apigenin for sleep, why chamomile evidence does not automatically prove isolated apigenin works, and how to think about dose and safety.',
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: {
    title: 'Apigenin for Sleep',
    description: 'A reality-check guide for the trending apigenin sleep supplement.',
    url: `${SITE_URL}${path}`,
    type: 'article',
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: 'Apigenin for Sleep',
    description: 'A reality-check guide for the trending apigenin sleep supplement.',
  }),
}

const quickTake = [
  'Apigenin is a trending sleep compound, but the strongest public-facing evidence is still mostly chamomile-adjacent rather than isolated apigenin insomnia evidence.',
  'Chamomile contains apigenin, but a chamomile tea or extract study does not automatically validate every standalone apigenin capsule.',
  'The best framing is experimental calm support with low confidence, not a proven natural sleep medication.',
]

const verdictRows = [
  {
    question: 'Is apigenin proven for insomnia?',
    answer: 'No',
    note: 'Evidence is not strong enough to frame isolated apigenin as an insomnia treatment.',
  },
  {
    question: 'Is chamomile evidence the same thing?',
    answer: 'No',
    note: 'Chamomile contains multiple compounds. Apigenin may be part of the story, but it is not the whole extract.',
  },
  {
    question: 'Could it still be worth a cautious trial?',
    answer: 'Maybe',
    note: 'Only if expectations are modest and safety context is clean.',
  },
  {
    question: 'Should it be stacked immediately?',
    answer: 'No',
    note: 'Start with one variable. Stacking apigenin with melatonin, magnesium, valerian, or sedatives makes response hard to interpret.',
  },
]

// Drawn from this page's own verdict rows and section bodies. The guide's core
// argument is that chamomile evidence does not transfer to isolated apigenin, so
// the FAQ keeps that separation rather than smoothing it into a recommendation.
const faqs = [
  {
    question: 'Is apigenin proven to help with insomnia?',
    answer:
      'No. The evidence is not strong enough to frame isolated apigenin as an insomnia treatment. Chamomile has small human studies and reviews around sleep quality, but results are mixed, and isolated apigenin has even less direct sleep-specific human evidence. The honest ceiling is possible relaxation support, not proven sleep architecture optimization.',
  },
  {
    question: 'Does chamomile research prove apigenin works?',
    answer:
      'No. Chamomile contains multiple compounds, and apigenin may be part of the story without being the whole extract. A chamomile tea or extract study does not automatically validate a standalone apigenin capsule. Treating the two as interchangeable is the most common mistake on this topic.',
  },
  {
    question: 'What is a proven apigenin dose for sleep?',
    answer:
      'There is not one. Direct dose-response evidence for isolated apigenin sleep use is not mature, so this guide avoids implying a universally proven sleep dose. Labels also vary: some products use standalone apigenin while others sell chamomile extracts or blends, and those are not interchangeable without knowing extract standardization and serving size.',
  },
  {
    question: 'Can I stack apigenin with melatonin or magnesium?',
    answer:
      'Not as a first step. Start with one variable — stacking apigenin with melatonin, magnesium, valerian or sedatives makes any response hard to interpret. The main practical safety issue is not that apigenin is uniquely risky, but that sleep users often combine it with several calming products, alcohol, antihistamines, benzodiazepines or other sedating substances.',
  },
  {
    question: 'Who should be cautious with apigenin or chamomile products?',
    answer:
      'Chamomile-related products may matter for people with allergies to plants in the Asteraceae family. Pregnancy, breastfeeding, liver concerns, anticoagulant use and complex medication regimens all deserve individualized guidance before experimenting.',
  },
  {
    question: 'What should I consider before apigenin?',
    answer:
      'Match the tool to the problem. If the issue is sleep timing, melatonin is more targeted. If it is body tension or low magnesium intake, magnesium glycinate is a cleaner first experiment. If it is mental arousal, L-theanine has a more practical calm-use history. Apigenin fits best as a low-confidence, trend-driven option rather than a first choice.',
  },
]

const sections = [
  {
    heading: 'Why this page exists',
    body: [
      'Apigenin is popular because it sounds more scientific than chamomile tea. That creates a classic supplement-content gap: people search for a specific molecule, but most practical evidence comes from whole-herb chamomile studies or mechanistic discussion.',
      'The useful answer is not hype or dismissal. The useful answer is separation: chamomile evidence, apigenin mechanism, isolated supplement claims, and safety context are related but not identical.',
    ],
  },
  {
    heading: 'Evidence grade: low to limited',
    body: [
      'Chamomile has small human studies and reviews around sleep quality, but results are mixed and not strong enough to treat it like a reliable insomnia intervention. Isolated apigenin has even less direct sleep-specific human evidence.',
      'That means apigenin can be discussed as a plausible sleep-adjacent compound, but the claim ceiling should stay low: possible relaxation support, not proven sleep architecture optimization.',
    ],
  },
  {
    heading: 'Dose reality check',
    body: [
      'Apigenin labels vary. Some products use standalone apigenin, while others sell chamomile extracts or blends. Those are not interchangeable without knowing the extract standardization and serving size.',
      'Because direct dose-response evidence for isolated apigenin sleep use is not mature, this page avoids pretending there is a universally proven sleep dose. The conservative decision is to avoid aggressive stacking and to reassess quickly if there is no clear benefit.',
    ],
  },
  {
    heading: 'Safety and interaction flags',
    body: [
      'The biggest practical safety issue is not that apigenin is uniquely scary. It is that sleep users often stack it with multiple calming products, alcohol, antihistamines, benzodiazepines, sleep medications, or other sedating substances.',
      'Chamomile-related products may also matter for people with allergies to plants in the Asteraceae family. Pregnancy, breastfeeding, liver concerns, anticoagulant use, and complex medication regimens deserve individualized guidance before experimenting.',
    ],
  },
  {
    heading: 'Better first choices for most sleep problems',
    body: [
      'If the issue is sleep timing, melatonin is the more targeted tool. If the issue is body tension or low magnesium intake, magnesium glycinate is the cleaner first experiment. If the issue is mental arousal, L-theanine has a more practical calm-use history.',
      'Apigenin fits best as a low-confidence, trend-driven curiosity page. That is still valuable content because it helps readers avoid buying a supplement only because the molecule name sounds precise.',
    ],
  },
]

const references = [
  {
    label: 'Chamomile sleep evidence overview, Verywell Health',
    href: 'https://www.verywellhealth.com/what-the-research-says-about-popular-sleep-supplements-7970910',
  },
  {
    label: 'Chamomile tea sleep evidence and apigenin discussion, Verywell Health',
    href: 'https://www.verywellhealth.com/does-chamomile-tea-make-you-sleepy-8602726',
  },
]

export default function Page() {
  const faqLd = faqPageJsonLd({ pagePath: path, questions: faqs })

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      {faqLd ? <JsonLd schema={faqLd} /> : null}
      <nav className="mb-6 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/guides/" className="hover:text-ink">Guides</Link>
        <span className="mx-1.5">/</span>
        <Link href="/guides/sleep/" className="hover:text-ink">Sleep</Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-ink">Apigenin for Sleep</span>
      </nav>

      <article className="space-y-8">
        <header className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10 dark:border-white/10 dark:bg-[var(--surface-card)]">
          <p className="eyebrow-label">Trend reality check</p>
          <h1 className="heading-premium mt-3 text-ink dark:text-[var(--text-primary)]">Apigenin for Sleep: Evidence, Dose Caution, and Reality Check</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted dark:text-[var(--text-secondary)]">
            Apigenin is getting searched like a proven sleep hack. The evidence is more complicated. This guide keeps the molecule, chamomile, and supplement-label claims in separate boxes.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-brand-800 dark:text-[var(--text-primary)]">
            <span className="rounded-full border border-brand-900/10 bg-brand-50 px-3 py-1 dark:border-white/10 dark:bg-[var(--surface-subtle)]">8 min read</span>
            <span className="rounded-full border border-brand-900/10 bg-brand-50 px-3 py-1 dark:border-white/10 dark:bg-[var(--surface-subtle)]">Low confidence</span>
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
          <h2 className="text-xl font-semibold text-ink dark:text-[var(--text-primary)]">Verdict table</h2>
          <ResponsiveTable label="Apigenin sleep evidence verdict table" className="mt-5">
            <table className="min-w-full border-collapse text-left text-sm">
              <caption className="sr-only">Verdicts and context for common apigenin sleep questions</caption>
              <thead>
                <tr className="border-b border-brand-900/10 dark:border-white/10">
                  <th scope="col" className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink dark:text-[var(--text-primary)]">Question</th>
                  <th scope="col" className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink dark:text-[var(--text-primary)]">Answer</th>
                  <th scope="col" className="py-3 text-xs font-bold uppercase tracking-wider text-ink dark:text-[var(--text-primary)]">Context</th>
                </tr>
              </thead>
              <tbody>
                {verdictRows.map((row) => (
                  <tr key={row.question} className="border-b border-brand-900/5 align-top last:border-0 dark:border-white/10">
                    <th scope="row" className="py-3 pr-4 text-left font-semibold text-ink dark:text-[var(--text-primary)]">{row.question}</th>
                    <td className="py-3 pr-4 text-muted dark:text-[var(--text-secondary)]">{row.answer}</td>
                    <td className="py-3 text-muted dark:text-[var(--text-secondary)]">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTable>
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

        <section className="rounded-2xl border border-amber-800/15 bg-amber-50/70 p-6 shadow-sm dark:border-white/10 dark:bg-[var(--surface-subtle)]">
          <h2 className="text-xl font-semibold text-ink dark:text-[var(--text-primary)]">Better first reads</h2>
          <p className="mt-2 text-sm leading-7 text-muted dark:text-[var(--text-secondary)]">
            For most readers, apigenin should come after the cleaner decision pages. Start with the actual sleep problem, then decide whether a low-confidence trend supplement is even needed.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/guides/sleep/best-supplements-for-sleep/" className="text-brand-800 hover:underline dark:text-[var(--text-primary)]">Best sleep supplements →</Link>
            <Link href="/guides/sleep/l-theanine-for-sleep/" className="text-brand-800 hover:underline dark:text-[var(--text-primary)]">L-theanine for sleep →</Link>
            <Link href="/guides/sleep/magnesium-for-sleep/" className="text-brand-800 hover:underline dark:text-[var(--text-primary)]">Magnesium for sleep →</Link>
          </div>
        </section>

        <section id="faq" className="card-premium scroll-mt-20 p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-ink dark:text-[var(--text-primary)]">Frequently asked questions</h2>
          <div className="mt-4 space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="rounded-xl border border-brand-900/10 bg-brand-50/30 p-4 dark:border-white/10 dark:bg-[var(--surface-subtle)]">
                <summary className="cursor-pointer font-semibold text-ink dark:text-[var(--text-primary)]">{faq.question}</summary>
                <p className="mt-2 text-sm leading-7 text-muted dark:text-[var(--text-secondary)]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="card-premium p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-ink dark:text-[var(--text-primary)]">References</h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-muted dark:text-[var(--text-secondary)]">
            {references.map((reference) => (
              <li key={reference.href}>
                <a
                  href={reference.href}
                  className="font-semibold text-brand-800 hover:underline dark:text-[var(--text-primary)]"
                  rel="noopener noreferrer"
                  target="_blank"
                  aria-label={`${reference.label} (opens in a new tab)`}
                >
                  {reference.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <SleepResearchNextActions />
      </article>
    </main>
  )
}
