import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCompoundBySlug, getCompounds, getHerbs } from '@/lib/runtime-data'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import TrustBar from '@/components/ui/TrustBar'
import ReadingProgress from '@/components/ui/ReadingProgress'
import SectionBlock from '@/components/ui/SectionBlock'
import CompoundHero from '@/components/ui/CompoundHero'
import EvidenceSnapshotCard from '@/components/ui/EvidenceSnapshotCard'
import { EvidenceBadgeGroup } from '@/components/evidence/evidence-badge'
import { CompactRelatedPathways } from '@/app/pathways/pathway-hub'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { cleanSummary, formatDisplayLabel, isClean, list, text } from '@/lib/display-utils'
import { buildMeta } from '@/lib/seo'
import {
  normalizeEvidenceLevel,
  normalizeSafetyLevel,
  getSources,
} from '@/lib/evidence-utils'
import { getEvidenceSnapshot } from '@/lib/semantic-runtime'
import { getComparisonRuntimeRecords, getRelatedRuntimeRecords, getStackRuntimeRecords } from '@/lib/related-runtime'
import { getEcosystemContinuityRecords, mergeEcosystemContinuityRecords } from '@/lib/ecosystem-continuity'
import { getFeaturedCollections } from '@/lib/collections'
import ProfileAuthoritySections from '@/components/profile-authority-sections'

export async function generateStaticParams() {
  const compounds = await getCompounds()

  return compounds
    .filter((compound:any) => getRuntimeVisibility(compound).canRender)
    .map((compound:any) => ({ slug: compound.slug }))
}

export async function generateMetadata({ params }: any) {
  const compound = await getCompoundBySlug(params.slug)

  if (!compound) return {}

  const visibility = getRuntimeVisibility(compound)

  const meta = buildMeta({
    title: `${formatDisplayLabel(compound.name)} Benefits, Effects & Safety | Hippie Scientist`,
    description: cleanSummary(compound.summary || compound.description, 'compound'),
    path: `/compounds/${compound.slug}`,
  })

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.url },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'article',
      url: meta.url,
      images: [meta.image],
    },
    robots: visibility.canIndex
      ? undefined
      : {
          index: false,
          follow: true,
        },
  }
}

export default async function CompoundPage({ params }: any) {
  const [compounds, herbs] = await Promise.all([getCompounds(), getHerbs()])

  const compound = await getCompoundBySlug(params.slug)

  if (!compound || !getRuntimeVisibility(compound).canRender) {
    notFound()
  }

  const summary = cleanSummary(compound.summary || compound.description, 'compound')

  const effects = list(compound.effects || compound.primary_effects || compound.primaryActions)
    .map((effect:string) => formatDisplayLabel(effect))
    .filter(isClean)

  const mechanisms = list(compound.mechanisms)
    .map((item:any) => formatDisplayLabel(item))
    .filter(isClean)

  const evidenceLevel = normalizeEvidenceLevel(compound.evidence_tier || compound.evidenceLevel || compound.evidence_grade)
  const safetyLevel = normalizeSafetyLevel(compound.safety || compound.safetyNotes)

  const snapshot = getEvidenceSnapshot(compound)

  const relatedCompounds = getRelatedRuntimeRecords(compound, compounds, 4)
    .filter((item:any) => getRuntimeVisibility(item).canRender)
    .map((item:any) => ({ ...item, entityType: 'compound' }))

  const relatedHerbs = getRelatedRuntimeRecords(compound, herbs, 4)
    .filter((item:any) => getRuntimeVisibility(item).canRender)
    .map((item:any) => ({ ...item, entityType: 'herb' }))

  const graphCandidateRecords = [
    ...compounds.map((item:any) => ({ ...item, entityType: 'compound' })),
    ...herbs.map((item:any) => ({ ...item, entityType: 'herb' })),
  ]
  const ecosystemContinuityRecords = getEcosystemContinuityRecords(compound, graphCandidateRecords, 6)
    .filter((item:any) => getRuntimeVisibility(item).canRender)

  const semanticRelated = mergeEcosystemContinuityRecords(
    [...relatedCompounds, ...relatedHerbs],
    ecosystemContinuityRecords,
    6,
  )

  const comparisonRecords = getComparisonRuntimeRecords(compound, graphCandidateRecords, 8)
    .filter((item:any) => getRuntimeVisibility(item).canRender)
  const stackRecords = getStackRuntimeRecords(compound, graphCandidateRecords, 6)
    .filter((item:any) => getRuntimeVisibility(item).canRender)

  const featuredCollections = getFeaturedCollections(compound)

  const sources = getSources(compound)
    .map((source:any) => text(source))
    .filter(isClean)

  return (
    <>
      <ReadingProgress />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 pb-24 sm:space-y-10 sm:py-10 sm:pb-32">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Compounds', href: '/compounds' },
            { label: compound.name },
          ]}
        />

        <TrustBar />

        <section className="space-y-5">
          <CompoundHero
            compound={{ ...compound, summary }}
            evidenceLevel={evidenceLevel}
            safetyLevel={safetyLevel}
          />

          <EvidenceBadgeGroup record={compound} />

          {effects.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {effects.slice(0, 6).map((effect:string) => (
                <span key={effect} className="chip-readable">
                  {effect}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        <ProfileAuthoritySections
          record={compound}
          entityType="compound"
          relatedRecords={semanticRelated}
          comparisonRecords={comparisonRecords}
          stackRecords={stackRecords}
          effects={effects}
          mechanisms={mechanisms}
          summary={summary}
        />

        <EvidenceSnapshotCard snapshot={snapshot} />

        <CompactRelatedPathways record={compound} />

        {featuredCollections.length > 0 ? (
          <SectionBlock title="Featured In Collections">
            <div className="flex flex-wrap gap-3">
              {featuredCollections.slice(0, 4).map((collection:any) => (
                <Link
                  key={collection.slug}
                  href={collection.href}
                  className="surface-subtle rounded-2xl border border-brand-900/10 px-4 py-3 text-sm font-semibold text-ink transition hover:border-brand-700/30 hover:bg-white/60"
                >
                  {collection.title}
                </Link>
              ))}
            </div>
          </SectionBlock>
        ) : null}

        {sources.length > 0 ? (
          <SectionBlock title="Research and source context">
            <ul className="space-y-2 text-sm leading-7 text-[#46574d]">
              {sources.slice(0, 10).map((source:string) => (
                <li key={source}>{source}</li>
              ))}
            </ul>
          </SectionBlock>
        ) : null}
      </main>
    </>
  )
}
