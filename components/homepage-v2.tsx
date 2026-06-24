import Link from 'next/link'
import { getHomepageFreshness } from '@/lib/freshness'

type SectionHeaderProps = { title: string; subtitle?: string; as?: 'h2' | 'h3' }

const heroGoals = [
  {
    slug: 'sleep',
    title: 'Sleep',
    icon: '🌙',
    prompt: 'Fall asleep, stay asleep, and compare sleep supplements without guessing.',
    bg: 'from-[#eaf2fb] to-[#dceef8] border-[#a8c8e0]',
    accent: 'text-[#1a3d5c]',
  },
  {
    slug: 'stress',
    title: 'Stress',
    icon: '🌿',
    prompt: 'Sort adaptogens and calming supports by fatigue pattern, timing, and safety.',
    bg: 'from-[#edf6ee] to-[#ddf0df] border-[#8dc49a]',
    accent: 'text-[#1e4a2c]',
  },
  {
    slug: 'anxiety',
    title: 'Anxiety',
    icon: '☁️',
    prompt: 'Find grounded options for calm, overthinking, and daytime tension.',
    bg: 'from-[#f3eefc] to-[#ebe2f8] border-[#c4aadf]',
    accent: 'text-[#4a2d6e]',
  },
  {
    slug: 'focus',
    title: 'Focus',
    icon: '⚡',
    prompt: 'Compare non-stimulant focus supports and caffeine-adjacent options.',
    bg: 'from-[#fdf5e6] to-[#f9ecce] border-[#d4aa62]',
    accent: 'text-[#5c3f0e]',
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
    <div className='overflow-x-clip bg-[var(--bg)]'>
      <div className='mx-auto max-w-6xl space-y-8 px-4 pb-12 pt-4 sm:px-6 sm:space-y-10 sm:pb-16 sm:pt-6 lg:px-8'>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className='relative overflow-hidden rounded-[1.5rem] border border-brand-900/10 bg-gradient-to-br from-white via-[#fafdf6] to-[#f2f8ed] px-6 py-10 shadow-md sm:px-10 sm:py-16 dark:from-[#1a3028] dark:via-[#162a20] dark:to-[#0f2419]'>
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
                  className={`group flex min-h-48 flex-col justify-between rounded-[1.25rem] border bg-gradient-to-br ${hGoal.bg} p-5 shadow-sm transition-all duration-300 motion-safe:hover:-translate-y-1 hover:shadow-lg dark:border-[var(--border-strong)] dark:bg-[var(--surface-card)] dark:from-[var(--surface-card)] dark:to-[var(--surface-card)]`}
                >
                  <div>
                    <span className='mb-3 block text-2xl' aria-hidden='true'>{hGoal.icon}</span>
                    <h3 className={`text-2xl font-bold tracking-tight ${hGoal.accent} dark:text-[var(--text-primary)]`}>
                      {hGoal.title}
                    </h3>
                    <p className='mt-3 text-sm font-medium leading-6 text-prose-soft dark:text-[var(--text-secondary)]'>{hGoal.prompt}</p>
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
                <div key={signal.n} className='flex gap-4 rounded-[0.85rem] border border-brand-900/10 bg-white/60 p-4 dark:bg-[var(--surface-card)] dark:text-[var(--text-secondary)]'>
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
