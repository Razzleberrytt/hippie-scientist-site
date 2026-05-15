import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllCompounds, getAllHerbs } from '@/lib/server/runtime-data'
import {
  classifyArchetype,
  getTopicClusters,
} from '@/lib/semantic-runtime'
import { cleanSummary, isClean } from '@/lib/display-utils'
import { safeArray, safeIncludes, safeLower, safeSlug, safeTrim } from '@/lib/search-safe'
import { EcosystemPanelGrid, KnowledgeGraphLinks, SemanticHubIntro, SignalPanel } from '@/components/semantic-hubs/semantic-hub-sections'
import { getAdjacentEcosystemPanels } from '@/lib/ecosystem-context'
import { getAuthorityAnchorRecords, normalizeEcosystemFields } from '@/lib/ecosystem-intelligence'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'

const TITLES: Record<string, string> = {
  sleep: 'Sleep Support',
  focus: 'Focus & Cognition',
  anxiety: 'Stress & Mood',
  recovery: 'Recovery & Performance',
}

const TOPIC_CONTEXT: Record<string, { intro: string; sections: { title: string; body: string }[]; signals: string[]; links: { label: string; href: string; description: string }[] }> = {
  sleep: {
    intro: 'Sleep support is organized around relaxation signaling, sleep latency, circadian context, and recovery-adjacent physiology. The page helps readers compare compounds without implying that pathway overlap equals clinical effect.',
    sections: [
      { title: 'Biological context', body: 'Sleep-related research often spans inhibitory neurotransmission, arousal regulation, circadian rhythm, and nighttime recovery.' },
      { title: 'Research focus', body: 'Compounds are surfaced when their workbook signals mention sleep, relaxation, GABA, melatonin-adjacent context, or restorative effects.' },
      { title: 'Pathway relevance', body: 'Use the cluster as a starting map, then evaluate individual profile evidence, dosing notes, cautions, and interaction context.' },
    ],
    signals: ['GABA', 'Circadian rhythm', 'Sleep latency', 'Relaxation', 'Nighttime recovery', 'Stress overlap'],
    links: [
      { label: 'GABA pathway', href: '/pathways/gaba', description: 'Inhibitory-tone and relaxation context that commonly overlaps with sleep-support profiles.' },
      { label: 'Sleep goal guide', href: '/goals/sleep', description: 'Outcome-led guide for comparing sleep quality, latency, and nighttime relaxation.' },
      { label: 'Sleep compounds collection', href: '/collections/best-studied-sleep-compounds', description: 'Evidence-aware collection for compounds frequently researched in sleep contexts.' },
    ],
  },
  focus: {
    intro: 'Focus and cognition pages group compounds by attention, memory, neurotransmitter, and mental-performance signals while keeping the evidence layer separate from mechanism plausibility.',
    sections: [
      { title: 'Biological context', body: 'Cognition research can involve neurotransmitter tone, energy metabolism, neuroprotection, attention, and fatigue resistance.' },
      { title: 'Research focus', body: 'The cluster prioritizes profiles with focus, cognition, dopamine, cholinergic, nootropic, memory, or brain-health language.' },
      { title: 'Pathway relevance', body: 'Mechanism labels help navigation, but profile-level evidence and safety context determine how strongly a record should be interpreted.' },
    ],
    signals: ['Dopamine', 'Acetylcholine', 'Attention', 'Memory', 'Mental clarity', 'Fatigue overlap'],
    links: [
      { label: 'Dopamine pathway', href: '/pathways/dopamine', description: 'Motivation, reward, attention, and cognitive-performance pathway relationships.' },
      { label: 'Focus goal guide', href: '/goals/focus', description: 'Outcome-led guide for focus, attention, brain fog, and cognition support.' },
      { label: 'Cholinergic compounds', href: '/collections/cholinergic-compounds', description: 'Collection centered on acetylcholine-adjacent compounds and cognition context.' },
    ],
  },
  anxiety: {
    intro: 'Stress and mood discovery connects calming, adaptation, cortisol, relaxation, and nervous-system signals without overstating psychiatric benefit.',
    sections: [
      { title: 'Biological context', body: 'Stress-support research often spans HPA-axis language, inhibitory tone, sleep overlap, inflammation, and autonomic balance.' },
      { title: 'Research focus', body: 'Records are grouped by stress, calm, mood, relaxation, adaptogen, and anxiety-adjacent workbook signals.' },
      { title: 'Pathway relevance', body: 'The hub supports exploration and comparison; it is not a substitute for medical evaluation of anxiety or mood disorders.' },
    ],
    signals: ['Stress signaling', 'Adaptogens', 'GABA overlap', 'Cortisol context', 'Mood support', 'Sleep overlap'],
    links: [
      { label: 'GABA pathway', href: '/pathways/gaba', description: 'Calming and inhibitory signaling context related to stress and relaxation.' },
      { label: 'Stress supplement guide', href: '/best-supplements-for-stress', description: 'Decision guide for stress resilience and evidence-aware supplement comparisons.' },
      { label: 'Adaptogens for stress', href: '/collections/adaptogens-for-stress', description: 'Botanical collection organized around adaptation and resilience language.' },
    ],
  },
  recovery: {
    intro: 'Recovery and performance discovery connects exercise stress, inflammation, hydration, antioxidant tone, and tissue-support signals.',
    sections: [
      { title: 'Biological context', body: 'Recovery-oriented research commonly intersects with inflammatory signaling, oxidative stress, fluid balance, sleep quality, and muscle function.' },
      { title: 'Research focus', body: 'The cluster highlights records with recovery, performance, inflammation, antioxidant, hydration, energy, or mobility signals.' },
      { title: 'Pathway relevance', body: 'Adjacent pathways help readers distinguish performance plausibility from direct outcome evidence.' },
    ],
    signals: ['Inflammation', 'Oxidative stress', 'Hydration', 'Muscle function', 'Energy metabolism', 'Mobility'],
    links: [
      { label: 'Inflammation pathway', href: '/pathways/inflammation', description: 'Immune, oxidative-stress, and recovery-adjacent pathway relationships.' },
      { label: 'Recovery goal guide', href: '/goals/recovery', description: 'Outcome-led guide for repair, performance recovery, and mobility support.' },
      { label: 'Joint support guide', href: '/best-supplements-for-joint-support', description: 'Inflammation-adjacent guide for mobility and joint-support decisions.' },
    ],
  },
}

export async function generateStaticParams() {
  return Object.keys(TITLES).map((topic) => ({ topic }))
}

function safeClusters(compound: any) {
  const seen = new Set<string>()

  return safeArray<string>(getTopicClusters(compound))
    .map((cluster) => safeTrim(cluster))
    .filter(isClean)
    .filter(Boolean)
    .filter((cluster) => {
      const key = safeLower(cluster)
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function matchesTopic(cluster: unknown, topic: string) {
  if (topic === 'sleep') return safeIncludes(cluster, 'sleep')
  if (topic === 'focus') return safeIncludes(cluster, 'focus')
  if (topic === 'anxiety') return safeIncludes(cluster, 'stress')
  if (topic === 'recovery') return safeIncludes(cluster, 'recovery')

  return false
}

export default async function TopicExplorePage({ params }: any) {
  const resolvedParams = await params
  const topic = safeLower(resolvedParams?.topic)

  if (!TITLES[topic]) notFound()

  const [compounds, herbs] = await Promise.all([
    getAllCompounds(),
    getAllHerbs(),
  ])
  const context = TOPIC_CONTEXT[topic]
  const filtered = safeArray<any>(compounds)
    .filter((compound) => safeSlug(compound?.slug) && safeTrim(compound?.name))
    .map((compound) => ({
      ...compound,
      slug: safeSlug(compound?.slug),
      archetype: classifyArchetype(compound),
      clusters: safeClusters(compound),
    }))
    .filter((compound) => compound.clusters.some((cluster: string) => matchesTopic(cluster, topic)))
    .sort((a, b) => safeLower(a?.name).localeCompare(safeLower(b?.name)))
    .slice(0, 24)

  const ecosystemSignals = Array.from(new Set(filtered.flatMap((compound: any) => {
    const fields = normalizeEcosystemFields(compound)
    return [
      ...fields.topicClusters,
      ...fields.ecosystemTags,
      ...fields.pathwayCompanions,
      ...fields.pathwayEcosystems,
      ...fields.mechanismEcosystems,
    ]
  }).filter(Boolean))).slice(0, 10)

  const authorityAnchors = getAuthorityAnchorRecords([...safeArray<any>(compounds), ...safeArray<any>(herbs)], 8)
    .filter((record: any) => getRuntimeVisibility(record).canRender)
    .filter((record: any) => {
      const fields = normalizeEcosystemFields(record)
      return [...fields.topicClusters, ...fields.ecosystemTags, ...fields.relatedTopics].some((signal) => matchesTopic(signal, topic))
    })
    .slice(0, 4)

  return (
    <main className="mx-auto max-w-7xl space-y-9 px-4 py-10 sm:py-14">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
        <div className="max-w-4xl space-y-4">
          <p className="eyebrow-label">Semantic Explore Hub</p>

          <h1 className="heading-premium text-ink">
            {TITLES[topic]}
          </h1>

          <p className="max-w-3xl text-lg leading-8 text-[#46574d]">
            {context.intro}
          </p>
        </div>
      </section>

      <SemanticHubIntro sections={context.sections} />

      <SignalPanel
        eyebrow="Related scientific themes"
        title="How this cluster is organized"
        description="High-signal terms summarize the biological systems and adjacent outcomes most useful for exploring this topic."
        signals={context.signals}
      />


      <SignalPanel
        eyebrow="Workbook ecosystem signals"
        title="Semantic systems represented here"
        description="These normalized workbook signals add topic, pathway, and mechanism context without changing route contracts or implying clinical effect."
        signals={ecosystemSignals.length ? ecosystemSignals : context.signals}
      />

      {authorityAnchors.length > 0 ? (
        <section className="space-y-5">
          <div className="space-y-2">
            <p className="eyebrow-label">Authority anchors</p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">High-density profiles in this ecosystem</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {authorityAnchors.map((record: any) => {
              const isHerb = safeArray<any>(herbs).some((herb: any) => safeSlug(herb?.slug) === safeSlug(record?.slug))
              const fields = normalizeEcosystemFields(record)
              return (
                <Link key={`${isHerb ? 'herb' : 'compound'}-${record.slug}`} href={`/${isHerb ? 'herbs' : 'compounds'}/${record.slug}`} className="surface-subtle rounded-2xl border border-brand-900/10 p-4 transition hover:border-brand-700/30 hover:bg-white/60">
                  <p className="identity-kicker">Authority anchor</p>
                  <h3 className="mt-2 text-lg font-semibold text-ink">{record.name}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[...fields.topicClusters, ...fields.ecosystemTags].slice(0, 3).map((signal) => (
                      <span key={signal} className="chip-readable text-[10px] uppercase tracking-wide">{signal}</span>
                    ))}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      <EcosystemPanelGrid
        eyebrow="Mechanistically adjacent topics"
        title="Research adjacencies for this cluster"
        panels={getAdjacentEcosystemPanels(context.signals, 4)}
        limit={4}
      />

      <KnowledgeGraphLinks
        eyebrow="Often explored together"
        title="Continue through related hubs"
        links={context.links}
      />

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow-label">Profiles</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Related discovery cards</h2>
          </div>
          <span className="chip-readable">{filtered.length} matches</span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((compound) => (
            <Link
              key={compound.slug}
              href={`/compounds/${compound.slug}`}
              className="card-premium group p-6"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {isClean(compound.archetype) ? (
                    <span className="evidence-pill-strong">
                      {compound.archetype}
                    </span>
                  ) : null}

                  {safeArray<string>(compound.clusters).slice(0, 2).map((cluster: string) => (
                    <span key={cluster} className="chip-readable text-[10px] uppercase tracking-wide">
                      {cluster}
                    </span>
                  ))}
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-ink transition group-hover:text-brand-800">
                    {compound.name}
                  </h2>

                  <p className="mt-3 line-clamp-4 text-sm leading-7 text-[#46574d]">
                    {cleanSummary(compound.summary, 'compound')}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
