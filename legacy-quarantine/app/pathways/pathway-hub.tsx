import type { Metadata } from 'next'
import Link from 'next/link'
import { getCompounds, getHerbs } from '@/lib/runtime-data'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import {
  getPathwayLabel,
  getPathwaySignals,
  getRelatedPathwayRecords,
  getSupportedPathways,
  normalizePathway,
  type PathwaySlug,
} from '@/lib/pathways'
import { buildPageMetadata } from '@/lib/seo'
import { EvidenceBadgeGroup } from '@/components/evidence/evidence-badge'
import { EcosystemPanelGrid, KnowledgeGraphLinks, SemanticHubIntro, SignalPanel } from '@/components/semantic-hubs/semantic-hub-sections'
import { getAdjacentEcosystemPanels } from '@/lib/ecosystem-context'
import { getAuthorityAnchorRecords, normalizeEcosystemFields } from '@/lib/ecosystem-intelligence'

type RelatedPathwayLink = {
  label: string
  href: string
  description: string
}

type PathwayConfig = {
  slug: PathwaySlug
  title: string
  eyebrow: string
  summary: string
  clusters: string[]
  introSections: { title: string; body: string }[]
  related: RelatedPathwayLink[]
}

const configs: Record<'gaba' | 'dopamine' | 'inflammation', PathwayConfig> = {
  gaba: {
    slug: 'gaba',
    title: 'GABA Pathway Hub',
    eyebrow: 'Neurotransmitter cluster',
    summary: 'Explore herbs and compounds with workbook signals around GABA, calming, inhibitory tone, relaxation, and sleep-adjacent mechanisms.',
    clusters: ['GABAergic signaling', 'Inhibitory tone', 'Relaxation and sleep context', 'Calming botanicals and compounds'],
    introSections: [
      { title: 'Biological context', body: 'GABA is an inhibitory neurotransmitter system commonly used to frame calming, relaxation, arousal, and sleep-support research.' },
      { title: 'Research focus', body: 'This hub surfaces records with clean workbook signals for GABA, inhibitory tone, calming botanicals, relaxation, or sleep-adjacent mechanisms.' },
      { title: 'Mechanism overlap', body: 'GABA labels are discovery signals; profile evidence and safety details remain necessary for interpreting any specific herb or compound.' },
    ],
    related: [
      { label: 'Dopamine', href: '/pathways/dopamine', description: 'Motivation, focus, reward, and cognition-adjacent neurotransmitter signals.' },
      { label: 'Stress', href: '/guides/best-supplements-for-stress', description: 'Goal guide for cortisol, adaptation, anxiety, and stress-resilience context.' },
      { label: 'Sleep', href: '/goals/sleep', description: 'Decision guide for sleep quality, nighttime relaxation, and circadian support.' },
      { label: 'Recovery', href: '/goals/recovery', description: 'Recovery-adjacent inflammation, repair, mobility, and oxidative-stress context.' },
    ],
  },
  dopamine: {
    slug: 'dopamine',
    title: 'Dopamine Pathway Hub',
    eyebrow: 'Neurotransmitter cluster',
    summary: 'Explore records with existing signals around dopamine, reward, motivation, cognition, focus, and attention-related mechanisms.',
    clusters: ['Dopaminergic signaling', 'Reward and motivation', 'Cognitive performance', 'Focus and attention context'],
    introSections: [
      { title: 'Biological context', body: 'Dopamine-related research often intersects with reward, motivation, attention, movement, and cognitive-performance signaling.' },
      { title: 'Research focus', body: 'This hub groups records that expose dopamine, focus, cognition, motivation, nootropic, or attention-adjacent workbook signals.' },
      { title: 'Mechanism overlap', body: 'The page is a relationship map, not a claim that every associated profile changes dopamine in humans.' },
    ],
    related: [
      { label: 'GABA', href: '/pathways/gaba', description: 'Calming and inhibitory signaling that often frames sleep and relaxation context.' },
      { label: 'Inflammation', href: '/pathways/inflammation', description: 'Immune and oxidative-stress signals that can intersect with brain-health research.' },
      { label: 'Focus', href: '/goals/focus', description: 'Decision guide for attention, brain fog, and cognitive-support supplements.' },
    ],
  },
  inflammation: {
    slug: 'inflammation',
    title: 'Inflammation Pathway Hub',
    eyebrow: 'Inflammatory systems cluster',
    summary: 'Explore records with workbook signals around inflammatory tone, cytokines, immune activity, oxidative stress, and antioxidant mechanisms.',
    clusters: ['Inflammatory signaling', 'Cytokine and immune context', 'Oxidative stress', 'Antioxidant-response mechanisms'],
    introSections: [
      { title: 'Biological context', body: 'Inflammation research connects immune signaling, cytokine language, oxidative stress, tissue recovery, and mobility outcomes.' },
      { title: 'Research focus', body: 'Records appear here when workbook signals mention inflammatory tone, antioxidant response, immune activity, cytokines, or recovery-adjacent effects.' },
      { title: 'Mechanism overlap', body: 'Inflammatory-pathway labels support discovery and comparison; clinical relevance depends on each profile’s evidence maturity.' },
    ],
    related: [
      { label: 'GABA', href: '/pathways/gaba', description: 'Neurotransmitter and sleep-adjacent signals with calming pathway context.' },
      { label: 'Dopamine', href: '/pathways/dopamine', description: 'Motivation, focus, and cognition-adjacent neurotransmitter context.' },
      { label: 'Joint support', href: '/guides/best-supplements-for-joint-support', description: 'Goal guide for mobility and inflammation-adjacent supplement decisions.' },
    ],
  },
}

import type { RuntimeRecord } from '@/types/content'

function getRecordName(record: RuntimeRecord) {
  const raw = record as Record<string, unknown>
  return formatDisplayLabel((raw.displayName || raw.name || raw.slug) as string)
}

function getMechanisms(record: RuntimeRecord) {
  const raw = record as Record<string, unknown>
  return unique([
    ...list(raw.mechanisms),
    ...list(raw.mechanism),
    ...list(raw.pathways),
    ...list(raw.pathway_bucket),
  ]).filter(isClean)
}

function getEffects(record: RuntimeRecord) {
  const raw = record as Record<string, unknown>
  return unique([
    ...list(raw.primary_effects),
    ...list(raw.primaryEffects),
    ...list(raw.effects),
    ...list(raw.best_for),
    ...list(raw.bestFor),
  ]).filter(isClean)
}

function RecordCard({ record, href, type }: { record: RuntimeRecord; href: string; type: 'herb' | 'compound' }) {
  const name = getRecordName(record)
  const signals = getPathwaySignals(record).slice(0, 3)
  const summary = cleanSummary((record.summary || record.description || '') as string, type)

  if (!name) return null

  return (
    <Link href={href} className="card-premium group p-5">
      <div className="space-y-4">
        <EvidenceBadgeGroup record={record} compact />

        <div className="flex flex-wrap gap-2">
          {signals.map((signal) => (
            <span key={signal} className="chip-readable">
              {signal}
            </span>
          ))}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-ink transition group-hover:text-brand-700">
            {name}
          </h3>

          <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#46574d]">
            {summary}
          </p>
        </div>
      </div>
    </Link>
  )
}


function getPathwayConfig(pathway: PathwaySlug): PathwayConfig {
  const normalizedPathway = normalizePathway(pathway)
  return configs[normalizedPathway as keyof typeof configs] ?? configs.gaba
}

export function generatePathwayMetadata(pathway: PathwaySlug): Metadata {
  const config = getPathwayConfig(pathway)
  return buildPageMetadata({
    title: `${config.title} | The Hippie Scientist`,
    description: config.summary,
    path: `/pathways/${config.slug}`,
    openGraphType: 'website',
  })
}

export async function PathwayHub({ pathway }: { pathway: PathwaySlug }) {
  const config = getPathwayConfig(pathway)
  const [herbs, compounds] = await Promise.all([getHerbs(), getCompounds()])

  const relatedHerbs = (getRelatedPathwayRecords(herbs, pathway) as RuntimeRecord[])
    .filter((record: RuntimeRecord) => getRuntimeVisibility(record).canRender)
    .slice(0, 9)

  const relatedCompounds = (getRelatedPathwayRecords(compounds, pathway) as RuntimeRecord[])
    .filter((record: RuntimeRecord) => getRuntimeVisibility(record).canRender)
    .slice(0, 9)

  const relatedRecords = [...relatedHerbs, ...relatedCompounds]
  const ecosystemSignals = unique(relatedRecords.flatMap((record: RuntimeRecord) => {
    const fields = normalizeEcosystemFields(record)
    return [...fields.topicClusters, ...fields.pathwayEcosystems, ...fields.mechanismEcosystems]
  })).slice(0, 12)
  const authorityAnchors = getAuthorityAnchorRecords(relatedRecords, 4) as unknown as RuntimeRecord[]
  const mechanisms = unique([...relatedRecords.flatMap(getMechanisms), ...ecosystemSignals]).slice(0, 12)
  const effects = unique(relatedRecords.flatMap(getEffects)).slice(0, 12)
  const supportedRelated = config.related.filter((item) => item.href.startsWith('/pathways/') || item.href.startsWith('/goals/') || item.href.startsWith('/guides/'))

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-8 shadow-card">
        <div className="max-w-4xl space-y-5">
          <p className="eyebrow-label">{config.eyebrow}</p>

          <h1 className="heading-premium text-ink">{config.title}</h1>

          <p className="detail-reading text-lg text-[#46574d]">{config.summary}</p>

          <div className="flex flex-wrap gap-2">
            {config.clusters.map((cluster) => (
              <span key={cluster} className="chip-readable">
                {cluster}
              </span>
            ))}
          </div>
        </div>
      </section>

      <SemanticHubIntro sections={config.introSections} />

      <SignalPanel
        eyebrow="Pathway relevance"
        title="Signals used to organize this hub"
        description="These themes summarize the biological relationships behind this page and help readers move into adjacent profiles, goals, and collections."
        signals={config.clusters}
      />

      <section className="grid gap-5 md:grid-cols-2">
        <div className="card-premium p-6">
          <p className="eyebrow-label">Mechanism clusters</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {mechanisms.length > 0 ? mechanisms.map((mechanism) => (
              <span key={mechanism} className="chip-readable">{mechanism}</span>
            )) : <p className="text-sm leading-7 text-[#46574d]">Mechanism chips appear when matching workbook records expose clean pathway signals.</p>}
          </div>
        </div>

        <div className="card-premium p-6">
          <p className="eyebrow-label">Associated effects</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {effects.length > 0 ? effects.map((effect) => (
              <span key={effect} className="chip-readable">{effect}</span>
            )) : <p className="text-sm leading-7 text-[#46574d]">Effect chips appear when matching workbook records expose clean associated-effect signals.</p>}
          </div>
        </div>
      </section>


      {authorityAnchors.length > 0 ? (
        <section className="card-premium p-6">
          <div className="space-y-2">
            <p className="eyebrow-label">Authority supernodes</p>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">High-density anchors for this pathway</h2>
            <p className="text-sm leading-7 text-[#46574d]">These profiles provide semantic navigation centers for the pathway without implying that all adjacent records share the same clinical evidence.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {authorityAnchors.map((record: RuntimeRecord) => (
              <Link key={text(record.slug) || getRecordName(record)} href={`/${relatedHerbs.some((herb: RuntimeRecord) => text(herb.slug) === text(record.slug)) ? 'herbs' : 'compounds'}/${text(record.slug)}`} className="chip-readable transition hover:border-brand-700/30 hover:bg-white/70">
                {getRecordName(record)}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <EcosystemPanelGrid
        eyebrow="Related biological systems"
        title="Adjacent systems to keep in view"
        panels={getAdjacentEcosystemPanels([...config.clusters, ...mechanisms, ...effects], 4)}
        limit={4}
      />

      <KnowledgeGraphLinks
        eyebrow="Scientific discovery graph"
        title="Related pathways and outcome hubs"
        links={supportedRelated}
      />

      {relatedHerbs.length > 0 ? (
        <section className="space-y-5">
          <div className="space-y-2">
            <p className="eyebrow-label">Botanical records</p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Herbs related to {getPathwayLabel(pathway)}</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {relatedHerbs.map((record: RuntimeRecord) => (
              <RecordCard key={record.slug} record={record} href={`/herbs/${record.slug}`} type="herb" />
            ))}
          </div>
        </section>
      ) : null}

      {relatedCompounds.length > 0 ? (
        <section className="space-y-5">
          <div className="space-y-2">
            <p className="eyebrow-label">Compound records</p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Compounds related to {getPathwayLabel(pathway)}</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {relatedCompounds.map((record: RuntimeRecord) => (
              <RecordCard key={record.slug} record={record} href={`/compounds/${record.slug}`} type="compound" />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

export function CompactRelatedPathways({ record }: { record: RuntimeRecord }) {
  const pathways = getSupportedPathways(record)
    .filter((pathway) => ['gaba', 'dopamine', 'inflammation'].includes(pathway))
    .slice(0, 4)

  if (!pathways.length) return null

  return (
    <section className="card-premium p-5">
      <div className="space-y-2">
        <p className="eyebrow-label">Mechanism graph</p>
        <h2 className="text-xl font-semibold text-ink">Related Pathways</h2>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {pathways.map((pathway) => (
          <Link key={pathway} href={`/pathways/${pathway}`} className="chip-readable transition hover:border-brand-700/30 hover:bg-white/70">
            {getPathwayLabel(pathway)}
          </Link>
        ))}
      </div>
    </section>
  )
}
