// @ts-nocheck
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { getHerbs, getCompounds } from '../../../src/lib/runtime-data'
import type { RuntimeRecord } from '../../../src/types/content'
import { getRuntimeVisibility } from '../../../lib/runtime-visibility'
import { SearchSkeleton } from '@/components/skeletons'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import { isRestrictedRecord } from '../../../src/lib/restricted-ingredients'

const PathwayExplorerClient = dynamic(
  () => import('../../../src/components/pathways/PathwayExplorerClient'),
  { loading: () => <SearchSkeleton /> }
)

export const metadata: Metadata = {
  title: 'Biological Pathway Connectivity Explorer',
  description: 'Explore biological receptor connections mapping target neurochemical networks (GABA, Dopamine, Serotonin, Acetylcholine) to modulating herbs and compounds.',
  robots: { index: false, follow: true },
}

type PathwayClientItem = {
  slug: string
  name: string
  displayName: string
  mechanism?: string
  mechanisms?: string[]
  pathway_bucket?: string
  pathways?: string[]
  description?: string
  summary?: string
  primary_effects?: string[]
  primaryEffects?: string[]
  effects?: string[]
  evidence_tier?: string
  evidenceLevel?: string
  confidence?: string
}

function asText(value: unknown) {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return ''
}

function firstText(...values: unknown[]) {
  return values.map(asText).find(Boolean) || ''
}

function toTextList(value: unknown) {
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).slice(0, 16)
  const raw = asText(value)
  return raw ? raw.split(/[;,\n]+/).map(item => item.trim()).filter(Boolean).slice(0, 16) : []
}

function canUseRecord(record: RuntimeRecord) {
  if (isRestrictedRecord(record)) return false
  try {
    return getRuntimeVisibility(record).canRender
  } catch {
    return true
  }
}

function toPathwayClientItem(record: RuntimeRecord): PathwayClientItem {
  const slug = firstText(record.slug)
  const name = firstText(record.displayName, record.name, record.compoundName, slug)
  const mechanisms = toTextList(record.mechanisms)

  return {
    slug,
    name,
    displayName: name,
    mechanism: firstText(record.mechanism, mechanisms[0]),
    mechanisms,
    pathway_bucket: firstText(record.pathway_bucket),
    pathways: toTextList(record.pathways),
    description: firstText(record.description),
    summary: firstText(record.summary, record.shortEarthySummary, record.generated_description),
    primary_effects: toTextList(record.primary_effects),
    primaryEffects: toTextList(record.primaryEffects),
    effects: toTextList(record.effects),
    evidence_tier: firstText(record.evidence_tier, record.evidenceLevel, record.confidence),
    evidenceLevel: firstText(record.evidenceLevel, record.evidence_tier, record.confidence),
    confidence: firstText(record.confidence, record.evidence_tier, record.evidenceLevel),
  }
}

export default async function PathwayExplorerPage() {
  const [rawHerbs, rawCompounds] = await Promise.all([getHerbs(), getCompounds()])

  const herbs = rawHerbs
    .filter(canUseRecord)
    .map(toPathwayClientItem)
    .filter(item => item.slug)

  const compounds = rawCompounds
    .filter(canUseRecord)
    .map(toPathwayClientItem)
    .filter(item => item.slug)

  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10'>
      <AuthorityJsonLd
        title="Biological Pathway Connectivity Explorer"
        description="Interact with neurochemical targets and find modulating herbs and compounds sorted by scientific evidence certainty."
        url="https://thehippiescientist.net/education/explorer/"
        type="MedicalWebPage"
      />

      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>Neuroscience Decoded</p>
        <h1 className='text-3xl font-bold tracking-tight text-ink sm:text-5xl mt-2'>
          Biological Pathway Explorer
        </h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          Navigate the synaptic connections between neurochemical receptor targets and modulating ingredients in our database. Map mechanisms of action to empirical outcomes.
        </p>
      </section>

      <PathwayExplorerClient herbs={herbs} compounds={compounds} />
    </div>
  )
}
