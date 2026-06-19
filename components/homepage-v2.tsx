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
