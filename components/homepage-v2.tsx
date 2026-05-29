import Link from 'next/link'
import { cleanSummary, formatDisplayLabel, isClean } from '@/lib/display-utils'
import { goals } from '@/data/goals'

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
  { label: 'Goal Decision Guides', href: '/goals' },
  { label: 'Side-by-Side Compare', href: '/compare' },
  { label: 'Safety Interaction Checker', href: '/safety-checker' },
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
      <div className='mx-auto max-w-6xl space-y-8 px-4 pb-6 pt-7 sm:px-6 sm:space-y-10 sm:pb-8 sm:pt-10 lg:px-8'>
        <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 px-4 py-6 shadow-sm sm:px-7 sm:py-8 lg:py-10'>
          <div className='mx-auto flex max-w-4xl flex-col items-center text-center'>
            <p role='doc-subtitle' className='mb-4 inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-brand-700'>
              Evidence-aware botanical research
            </p>

            <h1 className='font-display text-[2.65rem] font-semibold leading-[0.96] tracking-[-0.055em] text-ink sm:text-6xl md:text-7xl'>
              <span className='block'>The Hippie Scientist</span>
            </h1>

            <p className='mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg font-medium'>
              The Hippie Scientist helps you compare herbs and compounds using evidence, safety, and practical decision filters.
            </p>

            <p className='mt-2 max-w-2xl text-sm leading-6 text-muted'>
              Use these profiles to orient decisions thoughtfully based on clinical data, not wellness hype. Individual response varies.
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

            <p className='mt-5 max-w-2xl rounded-full border border-brand-900/10 bg-white/85 px-4 py-2 text-xs leading-5 text-muted sm:text-sm'>
              Evidence strength, safety context, and uncertainty are kept visible so comparisons stay cautious.
            </p>
          </div>
        </section>

        {/* Goal Guides Section */}
        <section className='space-y-4'>
          <SectionHeader
            title='Browse by goal decision path'
            subtitle='Select your outcome to compare evidence, safety constraints, typical onset, and practical tradeoffs side-by-side.'
            as='h2'
          />
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {goals.map((goal) => (
              <Link
                key={goal.slug}
                href={`/goals/${goal.slug}`}
                className='group rounded-2xl border border-brand-900/10 bg-white/90 p-5 transition hover:border-brand-900/20 hover:bg-white shadow-sm flex flex-col justify-between'
              >
                <div>
                  <span className='text-[10px] font-bold uppercase tracking-wider text-brand-700'>
                    {goal.eyebrow}
                  </span>
                  <h3 className='mt-1 text-base font-bold text-ink group-hover:text-brand-700 transition'>
                    {goal.title.replace(' decisions', '').replace(' resilience', '')}
                  </h3>
                  <p className='mt-2 text-xs leading-relaxed text-muted line-clamp-2'>
                    {goal.description}
                  </p>
                </div>
                <div className='mt-3 pt-3 border-t border-brand-900/5 flex items-center justify-between text-xs font-semibold text-brand-700'>
                  <span>Compare options</span>
                  <span className='transition group-hover:translate-x-1'>→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Specialized Discovery Clusters */}
        <section className='space-y-4'>
          <SectionHeader
            title='Specialized research clusters'
            subtitle='Deep-dive comparison clusters addressing common search questions, active compounds, and safety boundaries.'
            as='h2'
          />
          <div className='grid gap-4 sm:grid-cols-3'>
            <Link
              href='/natural-anxiolytics-beyond-ashwagandha'
              className='group rounded-2xl border border-brand-900/10 bg-white/90 p-5 transition hover:border-brand-900/20 hover:bg-white shadow-sm flex flex-col justify-between'
            >
              <div>
                <span className='text-[10px] font-bold uppercase tracking-wider text-brand-700'>Anxiolytic cluster</span>
                <h3 className='mt-1 text-base font-bold text-ink group-hover:text-brand-700 transition'>
                  Beyond Ashwagandha
                </h3>
                <p className='mt-1.5 text-xs leading-relaxed text-muted'>
                  Compare calming botanicals like L-Theanine and Kava through structured evidence-strength profiles.
                </p>
              </div>
              <span className='mt-3 text-xs font-semibold text-brand-700 inline-flex items-center gap-1'>
                Open comparison <span className='transition group-hover:translate-x-1'>→</span>
              </span>
            </Link>

            <Link
              href='/sleep-herbs-vs-melatonin'
              className='group rounded-2xl border border-brand-900/10 bg-white/90 p-5 transition hover:border-brand-900/20 hover:bg-white shadow-sm flex flex-col justify-between'
            >
              <div>
                <span className='text-[10px] font-bold uppercase tracking-wider text-brand-700'>Sleep comparison</span>
                <h3 className='mt-1 text-base font-bold text-ink group-hover:text-brand-700 transition'>
                  Sleep Herbs vs Melatonin
                </h3>
                <p className='mt-1.5 text-xs leading-relaxed text-muted'>
                  Contrast hormone-based circadian shifting against natural relaxation and muscle wind-down options.
                </p>
              </div>
              <span className='mt-3 text-xs font-semibold text-brand-700 inline-flex items-center gap-1'>
                Open comparison <span className='transition group-hover:translate-x-1'>→</span>
              </span>
            </Link>

            <Link
              href='/psychedelic-adjacent-herbs'
              className='group rounded-2xl border border-brand-900/10 bg-white/90 p-5 transition hover:border-brand-900/20 hover:bg-white shadow-sm flex flex-col justify-between'
            >
              <div>
                <span className='text-[10px] font-bold uppercase tracking-wider text-brand-700'>Harm reduction</span>
                <h3 className='mt-1 text-base font-bold text-ink group-hover:text-brand-700 transition'>
                  Psychedelic-Adjacent Herbs
                </h3>
                <p className='mt-1.5 text-xs leading-relaxed text-muted'>
                  Review conservative profile assessments, interaction boundaries, and safety warnings first.
                </p>
              </div>
              <span className='mt-3 text-xs font-semibold text-brand-700 inline-flex items-center gap-1'>
                Open comparison <span className='transition group-hover:translate-x-1'>→</span>
              </span>
            </Link>
          </div>
        </section>

        {/* Popular Profiles Library links */}
        <section className='space-y-2.5 sm:space-y-3'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <SectionHeader
              title='Popular research starting points'
              subtitle='Examples of evidence-aware profiles — not endorsements or medical recommendations.'
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
                aria-label={`View ${item.meta} for ${item.title}`} className='group rounded-2xl border border-brand-900/10 bg-white/90 p-3 transition hover:border-brand-900/20 hover:bg-white'
              >
                <div className='relative'>
                  <span className='inline-flex text-xs font-semibold uppercase tracking-[0.16em] text-brand-700'>
                    {item.meta}
                  </span>

                  <h3 className='mt-1.5 text-base font-semibold tracking-tight text-ink sm:text-lg'>
                    {item.title}
                  </h3>

                  <p className='mt-1 text-sm leading-5 text-muted line-clamp-2'>
                    {item.description}
                  </p>

                  <div className='mt-1.5'>
                    <ActionCue>Open profile</ActionCue>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Educational safety disclaimer */}
        <section className='rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 sm:p-5'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-sm leading-6 text-amber-950/85 max-w-4xl'>
              <strong>Important Notice:</strong> Natural does not automatically mean safe or effective. The information here supports comparison and mechanistic research. Always consult a physician and review potential contraindications before beginning any supplement routine.
            </p>
            <Link href='/disclaimer' className='shrink-0 text-sm font-semibold text-amber-900/90 transition hover:text-amber-950 whitespace-nowrap'>
              Read disclaimer →
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
