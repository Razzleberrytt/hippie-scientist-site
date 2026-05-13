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
  ].filter(Boolean).slice(0, 3)

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
            <h3 className='text-base font-semibold tracking-tight text-ink'>Start with your goal</h3>
            <p className='mt-2 text-sm leading-7 text-[#46574d]'>Sleep, stress, cognition, recovery, and inflammation pages help you begin with practical intent.</p>
          </div>

          <div className='rounded-[1.5rem] border border-brand-900/10 bg-white/70 p-5'>
            <h3 className='text-base font-semibold tracking-tight text-ink'>Compare nearby options</h3>
            <p className='mt-2 text-sm leading-7 text-[#46574d]'>Review similar herbs and compounds before relying on one supplement narrative.</p>
          </div>

          <div className='rounded-[1.5rem] border border-brand-900/10 bg-white/70 p-5'>
            <h3 className='text-base font-semibold tracking-tight text-ink'>Check evidence and safety</h3>
            <p className='mt-2 text-sm leading-7 text-[#46574d]'>Human evidence and realistic expectations stay separated from hype.</p>
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
