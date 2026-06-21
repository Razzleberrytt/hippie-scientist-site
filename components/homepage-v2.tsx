import Link from 'next/link'
import { getHomepageFreshness } from '@/lib/freshness'

type SectionHeaderProps = { title: string; subtitle?: string; as?: 'h2' | 'h3' }

const heroGoals = [
  {
    slug: 'sleep',
    title: 'Sleep',
    prompt: 'Fall asleep, stay asleep, and compare sleep supplements without guessing.',
    bg: 'border-[#b9c8d8] bg-[#f4f8fb]',
    accent: 'text-[#244966]',
  },
  {
    slug: 'stress',
    title: 'Stress',
    prompt: 'Sort adaptogens and calming supports by fatigue pattern, timing, and safety.',
    bg: 'border-[#bdd2c2] bg-[#f3f8f1]',
    accent: 'text-[#28593a]',
  },
  {
    slug: 'anxiety',
    title: 'Anxiety',
    prompt: 'Find grounded options for calm, overthinking, and daytime tension.',
    bg: 'border-[#d3c4df] bg-[#faf6fc]',
    accent: 'text-[#5a3f70]',
  },
  {
    slug: 'focus',
    title: 'Focus',
    prompt: 'Compare non-stimulant focus supports and caffeine-adjacent options.',
    bg: 'border-[#d8c7a5] bg-[#fbf7ec]',
    accent: 'text-[#6b4d1f]',
  },
]

const trustSignals = [
  'Clinical evidence is separated from mechanism-only claims.',
  'Safety, interactions, and uncertainty are surfaced before recommendations.',
  'Guides are reviewed and linked to the site evidence methodology.',
]

const popularGuides = [
  {
    href: '/guides/best-supplements-for-sleep/',
    title: 'Best supplements for sleep',
    description: 'Compare sleep aids by timing, grogginess risk, evidence, and safety.',
  },
  {
    href: '/guides/best-supplements-for-stress/',
    title: 'Best supplements for stress',
    description: 'Separate acute calm support from longer-term adaptogen routines.',
  },
  {
    href: '/guides/best-herbs-for-anxiety/',
    title: 'Best herbs for anxiety',
    description: 'Review calming herbs with interaction cautions and evidence limits visible.',
  },
  {
    href: '/best-magnesium-supplements-for-adhd/',
    title: 'Best magnesium for ADHD',
    description: 'Compare magnesium forms for focus, sleep, and practical product fit.',
  },
]

const comparisonLinks = [
  { href: '/compare/melatonin-vs-magnesium/', title: 'Melatonin vs magnesium' },
  { href: '/compare/rhodiola-vs-ashwagandha/', title: 'Rhodiola vs ashwagandha' },
  { href: '/compare/l-theanine-vs-magnesium/', title: 'L-theanine vs magnesium' },
  { href: '/compare/berberine-vs-metformin/', title: 'Berberine vs metformin' },
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

function SectionHeader({ title, subtitle, as: HeadingTag = 'h2' }: SectionHeaderProps) {
  return (
    <div className='max-w-3xl space-y-2'>
      <HeadingTag className='text-xl font-semibold tracking-tight text-ink sm:text-2xl'>{title}</HeadingTag>
      {subtitle ? <p className='text-sm leading-6 text-muted sm:text-base'>{subtitle}</p> : null}
    </div>
  )
}

export default function HomepageV2() {
  const { lastReviewed, citationCount } = getHomepageFreshness()
  const formattedDate = new Date(lastReviewed).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className='overflow-x-clip bg-site-bg'>
      <div className='mx-auto max-w-6xl space-y-8 px-4 pb-12 pt-4 sm:px-6 sm:space-y-10 sm:pb-16 sm:pt-6 lg:px-8'>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className='rounded-[1.25rem] border border-brand-900/10 bg-white/90 px-6 py-8 shadow-sm sm:px-10 sm:py-12'>
          <div className='mx-auto max-w-4xl'>
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

              <div className='mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-brand-800' aria-label={`Last reviewed: ${formattedDate}. ${citationCount} peer-reviewed studies cited. Evidence methodology available.`}>
                <span className='rounded-full border border-brand-900/10 bg-brand-50/50 px-3.5 py-1'>Last reviewed: {formattedDate}</span>
                <span className='rounded-full border border-brand-900/10 bg-brand-50/50 px-3.5 py-1'>{citationCount} peer-reviewed studies</span>
                <Link href='/methodology' className='rounded-full border border-brand-900/10 bg-brand-50/50 px-3.5 py-1 transition hover:bg-brand-50 hover:text-brand-900'>
                  Evidence methodology
                </Link>
              </div>
              <div className='mt-6 flex w-full max-w-sm flex-col'>
                <Link
                  href='#choose-a-path'
                  className='rounded-full border border-brand-900/15 bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-800 focus:outline-none text-center'
                >
                  Choose your goal
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* High-intent guides */}
        <section className='space-y-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <SectionHeader
              title='Popular evidence guides'
              subtitle='Start with the most common supplement decisions, then move into goals, comparisons, and profiles.'
              as='h2'
            />
            <Link href='/guides' className='text-sm font-bold text-brand-700 transition hover:text-brand-800 shrink-0'>
              View all guides →
            </Link>
          </div>

          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {popularGuides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className='group flex min-h-40 flex-col justify-between rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-700/20 hover:shadow-md dark:border-[var(--border-strong)] dark:bg-[var(--surface-card)]'
              >
                <div>
                  <h3 className='text-lg font-bold tracking-tight text-ink group-hover:text-brand-800'>{guide.title}</h3>
                  <p className='mt-3 text-sm font-medium leading-6 text-muted'>{guide.description}</p>
                </div>
                <span className='mt-5 text-sm font-bold text-brand-700 transition group-hover:translate-x-1 group-hover:text-brand-800'>
                  Read guide <span aria-hidden='true'>→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Comparisons and tools */}
        <section className='grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm sm:p-6 dark:border-[var(--border-strong)] dark:bg-[var(--surface-card)]'>
            <SectionHeader
              title='Compare before you choose'
              subtitle='Side-by-side pages help answer the high-intent questions people search before buying or stacking.'
              as='h2'
            />
            <div className='mt-5 grid gap-2 sm:grid-cols-2'>
              {comparisonLinks.map((comparison) => (
                <Link
                  key={comparison.href}
                  href={comparison.href}
                  className='rounded-[0.75rem] border border-brand-900/10 bg-brand-50/40 px-4 py-3 text-sm font-bold text-brand-800 transition hover:border-brand-700/20 hover:bg-brand-50 dark:bg-[var(--surface-subtle)]'
                >
                  {comparison.title} →
                </Link>
              ))}
            </div>
            <Link href='/compare' className='mt-5 inline-flex text-sm font-bold text-brand-700 transition hover:text-brand-800'>
              Browse all comparisons →
            </Link>
          </div>

          <div className='rounded-[1rem] border border-emerald-800/15 bg-emerald-50/70 p-5 shadow-sm sm:p-6 dark:border-[var(--border-strong)] dark:bg-[var(--surface-card)]'>
            <SectionHeader
              title='Use the safety tools'
              subtitle='The fastest win is avoiding mismatched products, risky stacks, and unclear supplement forms.'
              as='h2'
            />
            <div className='mt-5 space-y-3'>
              {toolLinks.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className='block rounded-[0.75rem] border border-emerald-900/10 bg-white/80 p-4 transition hover:border-emerald-700/20 hover:bg-white dark:bg-[var(--surface-subtle)]'
                >
                  <h3 className='text-sm font-bold text-ink'>{tool.title}</h3>
                  <p className='mt-1 text-sm leading-6 text-muted'>{tool.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Goal Pathways */}
        <section id='choose-a-path' className='scroll-mt-24 space-y-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <SectionHeader
              title='Choose one path'
              subtitle='Most visitors should start here. Pick the outcome you care about, then compare options inside that guide.'
              as='h2'
            />
            <Link href='/goals' className='text-sm font-bold text-brand-700 transition hover:text-brand-800 shrink-0'>
              View all goals →
            </Link>
          </div>

          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {heroGoals.map((hGoal) => (
                <Link
                  key={hGoal.slug}
                  href={`/goals/${hGoal.slug}`}
                  className={`group flex min-h-44 flex-col justify-between rounded-[1rem] border ${hGoal.bg} p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-[var(--border-strong)] dark:bg-[var(--surface-card)]`}
                >
                  <div>
                    <h3 className={`text-2xl font-bold tracking-tight ${hGoal.accent} dark:text-[var(--text-primary)]`}>
                      {hGoal.title}
                    </h3>
                    <p className='mt-3 text-sm font-medium leading-6 text-[#405047] dark:text-[var(--text-secondary)]'>{hGoal.prompt}</p>
                  </div>
                  <span className='mt-5 inline-flex text-sm font-bold text-brand-700 transition group-hover:translate-x-1 group-hover:text-brand-800'>
                    Start with {hGoal.title} <span aria-hidden='true' className='ml-1'>→</span>
                  </span>
                </Link>
              ))}
          </div>
        </section>

        {/* Trust */}
        <section className='rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm sm:p-6'>
          <div className='grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start'>
            <SectionHeader
              title='Why trust the guide?'
              subtitle='The site is built for cautious decisions: what has human evidence, what is only plausible, and what needs safety review before use.'
              as='h2'
            />
            <div className='grid gap-3 sm:grid-cols-3'>
              {trustSignals.map((signal) => (
                <div key={signal} className='rounded-[0.75rem] border border-brand-900/10 bg-brand-50/40 p-4 text-sm font-medium leading-6 text-ink dark:bg-[var(--surface-card)] dark:text-[var(--text-secondary)]'>
                  {signal}
                </div>
              ))}
            </div>
          </div>
          <div className='mt-5 flex flex-wrap gap-3 text-sm font-bold'>
            <Link href='/methodology' className='text-brand-700 transition hover:text-brand-800'>
              Read the evidence methodology →
            </Link>
            <Link href='/safety-checker' className='text-brand-700 transition hover:text-brand-800'>
              Check supplement safety →
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
