import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'Best Supplements for Stress: Decision Guide',
  description:
    'Match stress supplements to your pattern: acute pressure, chronic cortisol, burnout, poor sleep, or stress-related tension. Evidence-first guidance with safety context.',
  alternates: { canonical: `${SITE_URL}/guides/stress/` },
  openGraph: {
    title: 'Best Supplements for Stress: Decision Guide',
    description:
      'Choose a stress-support strategy based on what your stress actually feels like, not a generic ranked list.',
    url: `${SITE_URL}/guides/stress/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
}

const routes = [
  {
    problem: 'I feel wired, tense, or overstimulated right now',
    detail: 'Start with faster, generally non-sedating options used for acute stress rather than long-term adaptogens.',
    href: '/guides/anxiety/l-theanine-for-anxiety/',
    cta: 'See L-theanine for acute stress',
  },
  {
    problem: 'My stress has been elevated for weeks or months',
    detail: 'Compare adaptogens studied for perceived stress and cortisol-related symptoms over time.',
    href: '/guides/anxiety/best-adaptogens-for-stress/',
    cta: 'Compare stress adaptogens',
  },
  {
    problem: 'Stress is keeping me awake',
    detail: 'Focus on nighttime options, timing, next-day sedation, and anxiety-driven insomnia.',
    href: '/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night/',
    cta: 'See nighttime stress options',
  },
  {
    problem: 'I feel depleted, foggy, or burned out',
    detail: 'Separate calming support from stimulating adaptogens and consider whether fatigue needs medical evaluation.',
    href: '/guides/anxiety/best-supplements-for-stress/',
    cta: 'Review supplements for chronic stress',
  },
  {
    problem: 'I am mainly worried about high cortisol',
    detail: 'Use a broader plan that includes sleep, caffeine, exercise load, and evidence-based supplement context.',
    href: '/guides/anxiety/how-to-lower-cortisol-naturally/',
    cta: 'Read the cortisol guide',
  },
  {
    problem: 'I want to combine multiple options',
    detail: 'Check overlap, sedation, medication interactions, and whether a stack is actually necessary.',
    href: '/safety-checker/',
    cta: 'Check a combination first',
  },
]

const comparisons = [
  {
    href: '/guides/compare/rhodiola-vs-ashwagandha/',
    title: 'Rhodiola vs Ashwagandha',
    text: 'A more activating adaptogen versus a more calming one.',
  },
  {
    href: '/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium/',
    title: 'Ashwagandha vs L-Theanine vs Magnesium',
    text: 'Long-term stress support, acute calm, and mineral support compared.',
  },
  {
    href: '/guides/anxiety/cbd-vs-ashwagandha-for-anxiety/',
    title: 'CBD vs Ashwagandha',
    text: 'Different evidence bases, timelines, and safety considerations.',
  },
]

export default function StressGuidePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6">
      <nav className="mb-5 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/guides/" className="hover:text-ink">
          Guides
        </Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-ink">Stress</span>
      </nav>

      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Decision guide</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Choose stress support by the kind of stress you have
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted">
          Acute pressure, chronic overload, poor sleep, and burnout are not the same problem. Start with the pattern that fits best, then compare evidence and safety before choosing anything.
        </p>
      </header>

      <section className="mt-10" aria-labelledby="stress-router-heading">
        <h2 id="stress-router-heading" className="text-2xl font-bold text-ink sm:text-3xl">
          What does your stress feel like?
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {routes.map((route) => (
            <Link
              key={route.problem}
              href={route.href}
              className="group rounded-2xl border border-brand-900/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-700/30 hover:shadow-sm dark:border-white/10 dark:bg-[var(--surface-card)]"
            >
              <h3 className="text-base font-bold text-ink dark:text-[var(--text-primary)]">{route.problem}</h3>
              <p className="mt-2 text-sm leading-6 text-muted dark:text-[var(--text-secondary)]">{route.detail}</p>
              <span className="mt-4 inline-flex text-sm font-semibold text-brand-800 group-hover:underline dark:text-[var(--text-primary)]">
                {route.cta} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="stress-comparisons-heading">
        <h2 id="stress-comparisons-heading" className="text-2xl font-bold text-ink sm:text-3xl">
          Compare the most common options
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {comparisons.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-brand-900/10 bg-brand-50/60 p-5 transition hover:border-brand-700/30 dark:border-white/10 dark:bg-[var(--surface-subtle)]"
            >
              <h3 className="font-bold text-ink dark:text-[var(--text-primary)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted dark:text-[var(--text-secondary)]">{item.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <aside className="mt-14 rounded-2xl border-l-4 border-brand-700/50 bg-brand-50/70 p-5 dark:bg-[var(--surface-subtle)]">
        <p className="text-sm leading-7 text-ink dark:text-[var(--text-secondary)]">
          <strong>Safety note:</strong> Persistent stress, severe anxiety, chest pain, major sleep disruption, or worsening mood deserves professional evaluation. Supplements can interact with prescriptions and are not a substitute for treatment.
        </p>
      </aside>
    </main>
  )
}
