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
  { label: 'Browse herb profiles', href: '/herbs' },
  { label: 'Compare options', href: '/compare' },
  { label: 'Search evidence notes', href: '/search' },
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
    title: 'Scan the signal',
    description: 'Start with use, evidence level, safety context, and stimulation profile before reading deeply.',
  },
  {
    title: 'Check the boundary',
    description: 'Human evidence, mechanism clues, and uncertainty are kept separate so claims stay conservative.',
  },
  {
    title: 'Decide what fits',
    description: 'Compare timing, tolerance, medications, and tradeoffs before thinking about stacks.',
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
      <HeadingTag className='text-xl font-semibold tracking-tight text-ink sm:text-2xl'>
        {title}
      </HeadingTag>
      {subtitle ? <p className='text-sm leading-6 text-muted sm:text-base'>{subtitle}</p> : null}
    </div>
  )
}

function ActionCue({ children }: { children: React.ReactNode }) {
  return (
    <span className='inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition group-hover:translate-x-1 group-hover:text-brand-800'>
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
    <main className='overflow-x-clip bg-site-bg'>
      <div className='mx-auto max-w-6xl space-y-10 px-4 pb-14 pt-8 sm:px-6 sm:space-y-14 sm:pb-18 sm:pt-12 lg:px-8'>
        <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 px-4 py-6 shadow-sm sm:px-8 sm:py-10 lg:py-14'>
          <div className='mx-auto flex max-w-4xl flex-col items-center text-center'>
            <div className='mb-4 inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-brand-700'>
              Evidence-aware botanical research
            </div>

            <h1 className='font-display text-[2.65rem] font-semibold leading-[0.96] tracking-[-0.055em] text-ink sm:text-6xl md:text-7xl'>
              <span className='block'>The Hippie Scientist</span>
            </h1>

            <p className='mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg'>
              Compare herbs and compounds with evidence strength, mechanism context, and safety tradeoffs presented in a clear, practical format.
            </p>

            <p className='mt-2 max-w-2xl text-sm leading-6 text-muted'>
              Use these profiles to orient decisions thoughtfully — and remember that results vary between individuals.
            </p>

            <div className='mt-5 grid w-full max-w-2xl gap-2 sm:grid-cols-3'>
              {primaryActions.map((action, index) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={index === 0
                    ? 'rounded-full border border-brand-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-brand-900/25 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 focus-visible:ring-offset-2 focus-visible:ring-offset-site-bg'
                    : 'rounded-full border border-brand-900/10 bg-white/90 px-4 py-2.5 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-brand-900/20 hover:bg-brand-50/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 focus-visible:ring-offset-2 focus-visible:ring-offset-site-bg'
                  }
                >
                  {action.label}
                </Link>
              ))}
            </div>

            <div className='mt-6 grid w-full max-w-3xl gap-3 pt-1 text-left sm:grid-cols-3'>
              {reasoningPillars.map((pillar) => (
                <div key={pillar.title} className='rounded-2xl border border-brand-900/10 bg-white/90 p-3.5 sm:p-4'>
                  <p className='text-sm font-semibold tracking-tight text-ink'>{pillar.title}</p>
                  <p className='mt-1 text-xs leading-5 text-muted'>{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className='rounded-2xl border border-brand-900/10 bg-white/90 p-4 sm:p-6'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <SectionHeader title='Start your research' as='h2' />
            <div className='grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2 md:min-w-[28rem]'>
              {researchPaths.map((path) => (
                <Link
                  key={path.href}
                  href={path.href}
                  className='group rounded-full border border-brand-900/10 bg-white px-3 py-2 text-center text-sm font-semibold text-ink transition hover:border-brand-900/20 hover:bg-brand-50'
                >
                  {path.title}
                  <span className='ml-1 text-brand-700 transition group-hover:translate-x-0.5' aria-hidden='true'>→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className='space-y-3 sm:space-y-4'>
          <SectionHeader
            title='Explore by practical context'
            subtitle='Choose a goal first, then move into profiles, mechanisms, comparisons, and safety notes.'
            as='h2'
          />

          <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-4'>
            {ecosystemCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className='group rounded-2xl border border-brand-900/10 bg-white/90 p-4 transition hover:border-brand-900/20 hover:bg-white'
              >
                <h3 className='text-base font-semibold tracking-tight text-ink'>{card.title}</h3>
                <p className='mt-2 text-sm leading-6 text-muted'>{card.description}</p>
                <div className='mt-3'>
                  <ActionCue>Open path</ActionCue>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className='space-y-3 sm:space-y-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <SectionHeader
              title='Featured profiles'
              subtitle='Quick entry points with evidence, safety, and mechanism context.'
              as='h2'
            />
            <div className='flex flex-wrap gap-3 text-sm font-semibold'>
              <Link href='/herbs' className='text-brand-700 transition hover:text-brand-800'>Herb library →</Link>
              <Link href='/compounds' className='text-brand-700 transition hover:text-brand-800'>Compound library →</Link>
            </div>
          </div>

          <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
            {visibleFeatured.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='group rounded-2xl border border-brand-900/10 bg-white/90 p-4 transition hover:border-brand-900/20 hover:bg-white'
              >
                <div className='relative'>
                  <span className='inline-flex text-xs font-semibold uppercase tracking-[0.16em] text-brand-700'>
                    {item.meta}
                  </span>

                  <h3 className='mt-3 text-xl font-semibold tracking-tight text-ink'>
                    {item.title}
                  </h3>

                  <p className='mt-2 text-sm leading-6 text-muted'>
                    {item.description}
                  </p>

                  <div className='mt-3'>
                    <ActionCue>Open profile</ActionCue>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className='rounded-2xl border border-amber-300/70 bg-amber-50/90 p-4 sm:p-5'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-sm leading-6 text-amber-900/80'>
              Natural does not automatically mean safe or effective. These pages support comparison and pathway understanding — not medical care.
            </p>
            <Link href='/disclaimer' className='shrink-0 text-sm font-semibold text-amber-900 transition hover:text-amber-950'>
              Read disclaimer →
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
