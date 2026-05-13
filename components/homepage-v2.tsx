'use client'

import Link from 'next/link'
import { ContentIdentityCard } from '@/components/scientific-discovery'
import { cleanSummary, formatDisplayLabel, isClean } from '@/lib/display-utils'
import { homepageMessaging } from '@/lib/homepage-messaging'

type RuntimeFeature = Record<string, any>

type HomepageV2Props = {
  featuredHerbs?: RuntimeFeature[]
  featuredCompounds?: RuntimeFeature[]
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

function toFeaturedCard(item: RuntimeFeature, type: 'herb' | 'compound') {
  const title = getFeatureName(item)

  if (!item.slug || !isClean(title)) return null

  return {
    href: `/${type === 'herb' ? 'herbs' : 'compounds'}/${item.slug}`,
    title,
    description: getFeatureDescription(item, type),
    meta: type === 'herb' ? 'Herb' : 'Compound',
  }
}


const beginnerEntries = [
  { title: 'Start Sleep Support', href: '/start/sleep-support', description: 'Begin with calmer profiles, sleep-adjacent expectations, and recovery-aware comparisons.' },
  { title: 'Start Cognitive Support', href: '/start/cognitive-support', description: 'Separate calm focus, cumulative cognition, and activating focus before stacking.' },
  { title: 'Start Recovery Support', href: '/start/recovery-support', description: 'Explore performance support, recovery capacity, and cumulative timelines conservatively.' },
  { title: 'Start Stress Support', href: '/start/stress-support', description: 'Compare adaptogenic, calming, and recovery-oriented pathways by practical fit.' },
]

const ecosystemEntries = [
  { title: 'Sleep ecosystem', href: '/ecosystems/sleep', description: 'Calming pathways, sleep-adjacent profiles, and realistic evening-support decisions.' },
  { title: 'Cognition ecosystem', href: '/ecosystems/cognition', description: 'Calm focus, cumulative cognition, activating support, and sustainable mental performance.' },
  { title: 'Recovery ecosystem', href: '/ecosystems/recovery', description: 'Training support, nervous-system recovery, and cumulative performance resilience.' },
  { title: 'Stress ecosystem', href: '/ecosystems/stress', description: 'Stress resilience, stimulation sensitivity, and adaptogen comparison logic.' },
]

const comparisonHighlights = [
  'Calm focus vs activating focus',
  'Cumulative cognition vs acute stimulation',
  'Sleep-adjacent relaxation vs daytime recovery',
  'Beginner-friendly simplicity vs premature stack complexity',
]

const featuredFallbacks = [
  {
    href: '/herbs/ashwagandha',
    title: 'Ashwagandha',
    description: 'Stress resilience, recovery support, and realistic evidence interpretation.',
    meta: 'Herb',
  },
  {
    href: '/compounds/theanine',
    title: 'Theanine',
    description: 'Calm focus, relaxation pathways, and non-sedating support context.',
    meta: 'Compound',
  },
  {
    href: '/compounds/creatine',
    title: 'Creatine',
    description: 'Performance, recovery, energy buffering, and cognitive support research.',
    meta: 'Compound',
  },
]

export default function HomepageV2({ featuredHerbs = [], featuredCompounds = [] }: HomepageV2Props) {
  const featured = [
    ...featuredHerbs.map((item) => toFeaturedCard(item, 'herb')),
    ...featuredCompounds.map((item) => toFeaturedCard(item, 'compound')),
  ].filter((item): item is NonNullable<typeof item> => Boolean(item)).slice(0, 3)

  const visibleFeatured = featured.length > 0 ? featured : featuredFallbacks

  return (
    <main className='min-h-screen space-y-20 px-4 py-6 text-ink sm:space-y-28 sm:py-10'>
      <section className='hero-shell relative overflow-hidden rounded-[2.5rem] border border-white/40 px-6 py-16 shadow-soft sm:px-10 lg:px-16 lg:py-24'>
        <div className='absolute right-[-10%] top-[-10%] hidden h-[30rem] w-[30rem] rounded-full bg-brand-100/30 blur-3xl lg:block' />

        <div className='grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center'>
          <div className='relative z-10 max-w-4xl space-y-8'>
            <div className='inline-flex rounded-full border border-brand-700/10 bg-white/85 px-4 py-2 text-xs font-semibold tracking-wide text-[#5f6f66] backdrop-blur-md'>
              Evidence-aware supplement research
            </div>

            <div className='space-y-6'>
              <h1 className='heading-premium max-w-5xl text-balance'>
                {homepageMessaging.heroHeadline}
              </h1>

              <p className='max-w-2xl text-lg leading-relaxed text-[#4e5d55] sm:text-xl'>
                Explore herbs, compounds, and practical evidence without the hype.
              </p>
            </div>

            <div className='flex flex-col gap-4 sm:flex-row'>
              <Link href='/herbs' className='button-primary'>
                Explore Herbs
              </Link>

              <Link href='/compare' className='button-secondary'>
                Compare Supplements
              </Link>
            </div>
          </div>

          <div className='relative hidden min-h-[420px] overflow-hidden rounded-[2.5rem] border border-brand-900/10 bg-gradient-to-br from-[#f6f3ec] via-[#f8f8f4] to-[#edf3ec] lg:block'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(176,205,177,0.22),transparent_42%)]' />
            <div className='absolute bottom-8 left-8 max-w-sm rounded-[2rem] border border-white/60 bg-white/75 p-6 backdrop-blur-md'>
              <p className='text-sm leading-7 text-[#46574d]'>
                Compare evidence, recovery support, cognition pathways, stress resilience, and realistic expectations through guided research profiles.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-6xl space-y-8'>
        <div className='space-y-2'>
          <p className='eyebrow-label'>Beginner entry systems</p>
          <h2 className='compact-heading'>Start with a guided pathway, not a random stack.</h2>
          <p className='detail-reading max-w-3xl text-[#46574d]'>
            Each entry point frames stimulation, timeline, recovery orientation, and comparison logic before profile depth.
          </p>
        </div>

        <div className='grid gap-5 md:grid-cols-2'>
          {beginnerEntries.map((item) => (
            <ContentIdentityCard key={item.href} item={{ ...item, meta: 'Onboarding' } as any} />
          ))}
        </div>
      </section>

      <section className='mx-auto max-w-6xl space-y-8'>
        <div className='space-y-2'>
          <p className='eyebrow-label'>Ecosystem intelligence</p>
          <h2 className='compact-heading'>Explore semantic hubs and adjacent pathways.</h2>
          <p className='detail-reading max-w-3xl text-[#46574d]'>
            Ecosystem hubs connect beginner starts, adaptive comparisons, common mistakes, and practical field-manual guidance.
          </p>
        </div>

        <div className='grid gap-5 md:grid-cols-2'>
          {ecosystemEntries.map((item) => (
            <ContentIdentityCard key={item.href} item={{ ...item, meta: 'Ecosystem' } as any} />
          ))}
        </div>
      </section>

      <section className='rounded-[2.5rem] border border-brand-900/10 bg-gradient-to-br from-[#f6f4ee] via-white to-[#eef4ee] p-8 shadow-sm sm:p-12'>
        <div className='grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center'>
          <div className='space-y-3'>
            <p className='eyebrow-label'>Comparative reasoning highlights</p>
            <h2 className='text-3xl font-semibold tracking-tight text-ink'>This is fit-first supplement navigation.</h2>
            <p className='text-sm leading-7 text-[#46574d]'>
              The platform emphasizes conservative interpretation, evidence-aware positioning, and semantic continuity across profiles instead of generic supplement rankings.
            </p>
          </div>

          <div className='grid gap-3 sm:grid-cols-2'>
            {comparisonHighlights.map((item) => (
              <div key={item} className='rounded-2xl border border-brand-900/10 bg-white/75 p-4 text-sm font-semibold text-[#33443a]'>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-6xl space-y-8'>
        <div className='space-y-2'>
          <p className='eyebrow-label'>Explore by goal</p>
          <h2 className='compact-heading'>Start with what you are trying to improve.</h2>
        </div>

        <div className='grid gap-5 md:grid-cols-2'>
          <ContentIdentityCard item={{ title: 'Sleep support', href: '/sleep-supplements', description: 'Explore calming pathways, circadian support, and recovery-focused compounds.', meta: 'Goal' } as any} />
          <ContentIdentityCard item={{ title: 'Stress support', href: '/stress-supplements', description: 'Compare adaptogens, calming compounds, and recovery-oriented support.', meta: 'Goal' } as any} />
          <ContentIdentityCard item={{ title: 'Focus and cognition', href: '/cognition-supplements', description: 'Explore focus, memory, calm productivity, and cognitive energy support.', meta: 'Goal' } as any} />
          <ContentIdentityCard item={{ title: 'Inflammation support', href: '/inflammation', description: 'Review inflammatory pathways, recovery support, and evidence-aware options.', meta: 'Goal' } as any} />
        </div>
      </section>

      <section className='rounded-[2.5rem] border border-brand-900/10 bg-gradient-to-br from-[#f6f4ee] via-white to-[#eef4ee] p-8 shadow-sm sm:p-12'>
        <div className='grid gap-5 md:grid-cols-3'>
          <div className='rounded-[1.5rem] border border-brand-900/10 bg-white/70 p-5'>
            <h3 className='text-base font-semibold tracking-tight text-ink'>Evidence-aware positioning</h3>
            <p className='mt-2 text-sm leading-7 text-[#46574d]'>Research context, safety boundaries, and expectation timelines stay visible instead of collapsing into hype.</p>
          </div>

          <div className='rounded-[1.5rem] border border-brand-900/10 bg-white/70 p-5'>
            <h3 className='text-base font-semibold tracking-tight text-ink'>Conservative interpretation</h3>
            <p className='mt-2 text-sm leading-7 text-[#46574d]'>Profiles are framed as decision-support field notes, not pseudo-medical promises or universal rankings.</p>
          </div>

          <div className='rounded-[1.5rem] border border-brand-900/10 bg-white/70 p-5'>
            <h3 className='text-base font-semibold tracking-tight text-ink'>Fit-first reasoning</h3>
            <p className='mt-2 text-sm leading-7 text-[#46574d]'>Stimulation, timeline, recovery orientation, and beginner difficulty shape exploration before product decisions.</p>
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-6xl space-y-8'>
        <div className='space-y-2'>
          <p className='eyebrow-label'>Featured profiles</p>
          <h2 className='compact-heading'>Popular starting points.</h2>
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          {visibleFeatured.map((item) => (
            <Link key={item.href} href={item.href} className='group relative overflow-hidden rounded-[2rem] border border-brand-900/10 bg-gradient-to-br from-white via-[#fafaf7] to-brand-50/30 p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-700/20'>
              <span className='inline-flex rounded-full border border-brand-900/10 bg-white/70 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#5f6f66]'>
                {item.meta}
              </span>

              <h3 className='mt-5 text-2xl font-semibold tracking-tight text-ink'>
                {item.title}
              </h3>

              <p className='mt-3 text-sm leading-7 text-[#46574d]'>
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className='grid gap-5 lg:grid-cols-4'>
        {[
          { title: 'Herbs', href: '/herbs', description: 'Browse botanical profiles and evidence-aware summaries.' },
          { title: 'Compounds', href: '/compounds', description: 'Explore compounds, mechanisms, and practical guidance.' },
          { title: 'Compare', href: '/compare', description: 'Review differences between related supplements and pathways.' },
          { title: 'Learn', href: '/learn', description: 'Follow guided introductions into evidence-aware supplement research.' },
        ].map((item) => (
          <ContentIdentityCard key={item.href} item={item as any} />
        ))}
      </section>

      <section className='rounded-[2rem] border border-amber-700/15 bg-gradient-to-br from-amber-50/70 to-white p-8 shadow-sm'>
        <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
          <div className='max-w-2xl space-y-3'>
            <p className='eyebrow-label text-amber-700'>Educational scope</p>
            <h2 className='text-3xl font-semibold tracking-tight text-amber-950'>Natural does not automatically mean safe or effective.</h2>
            <p className='text-base leading-8 text-amber-950/80'>
              Use these pages to compare evidence and understand pathways — not as a replacement for medical care.
            </p>
          </div>

          <Link href='/disclaimer' className='button-secondary whitespace-nowrap'>
            Read Disclaimer
          </Link>
        </div>
      </section>
    </main>
  )
}
