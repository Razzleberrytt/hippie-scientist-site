'use client'

import Link from 'next/link'
import { cleanSummary, formatDisplayLabel, isClean } from '@/lib/display-utils'
import { homepageMessaging } from '@/lib/homepage-messaging'

type RuntimeFeature = Record<string, unknown>

type HomepageV2Props = {
  featuredHerbs?: RuntimeFeature[]
  featuredCompounds?: RuntimeFeature[]
}

type LandingCard = {
  href: string
  title: string
  description: string
  meta: string
}

function getFeatureName(item: RuntimeFeature) {
  return formatDisplayLabel(item.displayName) || formatDisplayLabel(item.name) || formatDisplayLabel(item.slug)
}

function getFeatureDescription(item: RuntimeFeature, type: 'herb' | 'compound') {
  return cleanSummary(
    item.short_earthy_summary || item.summary || item.description,
    type
  )
}

function toFeaturedCard(item: RuntimeFeature, type: 'herb' | 'compound'): LandingCard | null {
  const title = getFeatureName(item)
  const slug = typeof item.slug === 'string' ? item.slug : ''

  if (!slug || !isClean(title)) return null

  return {
    href: `/${type === 'herb' ? 'herbs' : 'compounds'}/${slug}`,
    title,
    description: getFeatureDescription(item, type),
    meta: type === 'herb' ? 'Herb profile' : 'Compound profile',
  }
}

const primaryActions = [
  { label: 'Explore Herbs', href: '/herbs' },
  { label: 'Browse Compounds', href: '/compounds' },
  { label: 'Compare Supplements', href: '/compare' },
]

const trustCards = [
  {
    title: 'Human evidence',
    description: 'Profiles distinguish stronger clinical signals from preliminary or mechanism-only research.',
  },
  {
    title: 'Safety context',
    description: 'Contraindications, interaction themes, and conservative use notes stay close to the decision.',
  },
  {
    title: 'Mechanisms',
    description: 'Botanical and compound pages connect effects to pathways without pretending biology is simple.',
  },
  {
    title: 'Practical fit',
    description: 'Use case, timing, stimulation level, and beginner complexity matter before any stack decision.',
  },
]

const goalEntries = [
  {
    title: 'Sleep support',
    href: '/goals/sleep',
    description: 'Wind-down, sleep quality, next-day grogginess, and sedative-interaction context.',
  },
  {
    title: 'Anxiety & calm',
    href: '/goals/anxiety',
    description: 'Calming compounds, adaptogens, interaction risk, and non-sedating options.',
  },
  {
    title: 'Focus & energy',
    href: '/goals/focus',
    description: 'Clean stimulation, calm focus, cognitive fatigue, and sleep-sensitive tradeoffs.',
  },
  {
    title: 'Recovery',
    href: '/goals/recovery',
    description: 'Performance support, muscle recovery, hydration, and cumulative timelines.',
  },
]

const featuredFallbacks: LandingCard[] = [
  {
    href: '/herbs/ashwagandha',
    title: 'Ashwagandha',
    description: 'Stress resilience, recovery support, and realistic evidence interpretation.',
    meta: 'Herb profile',
  },
  {
    href: '/compounds/theanine',
    title: 'Theanine',
    description: 'Calm focus, relaxation pathways, and non-sedating support context.',
    meta: 'Compound profile',
  },
  {
    href: '/compounds/creatine',
    title: 'Creatine',
    description: 'Performance, recovery, energy buffering, and cognitive support research.',
    meta: 'Compound profile',
  },
]

function ActionCue({ children }: { children: React.ReactNode }) {
  return (
    <span className='inline-flex items-center gap-2 text-sm font-bold text-brand-800 transition group-hover:translate-x-1'>
      {children}
      <span aria-hidden='true'>→</span>
    </span>
  )
}

export default function HomepageV2({ featuredHerbs = [], featuredCompounds = [] }: HomepageV2Props) {
  const featured = [
    ...featuredHerbs.map((item) => toFeaturedCard(item, 'herb')),
    ...featuredCompounds.map((item) => toFeaturedCard(item, 'compound')),
  ].filter((item): item is LandingCard => Boolean(item)).slice(0, 3)

  const visibleFeatured = featured.length > 0 ? featured : featuredFallbacks

  return (
    <main className='min-h-screen px-4 py-5 text-ink sm:py-8'>
      <div className='mx-auto max-w-7xl space-y-16 sm:space-y-24'>
        <section className='hero-shell relative overflow-hidden rounded-[2rem] border border-white/50 px-5 py-12 shadow-soft sm:rounded-[2.75rem] sm:px-10 sm:py-16 lg:px-14 lg:py-20'>
          <div className='absolute left-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl' />
          <div className='absolute bottom-[-10rem] right-[-8rem] h-96 w-96 rounded-full bg-amber-200/30 blur-3xl' />

          <div className='relative grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center'>
            <div className='max-w-4xl space-y-7'>
              <div className='inline-flex rounded-full border border-brand-700/10 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-800 backdrop-blur-md'>
                Evidence-aware supplement research
              </div>

              <div className='space-y-5'>
                <h1 className='text-balance font-display text-5xl font-semibold leading-[0.96] tracking-tight text-ink sm:text-6xl lg:text-7xl'>
                  {homepageMessaging.heroHeadline}
                </h1>

                <p className='max-w-2xl text-lg leading-8 text-[#46574d] sm:text-xl'>
                  {homepageMessaging.heroSubhead}
                </p>
              </div>

              <div className='grid gap-3 sm:grid-cols-3'>
                {primaryActions.map((action, index) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={index === 0
                      ? 'button-primary justify-center text-center'
                      : 'button-secondary justify-center text-center'
                    }
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className='rounded-[2rem] border border-brand-900/10 bg-white/70 p-4 shadow-card backdrop-blur sm:p-5'>
              <div className='rounded-[1.5rem] bg-gradient-to-br from-[#fbfaf6] via-white to-[#eef6ee] p-5 sm:p-7'>
                <div className='space-y-5'>
                  <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-800'>Research product, not wellness hype</p>
                  <h2 className='text-3xl font-semibold tracking-tight text-ink sm:text-4xl'>Make supplement decisions from evidence, safety, and fit.</h2>
                  <p className='text-sm leading-7 text-[#46574d]'>
                    Move from a goal to mechanisms, profile pages, and comparisons with the limits of the evidence kept visible.
                  </p>
                </div>

                <div className='mt-8 grid gap-3 sm:grid-cols-2'>
                  {['Clinical signal', 'Interaction context', 'Mechanism map', 'Practical timeline'].map((item) => (
                    <div key={item} className='rounded-2xl border border-brand-900/10 bg-white/75 p-4 text-sm font-semibold text-[#33443a]'>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          {trustCards.map((card) => (
            <div key={card.title} className='rounded-[1.75rem] border border-brand-900/10 bg-white/75 p-6 shadow-card transition hover:-translate-y-1 hover:border-brand-700/20 hover:bg-white'>
              <h2 className='text-xl font-semibold tracking-tight text-ink'>{card.title}</h2>
              <p className='mt-3 text-sm leading-7 text-[#46574d]'>{card.description}</p>
            </div>
          ))}
        </section>

        <section className='rounded-[2.25rem] border border-brand-900/10 bg-gradient-to-br from-white/85 via-[#faf8f1] to-brand-50/40 p-6 shadow-soft sm:p-10'>
          <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
            <div className='max-w-2xl space-y-3'>
              <p className='eyebrow-label'>Start by goal</p>
              <h2 className='compact-heading'>Begin with the outcome, then narrow by evidence and safety.</h2>
            </div>
            <Link href='/goals' className='text-sm font-bold text-brand-800 transition hover:text-brand-900'>All goals →</Link>
          </div>

          <div className='mt-8 grid gap-4 md:grid-cols-2'>
            {goalEntries.map((goal) => (
              <Link key={goal.href} href={goal.href} className='group rounded-[1.5rem] border border-brand-900/10 bg-white/75 p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-700/20 hover:bg-white'>
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <h3 className='text-xl font-semibold tracking-tight text-ink group-hover:text-brand-800'>{goal.title}</h3>
                    <p className='mt-3 text-sm leading-7 text-[#46574d]'>{goal.description}</p>
                  </div>
                  <span className='mt-1 text-brand-800 transition group-hover:translate-x-1' aria-hidden='true'>→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className='space-y-8'>
          <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
            <div className='max-w-2xl space-y-3'>
              <p className='eyebrow-label'>Featured profiles</p>
              <h2 className='compact-heading'>Useful starting points for deeper research.</h2>
            </div>
            <div className='flex flex-wrap gap-3'>
              <Link href='/herbs' className='text-sm font-bold text-brand-800 transition hover:text-brand-900'>Herb library →</Link>
              <Link href='/compounds' className='text-sm font-bold text-brand-800 transition hover:text-brand-900'>Compound library →</Link>
            </div>
          </div>

          <div className='grid gap-5 lg:grid-cols-3'>
            {visibleFeatured.map((item) => (
              <Link key={item.href} href={item.href} className='group relative overflow-hidden rounded-[2rem] border border-brand-900/10 bg-gradient-to-br from-white via-[#fbfaf6] to-brand-50/30 p-6 shadow-card transition hover:-translate-y-1 hover:border-brand-700/20 hover:bg-white'>
                <div className='absolute right-[-3rem] top-[-3rem] h-32 w-32 rounded-full bg-brand-100/40 blur-2xl transition group-hover:bg-brand-100/60' />
                <div className='relative'>
                  <span className='inline-flex rounded-full border border-brand-900/10 bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#5f6f66]'>
                    {item.meta}
                  </span>

                  <h3 className='mt-5 text-2xl font-semibold tracking-tight text-ink group-hover:text-brand-800'>
                    {item.title}
                  </h3>

                  <p className='mt-3 text-sm leading-7 text-[#46574d]'>
                    {item.description}
                  </p>

                  <div className='mt-6'>
                    <ActionCue>Open profile</ActionCue>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className='rounded-[2.25rem] border border-brand-900/10 bg-white/75 p-6 shadow-soft sm:p-10'>
          <div className='grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center'>
            <div className='space-y-3'>
              <p className='eyebrow-label'>Compare before you stack</p>
              <h2 className='compact-heading'>Similar supplements can have very different tradeoffs.</h2>
              <p className='text-sm leading-7 text-[#46574d]'>
                Use comparison pages to separate acute effects from cumulative support, calming from sedating, and plausible mechanisms from stronger human data.
              </p>
            </div>

            <div className='grid gap-3 sm:grid-cols-2'>
              {[
                { label: 'Rhodiola vs ashwagandha', href: '/compare/rhodiola-vs-ashwagandha' },
                { label: 'L-theanine vs magnesium', href: '/compare/l-theanine-vs-magnesium' },
                { label: 'Kava vs alcohol', href: '/compare/kava-vs-alcohol' },
                { label: 'Kanna vs SSRIs', href: '/compare/kanna-vs-ssris' },
              ].map((item) => (
                <Link key={item.href} href={item.href} className='group rounded-2xl border border-brand-900/10 bg-[#fbfaf6] p-4 text-sm font-semibold text-[#33443a] transition hover:-translate-y-1 hover:border-brand-700/20 hover:bg-white'>
                  {item.label}
                  <span className='ml-2 text-brand-800 transition group-hover:translate-x-1' aria-hidden='true'>→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className='rounded-[2rem] border border-amber-700/15 bg-gradient-to-br from-amber-50/80 via-white to-[#fbfaf6] p-6 shadow-sm sm:p-8'>
          <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
            <div className='max-w-3xl space-y-3'>
              <p className='eyebrow-label text-amber-700'>Safety note</p>
              <h2 className='text-2xl font-semibold tracking-tight text-amber-950 sm:text-3xl'>Natural does not automatically mean safe or effective.</h2>
              <p className='text-sm leading-7 text-amber-950/80 sm:text-base'>
                The Hippie Scientist is educational research support. It does not diagnose, treat, or replace medical care—especially for pregnancy, medications, chronic conditions, or complex mental health concerns.
              </p>
            </div>

            <Link href='/disclaimer' className='button-secondary whitespace-nowrap text-center'>
              Read disclaimer
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
