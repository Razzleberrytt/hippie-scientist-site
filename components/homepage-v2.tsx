'use client'

import Link from 'next/link'
import { ContentIdentityCard, SemanticBrowseModule } from '@/components/scientific-discovery'

const learningPaths = [
  { href: '/learn', title: 'Calm without flattening', description: 'Compare anxiolytic herbs by sedation, stress physiology, and evidence maturity.', meta: 'Learning path', kind: 'path' as const },
  { href: '/sleep-supplements', title: 'Sleep herbs vs melatonin', description: 'Understand when sleep support is circadian, calming, restorative, or habit-driven.', meta: 'Comparison', kind: 'path' as const },
  { href: '/herbs', title: 'Psychedelic-adjacent herbs', description: 'A harm-reduction lens for dream, ritual, and perception-adjacent botanicals.', meta: 'Safety led', kind: 'path' as const },
]

const evidenceTopics = [
  { href: '/blog/2026-03-18-research-digest-passionflower', title: 'How to read a research digest', description: 'A short editorial example of translating mechanisms and limitations without overclaiming.', meta: 'Article', kind: 'article' as const },
  { href: '/herbs/ashwagandha', title: 'Ashwagandha profile', description: 'A depth-layer example combining traditional use, stress pathways, and cautious evidence context.', meta: 'Herb profile', kind: 'herb' as const },
  { href: '/compounds/theanine', title: 'Theanine profile', description: 'Compound-centered scanning for effects, safety, mechanisms, and related recommendations.', meta: 'Compound profile', kind: 'compound' as const },
]

export default function HomepageV2() {
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
                ['Evidence before enthusiasm', 'Clinical signals, safety constraints, and uncertainty are surfaced before product intent.'],
                ['Mechanisms are maps', 'Pathways help exploration, but they are not treated as proof of outcomes.'],
                ['Traditional use has a label', 'Ethnobotanical context is preserved without pretending it is the same as modern trials.'],
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

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Herbs', href: '/herbs', description: 'Botanical profiles with traditional context, use-case signals, safety notes, and related compounds.', meta: 'Botanical depth', kind: 'herb' as const },
          { title: 'Compounds', href: '/compounds', description: 'Isolated constituents and supplement compounds organized by evidence, effects, and mechanisms.', meta: 'Molecular depth', kind: 'compound' as const },
          { title: 'Articles', href: '/blog', description: 'Research digests, pharmacology primers, field notes, and preparation explainers tied back to profiles.', meta: 'Editorial layer', kind: 'article' as const },
          { title: 'Learning paths', href: '/learn', description: 'Guided reading sequences that turn broad questions into evidence-aware exploration.', meta: 'Discovery layer', kind: 'path' as const },
        ].map((item) => <ContentIdentityCard key={item.href} item={item} />)}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <div className="surface-depth card-spacing">
          <p className="eyebrow-label">Featured learning paths</p>
          <h2 className="mt-3 max-w-3xl text-balance">Start with a question, then move into the research graph.</h2>
          <div className="mt-7 grid gap-4">
            {learningPaths.map(item => <ContentIdentityCard key={item.href} item={item} />)}
          </div>
        </div>

        <div className="safety-block">
          <div className="section-spacing">
            <div className="eyebrow-label text-amber-700">
              Scientific trust layer
            </div>

            <div className="space-y-4">
              <h3 className="max-w-sm text-balance">
                Credibility comes from showing the edges of the evidence.
              </h3>

              <p className="text-sm leading-7 text-amber-950/85">
                Profiles separate human evidence, mechanistic hypotheses, traditional use, practical context, and safety uncertainty so readers can keep claims proportional.
              </p>
            </div>

            <Link href="/disclaimer" className="button-secondary w-full justify-center">
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
          { title: 'Evidence maturity', description: 'Compare strong, mixed, early, and traditional-use-led profiles without flattening the nuance.', href: '/a-tier', meta: 'Evidence' },
          { title: 'Effect clusters', description: 'Move from sleep, stress, focus, recovery, or metabolic goals into the depth layer.', href: '/goals', meta: 'Effects' },
          { title: 'Research style', description: 'Distinguish clinical, mechanism-led, traditional-use-led, and editorial synthesis pages.', href: '/blog', meta: 'Method' },
          { title: 'Traditional systems', description: 'Keep historical context visible while preserving modern uncertainty boundaries.', href: '/learning', meta: 'Tradition' },
          { title: 'Currently explored topics', description: 'An evolving editorial map of calming herbs, dream botanicals, adaptogens, and recovery support.', href: '/explore', meta: 'Now' },
        ]}
      />

      <section className="surface-depth card-spacing">
        <p className="eyebrow-label">Featured evidence topics</p>
        <h2 className="mt-3 max-w-3xl text-balance">Publication-style entry points into the research library.</h2>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {evidenceTopics.map(item => <ContentIdentityCard key={item.href} item={item} />)}
        </div>
      </section>

    </main>
  )
}
