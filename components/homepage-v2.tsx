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

type NavCard = {
  href: string
  title: string
  description?: string
}

type SectionHeaderProps = {
  title: string
  subtitle?: string
  as?: 'h2' | 'h3'
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

function interleaveFeatured(herbs: LandingCard[], compounds: LandingCard[]) {
  const mixed: LandingCard[] = []
  const maxLength = Math.max(herbs.length, compounds.length)

  for (let index = 0; index < maxLength; index += 1) {
    if (herbs[index]) mixed.push(herbs[index])
    if (compounds[index]) mixed.push(compounds[index])
  }

  return mixed.slice(0, 6)
}

const primaryActions = [
  { label: 'Explore Herbs', href: '/herbs' },
  { label: 'Compare Supplements', href: '/compare' },
  { label: 'Search Library', href: '/search' },
]

const researchPaths: NavCard[] = [
  { title: 'Herbs', href: '/herbs' },
  { title: 'Compounds', href: '/compounds' },
  { title: 'Compare', href: '/compare' },
  { title: 'Search', href: '/search' },
  { title: 'Goals', href: '/goals' },
  { title: 'Learn', href: '/learn' },
]

const ecosystemCards: NavCard[] = [
  {
    title: 'Sleep Ecosystem',
    href: '/search?q=sleep',
    description: 'Nighttime herbs, calming compounds, timing, and safety context.',
  },
  {
    title: 'Cognition Ecosystem',
    href: '/search?q=focus',
    description: 'Focus support, stimulation tradeoffs, and mechanism clues.',
  },
  {
    title: 'Recovery Ecosystem',
    href: '/search?q=recovery',
    description: 'Training support, fatigue, adaptation, and practical fit.',
  },
  {
    title: 'Stress Ecosystem',
    href: '/search?q=stress',
    description: 'Calm support, adaptogens, interaction risk, and evidence limits.',
  },
]

const reasoningPillars = [
  {
    title: 'Evidence-aware positioning',
    description: 'Profiles separate stronger human signals from early or mechanism-only ideas.',
  },
  {
    title: 'Conservative interpretation',
    description: 'Safety context and uncertainty stay close to claims, not buried at the end.',
  },
  {
    title: 'Fit-first reasoning',
    description: 'Goal, timing, tolerance, medications, and tradeoffs matter before stacking.',
  },
]

const featuredFallbacks: LandingCard[] = [
  {
    href: '/herbs/ashwagandha',
    title: 'Ashwagandha',
    description: 'Stress support, recovery context, and realistic evidence interpretation.',
    meta: 'Herb profile',
  },
  {
    href: '/compounds/theanine',
    title: 'L-Theanine',
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

function SectionHeader({ title, subtitle, as = 'h2' }: SectionHeaderProps) {
  const HeadingTag = as

  return (
    <div className='max-w-3xl space-y-2'>
      <HeadingTag className='text-xl font-semibold tracking-tight text-emerald-50 sm:text-2xl'>
        {title}
      </HeadingTag>
      {subtitle ? <p className='text-sm leading-6 text-emerald-50/68 sm:text-base'>{subtitle}</p> : null}
    </div>
  )
}

function ActionCue({ children }: { children: React.ReactNode }) {
  return (
    <span className='inline-flex items-center gap-2 text-sm font-bold text-emerald-300 transition group-hover:translate-x-1 group-hover:text-emerald-200'>
      {children}
      <span aria-hidden='true'>→</span>
    </span>
  )
}

export default function HomepageV2({ featuredHerbs = [], featuredCompounds = [] }: HomepageV2Props) {
  const herbCards = featuredHerbs
    .map((item) => toFeaturedCard(item, 'herb'))
    .filter((item): item is LandingCard => Boolean(item))
    .slice(0, 3)

  const compoundCards = featuredCompounds
    .map((item) => toFeaturedCard(item, 'compound'))
    .filter((item): item is LandingCard => Boolean(item))
    .slice(0, 3)

  const featured = interleaveFeatured(herbCards, compoundCards)
  const visibleFeatured = featured.length > 0 ? featured : featuredFallbacks

  return (
    <main className='overflow-x-clip bg-[#04120e] text-emerald-50'>
      <div className='relative isolate'>
        <div className='pointer-events-none absolute inset-0 opacity-80'>
          <div className='absolute left-[-7rem] top-10 h-64 w-64 rounded-full bg-emerald-500/18 blur-3xl' />
          <div className='absolute right-[-8rem] top-48 h-72 w-72 rounded-full bg-teal-300/10 blur-3xl' />
          <div className='absolute bottom-28 left-1/3 h-80 w-80 rounded-full bg-lime-300/8 blur-3xl' />
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_32rem)]' />
        </div>

        <div className='relative mx-auto max-w-6xl space-y-8 px-4 pb-24 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8'>
          <section className='rounded-[1.75rem] border border-emerald-300/15 bg-white/[0.035] px-4 py-7 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur sm:px-8 sm:py-10 lg:px-10'>
            <div className='mx-auto flex max-w-4xl flex-col items-center text-center'>
              <div className='mb-4 inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/8 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200'>
                Botanical research field guide
              </div>

              <h1 className='font-display text-[2.85rem] font-semibold leading-[0.95] tracking-[-0.06em] text-white sm:text-7xl md:text-8xl'>
                <span className='block'>The Hippie</span>
                <span className='block text-emerald-200'>Scientist</span>
              </h1>

              <p className='mt-5 max-w-2xl text-base leading-7 text-emerald-50/82 sm:text-lg'>
                A field guide to herbs, compounds, mechanisms, and evidence — written for careful explorers.
              </p>

              <p className='mt-2 max-w-2xl text-sm leading-6 text-emerald-50/62'>
                No hype. No pseudo-medicine. Just evidence-aware research and honest interpretation.
              </p>

              <div className='mt-6 grid w-full max-w-2xl gap-2 sm:grid-cols-3'>
                {primaryActions.map((action, index) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={index === 0
                      ? 'rounded-full bg-emerald-300 px-4 py-3 text-sm font-black text-[#062018] shadow-[0_12px_35px_rgba(16,185,129,0.22)] transition hover:-translate-y-0.5 hover:bg-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#04120e]'
                      : 'rounded-full border border-emerald-200/20 bg-white/[0.045] px-4 py-3 text-sm font-bold text-emerald-50 transition hover:-translate-y-0.5 hover:border-emerald-200/40 hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#04120e]'
                    }
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className='rounded-[1.35rem] border border-emerald-300/12 bg-[#071a14]/88 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.22)] sm:p-5'>
            <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
              <SectionHeader title='Start your research' as='h2' />
              <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:min-w-[28rem]'>
                {researchPaths.map((path) => (
                  <Link
                    key={path.href}
                    href={path.href}
                    className='group rounded-full border border-emerald-300/14 bg-white/[0.04] px-3 py-2.5 text-center text-sm font-bold text-emerald-50 transition hover:border-emerald-300/40 hover:bg-emerald-300/10'
                  >
                    {path.title}
                    <span className='ml-1 text-emerald-300 transition group-hover:translate-x-0.5' aria-hidden='true'>→</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className='space-y-4'>
            <SectionHeader
              title='Explore research ecosystems'
              subtitle='Start from a goal, then move into herbs, compounds, mechanisms, comparisons, and safety context.'
              as='h2'
            />

            <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-4'>
              {ecosystemCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className='group rounded-[1.25rem] border border-emerald-300/12 bg-white/[0.045] p-4 transition hover:-translate-y-0.5 hover:border-emerald-300/35 hover:bg-white/[0.07]'
                >
                  <h3 className='text-base font-semibold tracking-tight text-white group-hover:text-emerald-200'>{card.title}</h3>
                  <p className='mt-2 text-sm leading-6 text-emerald-50/62'>{card.description}</p>
                  <div className='mt-3'>
                    <ActionCue>Open path</ActionCue>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className='space-y-4'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
              <SectionHeader
                title='Featured profiles'
                subtitle='Useful starting points for deeper herb and compound research.'
                as='h2'
              />
              <div className='flex flex-wrap gap-3 text-sm font-bold'>
                <Link href='/herbs' className='text-emerald-300 transition hover:text-emerald-200'>Herb library →</Link>
                <Link href='/compounds' className='text-emerald-300 transition hover:text-emerald-200'>Compound library →</Link>
              </div>
            </div>

            <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
              {visibleFeatured.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='group relative overflow-hidden rounded-[1.25rem] border border-emerald-300/12 bg-[#071a14]/82 p-4 transition hover:-translate-y-0.5 hover:border-emerald-300/35 hover:bg-[#0a2119]'
                >
                  <div className='absolute right-[-3rem] top-[-3rem] h-28 w-28 rounded-full bg-emerald-300/10 blur-2xl transition group-hover:bg-emerald-300/16' />
                  <div className='relative'>
                    <span className='inline-flex rounded-full border border-emerald-300/16 bg-emerald-300/8 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-200'>
                      {item.meta}
                    </span>

                    <h3 className='mt-3 text-xl font-semibold tracking-tight text-white group-hover:text-emerald-200'>
                      {item.title}
                    </h3>

                    <p className='mt-2 text-sm leading-6 text-emerald-50/64'>
                      {item.description}
                    </p>

                    <div className='mt-4'>
                      <ActionCue>Open profile</ActionCue>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className='grid gap-3 md:grid-cols-3'>
            {reasoningPillars.map((pillar) => (
              <div key={pillar.title} className='rounded-[1.15rem] border border-emerald-300/12 bg-white/[0.035] p-4'>
                <h3 className='text-base font-semibold tracking-tight text-white'>{pillar.title}</h3>
                <p className='mt-2 text-sm leading-6 text-emerald-50/62'>{pillar.description}</p>
              </div>
            ))}
          </section>

          <section className='rounded-[1.15rem] border border-emerald-300/14 bg-emerald-950/40 p-4'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <p className='text-sm leading-6 text-emerald-50/72'>
                Natural does not automatically mean safe or effective. These pages support comparison and pathway understanding — not medical care.
              </p>
              <Link href='/disclaimer' className='shrink-0 text-sm font-bold text-emerald-300 transition hover:text-emerald-200'>
                Read disclaimer →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
