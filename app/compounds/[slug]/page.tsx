import { notFound } from 'next/navigation'
import Link from 'next/link'
import data from '../../../public/data/compounds.json'
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
  getEffects,
  getSources,
} from '@/lib/evidence-utils'
import {
  getEvidenceSnapshot,
  getRelatedCompounds,
} from '@/lib/semantic-runtime'
import { getRelatedRuntimeRecords } from '@/lib/related-runtime'
import { getFeaturedCollections } from '@/lib/collections'
import ProfileAuthoritySections from '@/components/profile-authority-sections'

export async function generateStaticParams() {
  return (data as any[])
    .filter((compound:any) => getRuntimeVisibility(compound).canRender)
    .map((compound:any) => ({ slug: compound.slug }))
}

export function generateMetadata({ params }: any) {
  const compound = (data as any[]).find((item:any) => item.slug === params.slug)

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

export default function CompoundPage({ params }: any) {
  const compounds = data as any[]

  const compound = compounds.find((item:any) => item.slug === params.slug)

  if (!compound || !getRuntimeVisibility(compound).canRender) {
    notFound()
  }

  const summary = cleanSummary(compound.summary || compound.description, 'compound')

  const effects = getEffects(compound)
    .map((effect:string) => formatDisplayLabel(effect))
    .filter(isClean)

  const mechanisms = list(compound.mechanisms)
    .map((item:any) => formatDisplayLabel(item))
    .filter(isClean)

  const evidenceLevel = normalizeEvidenceLevel(compound.evidence_tier)
  const safetyLevel = normalizeSafetyLevel(compound.safety)

  const snapshot = getEvidenceSnapshot(compound)

  const semanticRelated = getRelatedRuntimeRecords(compound, compounds, 6)
    .filter((item:any) => getRuntimeVisibility(item).canRender)

  const relatedCompounds = getRelatedCompounds(compound)
    .filter((item:any) => item.slug)
    .slice(0, 6)

  const featuredCollections = getFeaturedCollections(compound)

  const sources = getSources(compound)
    .map((source:any) => text(source))
    .filter(isClean)

  return (
    <>
      <ReadingProgress />

      <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 pb-28 sm:pb-32">
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

          <div className="flex flex-wrap gap-2">
            {effects.slice(0, 6).map((effect:string) => (
              <span key={effect} className="chip-readable">
                {effect}
              </span>
            ))}
          </div>
        </section>

        <ProfileAuthoritySections
          record={compound}
          entityType="compound"
          relatedRecords={semanticRelated}
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

        {relatedCompounds.length > 0 ? (
          <SectionBlock title="Related compounds and semantic neighbors">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {relatedCompounds.map((item:any) => (
                <Link
                  key={item.slug}
                  href={`/compounds/${item.slug}`}
                  className="card-premium group p-5"
                >
                  <div className="space-y-4">
                    <EvidenceBadgeGroup record={item} compact />

                    <div>
                      <h3 className="text-lg font-semibold text-ink transition group-hover:text-brand-700">
                        {formatDisplayLabel(item.name || item.slug)}
                      </h3>

                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#46574d]">
                        {cleanSummary(item.summary || item.description, 'compound')}
                      </p>
                    </div>
                  </div>
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
