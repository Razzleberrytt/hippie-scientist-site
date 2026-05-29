import Link from 'next/link'
import { cleanSummary, formatDisplayLabel, isClean } from '@/lib/display-utils'
import { goals } from '@/data/goals'

type RuntimeFeature = Record<string, unknown>
type HomepageV2Props = { featuredHerbs?: RuntimeFeature[]; featuredCompounds?: RuntimeFeature[] }
type LandingCard = { href: string; title: string; description: string; meta: string }
type SectionHeaderProps = { title: string; subtitle?: string; as?: 'h2' | 'h3' }

function getFeatureName(item: RuntimeFeature) {
  return formatDisplayLabel(item.displayName) || formatDisplayLabel(item.name) || formatDisplayLabel(item.slug)
}

function getFeatureDescription(item: RuntimeFeature, type: 'herb' | 'compound') {
  return cleanSummary(item.short_earthy_summary || item.summary || item.description, type)
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
  for (let i = 0; i < maxLength; i++) {
    if (herbs[i]) mixed.push(herbs[i])
    if (compounds[i]) mixed.push(compounds[i])
  }
  return mixed.slice(0, 6)
}

// /compare replaced with /safety-checker (Compare page is broken/blank).
// Re-add Compare once the tool renders correctly.
const primaryActions = [
  { label: 'Goal Decision Guides', href: '/goals' },
  { label: 'Safety Interaction Checker', href: '/safety-checker' },
  { label: 'Research Notes', href: '/blog' },
]

// Fallbacks expanded to 6 curated picks instead of alphabetical accidents
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
  {
    href: '/herbs/rhodiola-rosea',
    title: 'Rhodiola Rosea',
    description: 'Adaptogenic fatigue resistance and mental performance under stress.',
    meta: 'Herb profile',
  },
  {
    href: '/herbs/lions-mane',
    title: "Lion's Mane",
    description: 'NGF stimulation, cognitive support, and neuroprotective research.',
    meta: 'Herb profile',
  },
  {
    href: '/compounds/magnesium-glycinate',
    title: 'Magnesium Glycinate',
    description: 'Sleep quality, muscle relaxation, and nervous system regulation.',
    meta: 'Compound profile',
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

function ActionCue({ children }: { children: React.ReactNode }) {
  return (
    <span className='inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition group-hover:translate-x-1 group-hover:text-brand-800'>
      {children} <span aria-hidden='true'>→</span>
    </span>
  )
}

// 'use client' removed — no hooks/state/handlers here. Enables SSR for the homepage.
// Outer <main> replaced with <div> — the single <main id="main-content"> lives only in app/layout.tsx.
export default function HomepageV2({ featuredHerbs = [], featuredCompounds = [] }: HomepageV2Props) {
  const herbCards = featuredHerbs
    .map(i => toFeaturedCard(i, 'herb'))
    .filter((i): i is LandingCard => Boolean(i))
    .slice(0, 3)
  const compoundCards = featuredCompounds
    .map(i => toFeaturedCard(i, 'compound'))
    .filter((i): i is LandingCard => Boolean(i))
    .slice(0, 3)
  const featured = interleaveFeatured(herbCards, compoundCards)
  const visibleFeatured = featured.length > 0 ? featured : featuredFallbacks

  return (
    <div className='overflow-x-clip bg-site-bg'>
      <div className='mx-auto max-w-6xl space-y-5 px-4 pb-5 pt-4 sm:px-6 sm:space-y-6 sm:pb-6 sm:pt-6 lg:px-8'>

        {/* Hero */}
        <section className='rounded-[0.95rem] border border-brand-900/10 bg-white/90 px-4 py-4 shadow-sm sm:px-5 sm:py-5'>
          <div className='mx-auto flex max-w-4xl flex-col items-center text-center'>
            <p role='doc-subtitle' className='mb-2 inline-flex text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brand-700'>
              Herbs + supplements, ranked by fit
            </p>
            <h1 className='font-display text-[2rem] font-semibold leading-[1] tracking-[-0.04em] text-ink sm:text-4xl md:text-5xl'>
              <span className='block'>The Hippie Scientist</span>
            </h1>
            <p className='mt-3 max-w-2xl text-sm font-medium leading-6 text-muted'>
              Find what fits your goal, what to avoid, and where the evidence is strongest.
            </p>
            <div className='mt-4 grid w-full max-w-2xl gap-2 sm:grid-cols-3'>
              {primaryActions.map((action, index) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={
                    index === 0
                      ? 'rounded-full border border-brand-900/15 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-brand-900/25 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 focus-visible:ring-offset-2 focus-visible:ring-offset-site-bg'
                      : 'rounded-full border border-brand-900/10 bg-white/90 px-3 py-2 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-brand-900/20 hover:bg-brand-50/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 focus-visible:ring-offset-2 focus-visible:ring-offset-site-bg'
                  }
                >
                  {action.label}
                </Link>
              ))}
            </div>

          </div>
        </section>

        {/* Goal Guides */}
        <section className='space-y-3'>
          <SectionHeader
            title='Browse by goal decision path'
            subtitle='Choose a goal and compare evidence, safety, onset, and tradeoffs.'
            as='h2'
          />
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {goals.map((goal) => (
              <Link
                key={goal.slug}
                href={`/goals/${goal.slug}`}
                className='group flex flex-col justify-between rounded-[0.85rem] border border-brand-900/10 bg-white/90 p-3 shadow-sm transition hover:border-brand-900/20 hover:bg-white'
              >
                <div>
                  <span className='text-[10px] font-bold uppercase tracking-wider text-brand-700'>{goal.eyebrow}</span>
                  <h3 className='mt-1 text-base font-bold text-ink transition group-hover:text-brand-700'>{goal.title}</h3>
                  <p className='mt-1 line-clamp-2 text-xs leading-relaxed text-muted'>{goal.description}</p>
                </div>
                <div className='mt-2 flex items-center justify-between border-t border-brand-900/5 pt-2 text-xs font-semibold text-brand-700'>
                  <span>Compare options</span>
                  <span className='transition group-hover:translate-x-1'>→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Research Clusters */}
        <section className='space-y-3'>
          <SectionHeader
            title='Specialized research clusters'
            subtitle='Comparison clusters for common decisions and safety boundaries.'
            as='h2'
          />
          <div className='grid gap-2 sm:grid-cols-3'>
            {[
              {
                href: '/natural-anxiolytics-beyond-ashwagandha',
                eyebrow: 'Anxiolytic cluster',
                title: 'Beyond Ashwagandha',
                desc: 'Compare calming options and safety tradeoffs.',
              },
              {
                href: '/sleep-herbs-vs-melatonin',
                eyebrow: 'Sleep comparison',
                title: 'Sleep Herbs vs Melatonin',
                desc: 'Contrast circadian shifting with wind-down options.',
              },
              {
                href: '/psychedelic-adjacent-herbs',
                eyebrow: 'Harm reduction',
                title: 'Psychedelic-Adjacent Herbs',
                desc: 'Review interaction boundaries and safety warnings first.',
              },
            ].map((cluster) => (
              <Link
                key={cluster.href}
                href={cluster.href}
                className='group flex flex-col justify-between rounded-[0.85rem] border border-brand-900/10 bg-white/90 p-3 shadow-sm transition hover:border-brand-900/20 hover:bg-white'
              >
                <div>
                  <span className='text-[10px] font-bold uppercase tracking-wider text-brand-700'>{cluster.eyebrow}</span>
                  <h3 className='mt-1 text-base font-bold text-ink transition group-hover:text-brand-700'>{cluster.title}</h3>
                  <p className='mt-1 text-xs leading-relaxed text-muted'>{cluster.desc}</p>
                </div>
                <span className='mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700'>
                  Open comparison <span className='transition group-hover:translate-x-1'>→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Profiles */}
        <section className='space-y-2.5 sm:space-y-3'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <SectionHeader
              title='Popular research starting points'
              subtitle='Popular profiles to compare first.'
              as='h2'
            />
            <div className='flex flex-wrap gap-3 text-sm font-semibold'>
              <Link href='/herbs' className='text-brand-700 transition hover:text-brand-800'>Herb library <span aria-hidden='true'>→</span></Link>
              <Link href='/compounds' className='text-brand-700 transition hover:text-brand-800'>Compound library <span aria-hidden='true'>→</span></Link>
            </div>
          </div>
          <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3'>
            {visibleFeatured.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-label={`View ${item.meta} for ${item.title}`}
                className='group rounded-[0.85rem] border border-brand-900/10 bg-white/90 p-3 transition hover:border-brand-900/20 hover:bg-white'
              >
                <div className='relative'>
                  <span className='inline-flex text-xs font-semibold uppercase tracking-[0.16em] text-brand-700'>{item.meta}</span>
                  <h3 className='mt-1.5 text-base font-semibold tracking-tight text-ink sm:text-lg'>{item.title}</h3>
                  <p className='mt-1 line-clamp-2 text-sm leading-5 text-muted'>{item.description}</p>
                  <div className='mt-1.5'><ActionCue>Open profile</ActionCue></div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <section className='rounded-[0.85rem] border border-amber-200/80 bg-amber-50/60 p-3'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <p className='max-w-4xl text-sm leading-6 text-amber-950/85'>
              <strong>Important Notice:</strong> Natural does not automatically mean safe or effective. Use this for comparison only. Review contraindications and ask a clinician before starting supplements.
            </p>
            <Link
              href='/disclaimer'
              className='shrink-0 whitespace-nowrap text-sm font-semibold text-amber-900/90 transition hover:text-amber-950'
            >
              Read disclaimer →
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
