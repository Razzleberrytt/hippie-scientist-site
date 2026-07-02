import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/navigation-config'

export const metadata: Metadata = {
  title: 'Best Supplement Guides by Goal',
  description:
    'Browse evidence-based best supplement guides for stress, ADHD, blood pressure, fat loss, gut health, and joint support.',
  alternates: { canonical: `${SITE_URL}/guides/best/` },
  openGraph: {
    title: 'Best Supplement Guides by Goal',
    description:
      'Evidence-based best supplement guides organized by goal, with safety context and practical comparison notes.',
    url: `${SITE_URL}/guides/best/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
}

const BEST_GUIDES = [
  {
    href: '/guides/sleep/best-supplements-for-sleep/',
    title: 'Best supplements for sleep',
    description: 'Magnesium, melatonin, L-theanine, valerian, and ashwagandha matched to the sleep problem.',
    intent: 'Sleep onset, night waking, or sleep quality',
  },
  {
    href: '/guides/focus/best-supplements-for-focus/',
    title: 'Best supplements for focus',
    description: 'Compare stimulant-adjacent and non-stimulant focus options by evidence, safety, and fit.',
    intent: 'Clean energy, attention, or mental clarity',
  },
  {
    href: '/guides/anxiety/best-herbs-for-anxiety/',
    title: 'Best herbs for anxiety',
    description: 'Calming herbs sorted by onset speed, evidence strength, and medication-stacking cautions.',
    intent: 'Daytime calm, overthinking, or anxiety support',
  },
  {
    href: '/guides/best/supplements-for-stress/',
    title: 'Best supplements for stress',
    description: 'Adaptogens, minerals, and calming supports compared by stress pattern and safety fit.',
    intent: 'Stress, burnout, or cortisol-pattern questions',
  },
  {
    href: '/guides/best/magnesium-supplements-for-adhd/',
    title: 'Best magnesium supplements for ADHD',
    description: 'A practical guide to magnesium forms, evidence boundaries, and ADHD-adjacent use cases.',
    intent: 'ADHD-adjacent nutrient support',
  },
  {
    href: '/guides/best/supplements-for-blood-pressure/',
    title: 'Best supplements for blood pressure',
    description: 'Evidence-informed cardiovascular support options with medication and safety cautions.',
    intent: 'Cardiovascular support with medication context',
  },
  {
    href: '/guides/best/supplements-for-fat-loss/',
    title: 'Best supplements for fat loss',
    description: 'A cautious look at metabolic support, appetite context, and overhyped fat-loss claims.',
    intent: 'Metabolic support without miracle claims',
  },
  {
    href: '/guides/best/supplements-for-gut-health/',
    title: 'Best supplements for gut health',
    description: 'Compare probiotics, prebiotics, fiber, and gut-support options by use case.',
    intent: 'Fiber, digestion, or microbiome support',
  },
  {
    href: '/guides/best/supplements-for-joint-support/',
    title: 'Best supplements for joint support',
    description: 'Joint health options ranked by evidence signal, mechanism, and practical safety fit.',
    intent: 'Mobility, stiffness, or inflammation support',
  },
]

const decisionShortcuts = [
  ['I want to sleep better', '/guides/sleep/best-supplements-for-sleep/', 'Start with sleep timing, tension, and next-day grogginess.'],
  ['I feel stressed or wired', '/guides/best/supplements-for-stress/', 'Separate daily adaptogen use from same-day calming support.'],
  ['I need better focus', '/guides/focus/best-supplements-for-focus/', 'Check stimulation, blood pressure, anxiety, and sleep tradeoffs first.'],
  ['I am worried about interactions', '/safety-checker/', 'Screen supplement combinations before building a stack.'],
] as const

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Best Supplement Guides',
  url: `${SITE_URL}/guides/best/`,
  numberOfItems: BEST_GUIDES.length,
  itemListElement: BEST_GUIDES.map((guide, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: guide.title,
    description: guide.description,
    url: `${SITE_URL}${guide.href}`,
  })),
}

export default function BestGuidesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-8">
      <JsonLd schema={itemListSchema} />
      <header className="max-w-3xl">
        <p className="eyebrow-label">Best-of guides</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Best Supplement Guides
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          Curated starting points for high-intent supplement decisions. Each guide narrows the
          short list by evidence signal, mechanism, safety cautions, and practical fit.
        </p>
      </header>

      <section className="mt-8 rounded-2xl border border-brand-900/10 bg-brand-50/50 p-5 dark:border-[var(--border-strong)] dark:bg-[var(--surface-card)]">
        <h2 className="text-xl font-semibold text-ink">Start by the decision you are making</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {decisionShortcuts.map(([label, href, description]) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl border border-brand-900/10 bg-white/80 p-4 transition hover:border-brand-700/25 hover:bg-white dark:bg-[var(--surface-subtle)]"
            >
              <span className="block text-sm font-semibold text-ink">{label}</span>
              <span className="mt-1 block text-sm leading-6 text-muted">{description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BEST_GUIDES.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="group flex min-h-52 flex-col justify-between rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm transition hover:border-brand-700/25 hover:shadow-md dark:border-[var(--border-strong)] dark:bg-[var(--surface-card)]"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700">{guide.intent}</p>
              <h2 className="text-lg font-semibold leading-snug text-ink group-hover:text-brand-800">
                {guide.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">{guide.description}</p>
            </div>
            <span className="mt-5 text-sm font-bold text-brand-700 transition group-hover:translate-x-1 group-hover:text-brand-800">
              Read guide <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="mt-10 rounded-2xl border border-brand-900/10 bg-brand-50/50 p-6 dark:border-[var(--border-strong)] dark:bg-[var(--surface-card)]">
        <h2 className="text-xl font-semibold text-ink">Need a broader starting point?</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Use the full guide library if you are still choosing a goal category, or compare specific
          ingredients head to head before buying.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/guides/" className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800">
            All guides
          </Link>
          <Link href="/guides/compare/" className="rounded-full border border-brand-700 px-5 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50">
            Compare supplements
          </Link>
        </div>
      </section>
    </main>
  )
}
