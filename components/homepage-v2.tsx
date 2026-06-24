import Link from 'next/link'
import { getHomepageFreshness } from '@/lib/freshness'
import {
  ComparisonCard,
  GoalCard,
  InternalLinkCard,
  MethodologyStrip,
  SectionHeader,
} from '@/components/ui/clinical-apothecary'

const heroGoals = [
  {
    slug: 'sleep',
    title: 'Sleep',
    prompt: 'Fall asleep, stay asleep, and compare sleep supplements without guessing.',
    meta: 'Sleep quality',
  },
  {
    slug: 'stress',
    title: 'Stress',
    prompt: 'Sort adaptogens and calming supports by fatigue pattern, timing, and safety.',
    meta: 'Stress physiology',
  },
  {
    slug: 'anxiety',
    title: 'Anxiety',
    prompt: 'Find grounded options for calm, overthinking, and daytime tension.',
    meta: 'Calm support',
  },
  {
    slug: 'focus',
    title: 'Focus',
    prompt: 'Compare non-stimulant focus supports and caffeine-adjacent options.',
    meta: 'Cognitive support',
  },
]

const trustSignals = [
  {
    n: '01',
    label: 'Evidence tiered, not flattened',
    body: 'Clinical evidence is separated from mechanism-only claims so you know what actually has human trial data.',
  },
  {
    n: '02',
    label: 'Safety before recommendations',
    body: 'Interactions, contraindications, and uncertainty are surfaced before any product comparison.',
  },
  {
    n: '03',
    label: 'Methodology is public',
    body: 'Every guide links to the evidence grading system so you can audit the claims yourself.',
  },
]

const comparisonLinks = [
  { href: '/compare/melatonin-vs-magnesium/', title: 'Melatonin vs magnesium', eyebrow: 'Sleep' },
  { href: '/compare/rhodiola-vs-ashwagandha/', title: 'Rhodiola vs ashwagandha', eyebrow: 'Stress' },
  { href: '/compare/l-theanine-vs-magnesium/', title: 'L-theanine vs magnesium', eyebrow: 'Calm' },
  { href: '/compare/berberine-vs-metformin/', title: 'Berberine vs metformin', eyebrow: 'Metabolic' },
]

const toolLinks = [
  {
    href: '/safety-checker/',
    title: 'Safety interaction checker',
    description: 'Screen supplement combinations for overlapping cautions before stacking.',
  },
  {
    href: '/supplement-safety-checklist/',
    title: 'Supplement safety checklist',
    description: 'Use five safety questions before comparing products or buying.',
  },
  {
    href: '/tools/',
    title: 'Decision tools',
    description: 'Open the site tools built for safety, dosing, and practical comparison.',
  },
]

export default function HomepageV2() {
  const { lastReviewed, citationCount } = getHomepageFreshness()
  const formattedDate = new Date(lastReviewed).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className='overflow-x-clip bg-[var(--bg)]'>
      <div className='mx-auto max-w-6xl space-y-8 px-4 pb-12 pt-4 sm:px-6 sm:space-y-10 sm:pb-16 sm:pt-6 lg:px-8'>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className='relative overflow-hidden rounded-lg border border-brand-900/10 bg-white/85 px-6 py-10 shadow-sm sm:px-10 sm:py-16 dark:bg-[var(--surface-card-strong)]'>
          <div className='relative mx-auto max-w-4xl'>
            <div className='flex flex-col items-center text-center'>
              <p role='doc-subtitle' className='mb-3 inline-flex text-[0.7rem] font-bold uppercase tracking-[0.2em] text-brand-700'>
                Start with the problem, not the product
              </p>
              <h1 className='font-display text-[2.5rem] font-bold leading-[1.05] tracking-[-0.04em] text-ink break-words sm:text-5xl md:text-6xl'>
                Evidence-based supplement guides for sleep, stress, anxiety, and focus
              </h1>
              <p className='mt-5 max-w-2xl text-sm font-medium leading-7 text-muted sm:text-base sm:leading-8'>
                The Hippie Scientist helps you choose herbs and supplements by goal, with human evidence, safety cautions, and uncertainty kept visible.
              </p>

              <MethodologyStrip
                className='mt-5 max-w-2xl text-left'
                description={`Last reviewed: ${formattedDate}. ${citationCount} peer-reviewed studies cited. Evidence tiers separate clinical evidence from mechanism-only claims.`}
              />
              <div className='mt-6 flex w-full max-w-sm flex-col'>
                <Link
                  href='#choose-a-path'
                  className='rounded-full bg-brand-800 px-6 py-3.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(11,29,20,0.22)] transition-all duration-200 motion-safe:hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-[0_8px_20px_rgba(11,29,20,0.28)] active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 text-center'
                >
                  Browse by Health Goal
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Comparisons and tools */}
        <section className='grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-lg border border-brand-900/10 bg-white/80 p-5 shadow-sm sm:p-6 dark:border-[var(--border-strong)] dark:bg-[var(--surface-card)]'>
            <SectionHeader
              eyebrow='Decision support'
              title='Compare before you choose'
              subtitle='Side-by-side pages help answer the high-intent questions people search before buying or stacking.'
            />
            <div className='mt-5 grid gap-3 sm:grid-cols-2'>
              {comparisonLinks.map((comparison) => (
                <ComparisonCard
                  key={comparison.href}
                  href={comparison.href}
                  title={comparison.title}
                  eyebrow={comparison.eyebrow}
                />
              ))}
            </div>
            <Link href='/compare' className='mt-5 inline-flex text-sm font-bold text-brand-700 transition hover:text-brand-800'>
              Browse all comparisons →
            </Link>
          </div>

          <div className='rounded-lg border border-emerald-800/15 bg-sage-50/80 p-5 shadow-sm sm:p-6 dark:border-[var(--border-strong)] dark:bg-[var(--surface-card)]'>
            <SectionHeader
              eyebrow='Safety first'
              title='Use the safety tools'
              subtitle='The fastest win is avoiding mismatched products, risky stacks, and unclear supplement forms.'
            />
            <div className='mt-5 grid gap-3'>
              {toolLinks.map((tool) => (
                <InternalLinkCard
                  key={tool.href}
                  href={tool.href}
                  title={tool.title}
                  description={tool.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Goal Pathways */}
        <section id='choose-a-path' className='scroll-mt-24 space-y-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <SectionHeader
              eyebrow='Goal pathways'
              title='Choose one path'
              subtitle='Most visitors should start here. Pick the outcome you care about, then compare options inside that guide.'
              action={{ href: '/goals', label: 'View all goals' }}
            />
          </div>

          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {heroGoals.map((hGoal) => (
                <GoalCard
                  key={hGoal.slug}
                  href={`/goals/${hGoal.slug}`}
                  title={hGoal.title}
                  description={hGoal.prompt}
                  meta={hGoal.meta}
                />
              ))}
          </div>
        </section>

        {/* Trust */}
        <section className='rounded-lg border border-brand-900/10 bg-white/80 p-5 shadow-sm sm:p-6 dark:bg-[var(--surface-card)]'>
          <div className='grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start'>
            <SectionHeader
              eyebrow='Clinical method'
              title='Why trust the guide?'
              subtitle='The site is built for cautious decisions: what has human evidence, what is only plausible, and what needs safety review before use.'
            />
            <div className='grid gap-3 sm:grid-cols-3'>
              {trustSignals.map((signal) => (
                <div key={signal.n} className='flex gap-4 rounded-lg border border-brand-900/10 bg-sage-50/70 p-4 dark:bg-[var(--surface-subtle)] dark:text-[var(--text-secondary)]'>
                  <span className='mt-0.5 shrink-0 font-mono text-[0.65rem] font-bold tracking-widest text-brand-400'>{signal.n}</span>
                  <div>
                    <p className='text-sm font-semibold text-ink'>{signal.label}</p>
                    <p className='mt-1 text-sm leading-6 text-muted'>{signal.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className='mt-5 text-sm font-bold'>
            <Link href='/methodology' className='text-brand-700 transition hover:text-brand-800'>
              Read the evidence methodology →
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
