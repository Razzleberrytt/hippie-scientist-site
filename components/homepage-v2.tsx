'use client'

import Link from 'next/link'
import { cleanSummary, formatDisplayLabel, isClean } from '@/lib/display-utils'

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

type EcosystemCard = {
  href: string
  title: string
  description: string
  accent: string
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
  { label: 'Compare Supplements', href: '/compare' },
  { label: 'Search Library', href: '/search' },
]

const ecosystemCards: EcosystemCard[] = [
  {
    title: 'Sleep Ecosystem',
    href: '/search?q=sleep',
    description: 'Wind-down herbs, sedating compounds, sleep quality signals, and interaction context.',
    accent: 'from-indigo-300/18 to-emerald-300/10',
  },
  {
    title: 'Cognition Ecosystem',
    href: '/search?q=focus',
    description: 'Calm focus, stimulation tradeoffs, fatigue context, and mechanism-aware comparisons.',
    accent: 'from-cyan-300/18 to-emerald-300/10',
  },
  {
    title: 'Recovery Ecosystem',
    href: '/search?q=recovery',
    description: 'Adaptation, soreness, performance support, and realistic cumulative timelines.',
    accent: 'from-amber-300/16 to-emerald-300/10',
  },
  {
    title: 'Stress Ecosystem',
    href: '/search?q=stress',
    description: 'Adaptogens, calming pathways, cortisol-adjacent claims, and conservative safety notes.',
    accent: 'from-emerald-300/18 to-lime-300/10',
  },
]

const reasoningPillars = [
  {
    title: 'Evidence-aware positioning',
    description: 'Profiles separate human signals, mechanistic plausibility, and traditional context instead of flattening them into hype.',
  },
  {
    title: 'Conservative interpretation',
    description: 'Safety notes, contraindications, and uncertainty stay visible because biology rarely behaves like a marketing claim.',
  },
  {
    title: 'Fit-first reasoning',
    description: 'Goal, timing, stimulation level, medication context, and personal sensitivity come before stacking complexity.',
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
    title: 'L-Theanine',
    description: 'Calm focus, relaxation pathways, and non-sedating support context.',
    meta: 'Compound profile',
  },
  {
    href: '/herbs/rhodiola',
    title: 'Rhodiola',
    description: 'Fatigue, stress adaptation, stimulation potential, and fit-dependent tradeoffs.',
    meta: 'Herb profile',
  },
]

function FieldGuideLink({ children }: { children: React.ReactNode }) {
  return (
    <span className='inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 transition group-hover:translate-x-1 group-hover:text-emerald-100'>
      {children}
      <span aria-hidden='true'>→</span>
    </span>
  )
}

export default function HomepageV2({ featuredHerbs = [], featuredCompounds = [] }: HomepageV2Props) {
  const featured = [
    ...featuredHerbs.map((item) => toFeaturedCard(item, 'herb')),
    ...featuredCompounds.map((item) => toFeaturedCard(item, 'compound')),
  ].filter((item): item is LandingCard => Boolean(item)).slice(0, 6)

  const visibleFeatured = featured.length > 0 ? featured : featuredFallbacks

  return (
    <div className='-mx-4 -my-8 overflow-hidden bg-[#07110d] text-emerald-50 sm:-mx-6 sm:-my-10 lg:-mx-8'>
      <div className='relative isolate'>
        <div className='pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.16),transparent_32%),linear-gradient(180deg,#07110d_0%,#0a1611_42%,#07110d_100%)]' />
        <div className='pointer-events-none absolute left-[-7rem] top-16 -z-10 h-64 w-64 rounded-full bg-emerald-400/12 blur-3xl sm:h-80 sm:w-80' />
        <div className='pointer-events-none absolute right-[-9rem] top-80 -z-10 h-72 w-72 rounded-full bg-lime-300/10 blur-3xl sm:h-96 sm:w-96' />
        <div className='pointer-events-none absolute bottom-28 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-teal-300/10 blur-3xl sm:h-96 sm:w-96' />

        <div className='mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pb-28 sm:pt-10 lg:px-8'>
          <section className='mx-auto flex max-w-5xl flex-col items-center py-9 text-center sm:py-14 lg:py-16'>
            <div className='mb-5 inline-flex rounded-full border border-emerald-300/15 bg-emerald-300/8 px-3.5 py-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-emerald-100/90 shadow-[0_0_40px_rgba(16,185,129,0.08)] backdrop-blur-md'>
              Botanical research field guide
            </div>

            <h1 className='max-w-none font-display text-[3.4rem] font-semibold uppercase leading-[0.84] tracking-[-0.055em] text-[#f4fff8] drop-shadow-[0_0_34px_rgba(16,185,129,0.18)] sm:text-[5.2rem] md:text-[6.4rem] lg:text-[7.4rem]'>
              <span className='block'>The Hippie</span>
              <span className='block text-emerald-100'>Scientist</span>
            </h1>

            <p className='mt-7 max-w-2xl text-base leading-7 !text-emerald-50 sm:text-lg sm:leading-8'>
              A field guide to herbs, compounds, mechanisms, and evidence — written for careful explorers.
            </p>

            <p className='mt-3 max-w-2xl text-sm leading-6 !text-emerald-100 sm:text-base'>
              No hype. No pseudo-medicine. Just evidence-aware research and honest interpretation.
            </p>

            <div className='mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-3'>
              {primaryActions.map((action, index) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={index === 0
                    ? 'inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-bold text-[#06120d] shadow-[0_18px_50px_rgba(16,185,129,0.24)] transition hover:-translate-y-0.5 hover:bg-emerald-300 hover:text-[#06120d] focus-visible:text-[#06120d]'
                    : 'inline-flex items-center justify-center rounded-full border border-emerald-200/18 bg-white/[0.04] px-5 py-3 text-sm font-bold text-emerald-50 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-emerald-200/32 hover:bg-white/[0.08] hover:text-emerald-100'
                  }
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </section>

          <section className='rounded-[1.75rem] border border-emerald-200/10 bg-white/[0.035] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-6 lg:p-8'>
            <div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
              <div className='max-w-2xl'>
                <p className='text-[0.7rem] font-bold uppercase tracking-[0.18em] text-emerald-300/80'>Explore research ecosystems</p>
                <h2 className='mt-3 max-w-none text-2xl font-semibold tracking-tight text-emerald-50 sm:text-3xl'>Start broad, then follow the evidence trail.</h2>
                <p className='mt-3 max-w-3xl text-sm leading-7 !text-emerald-100 sm:text-base'>
                  Start from a goal, then move into herbs, compounds, mechanisms, comparisons, and safety context.
                </p>
              </div>
              <Link href='/search' className='text-sm font-semibold text-emerald-200 hover:text-emerald-100'>Search all topics →</Link>
            </div>

            <div className='mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              {ecosystemCards.map((card) => (
                <Link key={card.href} href={card.href} className='group relative overflow-hidden rounded-[1.25rem] border border-emerald-200/10 bg-[#0c1a14]/78 p-4 transition hover:-translate-y-0.5 hover:border-emerald-300/30 hover:bg-[#10231a]'>
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-80 transition group-hover:opacity-100`} />
                  <div className='relative'>
                    <h3 className='max-w-none text-base font-semibold tracking-tight text-emerald-50'>{card.title}</h3>
                    <p className='mt-2 text-sm leading-6 !text-emerald-100'>{card.description}</p>
                    <div className='mt-4'>
                      <FieldGuideLink>Explore</FieldGuideLink>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className='mt-10 space-y-5 sm:mt-14'>
            <div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
              <div>
                <p className='text-[0.7rem] font-bold uppercase tracking-[0.18em] text-emerald-300/80'>Featured profiles</p>
                <h2 className='mt-3 max-w-none text-2xl font-semibold tracking-tight text-emerald-50 sm:text-3xl'>Useful starting points for deeper research.</h2>
              </div>
              <div className='flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold'>
                <Link href='/herbs' className='text-emerald-200 hover:text-emerald-100'>Herb library →</Link>
                <Link href='/compounds' className='text-emerald-200 hover:text-emerald-100'>Compound library →</Link>
              </div>
            </div>

            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {visibleFeatured.map((item) => (
                <Link key={item.href} href={item.href} className='group relative overflow-hidden rounded-[1.35rem] border border-emerald-200/10 bg-[#0b1812]/88 p-5 transition hover:-translate-y-0.5 hover:border-emerald-300/30 hover:bg-[#102018]'>
                  <div className='absolute right-[-3rem] top-[-3rem] h-28 w-28 rounded-full bg-emerald-300/10 blur-2xl transition group-hover:bg-emerald-300/16' />
                  <div className='relative'>
                    <span className='inline-flex rounded-full border border-emerald-200/12 bg-emerald-300/8 px-3 py-1 text-[0.64rem] font-bold uppercase tracking-[0.16em] text-emerald-200/86'>
                      {item.meta}
                    </span>
                    <h3 className='mt-4 max-w-none text-xl font-semibold tracking-tight text-emerald-50'>{item.title}</h3>
                    <p className='mt-2 text-sm leading-6 !text-emerald-100'>{item.description}</p>
                    <div className='mt-5'>
                      <FieldGuideLink>Open profile</FieldGuideLink>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className='mt-10 grid gap-3 sm:mt-14 lg:grid-cols-3'>
            {reasoningPillars.map((pillar) => (
              <div key={pillar.title} className='rounded-[1.35rem] border border-emerald-200/10 bg-white/[0.035] p-5 backdrop-blur-md'>
                <h2 className='max-w-none text-lg font-semibold tracking-tight text-emerald-50'>{pillar.title}</h2>
                <p className='mt-2 text-sm leading-6 !text-emerald-100'>{pillar.description}</p>
              </div>
            ))}
          </section>

          <section className='mt-10 rounded-[1.35rem] border border-amber-200/14 bg-amber-200/[0.06] p-4 sm:mt-14 sm:p-5'>
            <p className='max-w-none text-sm leading-6 !text-amber-50/78 sm:text-base'>
              <span className='font-semibold text-amber-100'>Natural does not automatically mean safe or effective.</span>{' '}
              These pages support comparison and pathway understanding — not medical care.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
