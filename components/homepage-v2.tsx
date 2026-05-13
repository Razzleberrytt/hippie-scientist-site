'use client'

import Link from 'next/link'
import { ContentIdentityCard, SemanticBrowseModule } from '@/components/scientific-discovery'
import { cleanSummary, formatDisplayLabel, isClean } from '@/lib/display-utils'
import { authorityHomeLinks } from '@/app/authority-links'
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
    item.short_earthy_summary ||
      item.shortEarthySummary ||
      item.summary ||
      item.coreInsight ||
      item.hero ||
      item.description,
    type
  )
}

function toFeaturedCard(item: RuntimeFeature, type: 'herb' | 'compound') {
  const title = getFeatureName(item)
  const slug = item.slug

  if (!item.slug || !isClean(title)) return null

  return {
    href: `/${type === 'herb' ? 'herbs' : 'compounds'}/${item.slug}`,
    title,
    description: getFeatureDescription(item, type),
    meta: type === 'herb' ? 'Featured herb' : 'Featured compound',
    kind: type,
    slug,
  } as const
}

const learningPaths = [
  { href: '/sleep-supplements', title: 'Explore sleep support', description: 'Compare calming, circadian, and recovery-oriented options without treating every sleep aid the same.', meta: 'Sleep goal', kind: 'path' as const },
  { href: '/stress-supplements', title: 'Explore stress support', description: 'Review adaptogens, calming compounds, and realistic expectations for stress resilience.', meta: 'Stress goal', kind: 'path' as const },
  { href: '/cognition-supplements', title: 'Explore focus and cognition', description: 'Move through nootropics, cholinergic support, calm focus, and cognitive-energy pathways.', meta: 'Cognition goal', kind: 'path' as const },
]

const evidenceTopics = [
  { href: '/herbs/ashwagandha', title: 'Ashwagandha profile', description: 'Stress, sleep-adjacent use, safety notes, and realistic interpretation.', meta: 'Herb profile', kind: 'herb' as const },
  { href: '/compounds/theanine', title: 'Theanine profile', description: 'Calm focus, relaxation pathways, and non-sedating support context.', meta: 'Compound profile', kind: 'compound' as const },
  { href: '/compounds/creatine', title: 'Creatine profile', description: 'Performance, energy buffering, recovery context, and evidence maturity.', meta: 'Compound profile', kind: 'compound' as const },
]

function RailCard({ item }: { item: { href: string; title: string; description?: string; meta?: string } }) {
  return (
    <Link href={item.href} className="semantic-rail-card group">
      {item.meta ? <p className="eyebrow-label">{item.meta}</p> : null}
      <h3 className="mt-2 max-w-none text-base font-semibold leading-snug tracking-tight text-ink group-hover:text-brand-700">
        {item.title}
      </h3>
      {item.description ? (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#46574d]">
          {item.description}
        </p>
      ) : null}
    </Link>
  )
}

export default function HomepageV2({ featuredHerbs = [], featuredCompounds = [] }: HomepageV2Props) {
  const featuredRuntimeTopics = [
    ...featuredHerbs.map((item) => toFeaturedCard(item, 'herb')),
    ...featuredCompounds.map((item) => toFeaturedCard(item, 'compound')),
  ].filter(Boolean).slice(0, 3)

  const visibleEvidenceTopics = featuredRuntimeTopics.length > 0 ? featuredRuntimeTopics : evidenceTopics

  return (
    <main className="min-h-screen text-ink section-spacing">

      <section className="hero-shell overflow-hidden rounded-[2.25rem] border border-white/45 px-6 py-16 shadow-soft sm:px-10 lg:px-16 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div className="max-w-5xl section-spacing">
            <div className="eyebrow-label inline-flex rounded-full border border-brand-700/10 bg-white/85 px-4 py-2 backdrop-blur-md">
              Evidence-aware natural compound guide
            </div>

            <div className="space-y-7">
              <h1 className="heading-premium max-w-5xl text-balance">
                {homepageMessaging.heroHeadline}
              </h1>

              <p className="text-reading max-w-2xl text-lg leading-relaxed text-muted-soft sm:text-xl">
                {homepageMessaging.heroSubhead}
              </p>
            </div>

            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <Link href={homepageMessaging.primaryCTA.href} className="button-primary">
                {homepageMessaging.primaryCTA.label}
              </Link>

              <Link href={homepageMessaging.secondaryCTA.href} className="button-secondary">
                {homepageMessaging.secondaryCTA.label}
              </Link>
            </div>
          </div>

          <div className="surface-depth card-spacing">
            <p className="eyebrow-label">How to use the site</p>
            <div className="mt-5 space-y-4">
              {[
                ['Start with your goal', 'Sleep, stress, focus, recovery, and inflammation pages help you begin with what you actually care about.'],
                ['Compare nearby options', 'Profiles link into related herbs, compounds, stacks, and comparison pages so you can avoid one-ingredient tunnel vision.'],
                ['Check the evidence and safety', 'Human evidence, mechanisms, traditional use, and safety context are separated so claims stay proportional.'],
              ].map(([title, body]) => (
                <div key={title} className="border-t border-brand-900/10 pt-4 first:border-t-0 first:pt-0">
                  <h2 className="max-w-none font-sans text-base font-semibold tracking-tight text-ink">{title}</h2>
                  <p className="mt-1 text-sm leading-7 text-[#46574d]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="compact-section section-rhythm-compact">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow-label">{homepageMessaging.sections.exploreByGoal}</p>
            <h2 className="compact-heading mt-2">Start with what you are trying to improve.</h2>
          </div>
          <Link href="/goals" className="button-secondary rounded-full px-4 py-2 text-xs">View Goals</Link>
        </div>

        <div className="semantic-rail">
          {authorityHomeLinks.map((item) => (
            <RailCard
              key={item.href}
              item={{ href: item.href, title: item.label, meta: 'Goal route', description: 'A practical entry point into related herbs, compounds, and evidence summaries.' }}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Herbs', href: '/herbs', description: 'Botanical profiles with traditional context, safety notes, and related compounds.', meta: 'Browse profiles', kind: 'herb' as const },
          { title: 'Compounds', href: '/compounds', description: 'Supplement compounds organized by evidence, effects, and mechanisms.', meta: 'Browse profiles', kind: 'compound' as const },
          { title: 'Compare', href: '/compare', description: 'Side-by-side decisions for related supplements, mechanisms, and use cases.', meta: 'Decision support', kind: 'path' as const },
          { title: 'Learn', href: '/learn', description: 'Guided reading sequences for evidence-aware exploration.', meta: 'Beginner friendly', kind: 'article' as const },
        ].map((item) => <ContentIdentityCard key={item.href} item={item} />)}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div className="compact-section section-rhythm-compact">
          <div className="space-y-2">
            <p className="eyebrow-label">Featured starting points</p>
            <h2 className="compact-heading">Choose a practical question and go deeper.</h2>
          </div>
          <div className="semantic-rail">
            {learningPaths.map(item => <RailCard key={item.href} item={item} />)}
          </div>
        </div>

        <div className="safety-block p-5 sm:p-6">
          <div className="section-rhythm-compact">
            <div className="eyebrow-label text-amber-700">
              Safety first
            </div>

            <div className="space-y-3">
              <h3 className="compact-heading max-w-sm">
                Natural does not automatically mean safe or useful.
              </h3>

              <p className="compact-copy text-amber-950/85">
                Use these pages for education, comparison, and better questions — not as a replacement for medical care.
              </p>
            </div>

            <Link href="/disclaimer" className="button-secondary w-full justify-center rounded-full py-2.5 text-sm">
              Read Educational Scope
            </Link>
          </div>
        </div>
      </section>

      <SemanticBrowseModule
        title="Browse by goal or research pathway"
        description="Find supplements by what you are trying to understand: sleep, stress, focus, recovery, inflammation, safety, or evidence strength."
        groups={[
          { title: 'Sleep support', description: 'Compare calming, circadian, and recovery-oriented options.', href: '/sleep-supplements', meta: 'Goal' },
          { title: 'Stress support', description: 'Explore adaptogens, calming compounds, and stress-resilience context.', href: '/stress-supplements', meta: 'Goal' },
          { title: 'Focus and cognition', description: 'Move through nootropics, calm focus, memory, and cognitive-energy pathways.', href: '/cognition-supplements', meta: 'Goal' },
          { title: 'Recovery and performance', description: 'Compare recovery, training, mitochondrial, and energy-support options.', href: '/performance-supplements', meta: 'Goal' },
          { title: 'Herb profiles', description: 'Browse botanical profiles with safety, evidence, and related compounds.', href: '/herbs', meta: 'Library' },
          { title: 'Compound profiles', description: 'Browse individual compounds, mechanisms, and comparison paths.', href: '/compounds', meta: 'Library' },
        ]}
      />

      <section className="compact-section section-rhythm-compact">
        <div className="space-y-2">
          <p className="eyebrow-label">Featured profiles</p>
          <h2 className="compact-heading">Start with well-known herbs and compounds.</h2>
        </div>
        <div className="semantic-rail">
          {visibleEvidenceTopics.map(item => <RailCard key={item.href} item={item} />)}
        </div>
      </section>

    </main>
  )
}
