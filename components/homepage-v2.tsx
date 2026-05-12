'use client'

import Link from 'next/link'
import { ContentIdentityCard, SemanticBrowseModule } from '@/components/scientific-discovery'
import { cleanSummary, formatDisplayLabel, isClean } from '@/lib/display-utils'
import { authorityHomeLinks } from '@/app/authority-links'

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
  const slug = formatDisplayLabel(item.slug)

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
  { href: '/learn', title: 'Calm without flattening', description: 'Compare anxiolytic herbs by sedation, stress physiology, and evidence maturity.', meta: 'Learning path', kind: 'path' as const },
  { href: '/sleep-supplements', title: 'Sleep herbs vs melatonin', description: 'Understand when sleep support is circadian, calming, restorative, or habit-driven.', meta: 'Comparison', kind: 'path' as const },
  { href: '/herbs', title: 'Psychedelic-adjacent herbs', description: 'A harm-reduction lens for dream, ritual, and perception-adjacent botanicals.', meta: 'Safety led', kind: 'path' as const },
]

const evidenceTopics = [
  { href: '/blog/2026-03-18-research-digest-passionflower', title: 'How to read a research digest', description: 'Translate mechanisms and limitations without overclaiming.', meta: 'Article', kind: 'article' as const },
  { href: '/herbs/ashwagandha', title: 'Ashwagandha profile', description: 'Stress pathways, traditional context, and cautious evidence framing.', meta: 'Herb profile', kind: 'herb' as const },
  { href: '/compounds/theanine', title: 'Theanine profile', description: 'Compound-centered scanning for effects, safety, and mechanisms.', meta: 'Compound profile', kind: 'compound' as const },
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
              Scientific editorial library for natural compounds
            </div>

            <div className="space-y-7">
              <h1 className="heading-premium max-w-5xl text-balance">
                A field guide to herbs, compounds, mechanisms, and evidence — written for careful explorers.
              </h1>

              <p className="text-reading max-w-2xl text-lg leading-relaxed text-muted-soft sm:text-xl">
                The Hippie Scientist exists to make natural-compound research easier to navigate: human evidence first, mechanisms in context, traditional use labeled clearly, and uncertainty treated as part of the story.
              </p>
            </div>

            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <Link href="/explore" className="button-primary">
                Start Exploring
              </Link>

              <Link href="/blog" className="button-secondary">
                Read the Research Notes
              </Link>
            </div>
          </div>

          <div className="surface-depth card-spacing">
            <p className="eyebrow-label">Research philosophy</p>
            <div className="mt-5 space-y-4">
              {[
                ['Evidence before enthusiasm', 'Clinical signals, safety constraints, and uncertainty surface before product intent.'],
                ['Mechanisms are maps', 'Pathways guide exploration, but they are not treated as proof of outcomes.'],
                ['Traditional use has a label', 'Ethnobotanical context is preserved without pretending it is modern trial evidence.'],
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
            <p className="eyebrow-label">Authority Ecosystems</p>
            <h2 className="compact-heading mt-2">Semantic routes into the research graph.</h2>
          </div>
          <Link href="/explore" className="button-secondary rounded-full px-4 py-2 text-xs">View Explore</Link>
        </div>

        <div className="semantic-rail">
          {authorityHomeLinks.map((item) => (
            <RailCard
              key={item.href}
              item={{ href: item.href, title: item.label, meta: 'Authority route', description: 'Evidence-aware route into a related semantic system.' }}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Herbs', href: '/herbs', description: 'Botanical profiles with traditional context, safety notes, and related compounds.', meta: 'Botanical depth', kind: 'herb' as const },
          { title: 'Compounds', href: '/compounds', description: 'Supplement compounds organized by evidence, effects, and mechanisms.', meta: 'Molecular depth', kind: 'compound' as const },
          { title: 'Articles', href: '/blog', description: 'Research digests, pharmacology primers, and preparation explainers.', meta: 'Editorial layer', kind: 'article' as const },
          { title: 'Learning paths', href: '/learn', description: 'Guided reading sequences for evidence-aware exploration.', meta: 'Discovery layer', kind: 'path' as const },
        ].map((item) => <ContentIdentityCard key={item.href} item={item} />)}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div className="compact-section section-rhythm-compact">
          <div className="space-y-2">
            <p className="eyebrow-label">Featured learning paths</p>
            <h2 className="compact-heading">Start with a question, then move into the research graph.</h2>
          </div>
          <div className="semantic-rail">
            {learningPaths.map(item => <RailCard key={item.href} item={item} />)}
          </div>
        </div>

        <div className="safety-block p-5 sm:p-6">
          <div className="section-rhythm-compact">
            <div className="eyebrow-label text-amber-700">
              Scientific trust layer
            </div>

            <div className="space-y-3">
              <h3 className="compact-heading max-w-sm">
                Credibility comes from showing the edges of the evidence.
              </h3>

              <p className="compact-copy text-amber-950/85">
                Profiles separate human evidence, mechanisms, traditional use, and safety uncertainty so claims stay proportional.
              </p>
            </div>

            <Link href="/disclaimer" className="button-secondary w-full justify-center rounded-full py-2.5 text-sm">
              Read Educational Scope
            </Link>
          </div>
        </div>
      </section>

      <SemanticBrowseModule
        title="Browse the library semantically"
        description="Discovery is organized around why a compound is being explored, what pathway is proposed, and how mature the evidence appears."
        groups={[
          { title: 'Neuroendocrine / nervous system', description: 'GABA, stress-response, mood, sleep, and cognition-adjacent pathways.', href: '/explore/anxiety', meta: 'Mechanism' },
          { title: 'Evidence maturity', description: 'Compare strong, mixed, early, and traditional-use-led profiles without flattening nuance.', href: '/a-tier', meta: 'Evidence' },
          { title: 'Effect clusters', description: 'Move from sleep, stress, focus, recovery, or metabolic goals into the depth layer.', href: '/goals', meta: 'Effects' },
          { title: 'Research style', description: 'Distinguish clinical, mechanism-led, traditional-use-led, and editorial synthesis pages.', href: '/blog', meta: 'Method' },
          { title: 'Traditional systems', description: 'Keep historical context visible while preserving modern uncertainty boundaries.', href: '/learning', meta: 'Tradition' },
          { title: 'Currently explored topics', description: 'An evolving editorial map of calming herbs, dream botanicals, adaptogens, and recovery support.', href: '/explore', meta: 'Now' },
        ]}
      />

      <section className="compact-section section-rhythm-compact">
        <div className="space-y-2">
          <p className="eyebrow-label">Featured evidence topics</p>
          <h2 className="compact-heading">Publication-style entry points into the research library.</h2>
        </div>
        <div className="semantic-rail">
          {visibleEvidenceTopics.map(item => <RailCard key={item.href} item={item} />)}
        </div>
      </section>

    </main>
  )
}
