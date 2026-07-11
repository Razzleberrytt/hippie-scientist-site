import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { getHerbs, getCompounds } from '../../../src/lib/runtime-data'
import { getRuntimeVisibility } from '../../../lib/runtime-visibility'
import { SearchSkeleton } from '@/components/skeletons'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FaqJsonLd from '@/components/seo/FaqJsonLd'
import { buildPageMetadata } from '../../../src/lib/seo'

const PathwayExplorerClient = dynamic(
  () => import('../../../src/components/pathways/PathwayExplorerClient'),
  { loading: () => <SearchSkeleton /> }
)

const TITLE = 'Biological Pathway Explorer'
const DESCRIPTION =
  'Explore biological pathway connections across GABA, dopamine, serotonin, acetylcholine, inflammation, and stress-response systems, then use evidence profiles to verify what the mechanism does and does not prove.'

type ExplorerSourceRecord = Record<string, unknown>

type ExplorerPayloadRecord = {
  slug: string
  name: string
  displayName?: string
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

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/learn/explorer/',
  openGraphType: 'article',
})

const pathwayCards = [
  {
    title: 'Mechanism is a clue, not a verdict',
    body: 'A receptor, enzyme, transporter, or pathway connection can suggest where to investigate next. It does not prove benefit, safety, dose, or real-world effect by itself.',
  },
  {
    title: 'Look for converging evidence',
    body: 'The strongest profile usually combines plausible mechanism, human outcome data, dose realism, safety history, product quality, and a clear fit for the goal.',
  },
  {
    title: 'Watch for pathway duplication',
    body: 'If several products point at the same pathway, the stack can become harder to interpret. This matters most for sedating, stimulating, serotonergic, and blood-pressure patterns.',
  },
]

const explorerWorkflow = [
  'Pick a pathway or biological target to understand the mechanism landscape.',
  'Open the herb or compound profiles that appear relevant.',
  'Compare evidence quality, safety cautions, and realistic dose ranges.',
  'Use the interaction page before combining similar pathway targets.',
]

const faqItems = [
  {
    question: 'What is a biological pathway explorer?',
    answer:
      'It is an educational map that connects herbs and compounds to biological targets or systems. It helps readers understand mechanisms, but the full evidence profile is still needed before interpreting usefulness or safety.',
  },
  {
    question: 'Does a pathway match mean an ingredient works?',
    answer:
      'No. A pathway match only suggests a plausible mechanism. Human outcome data, dose realism, safety, and product quality determine whether the mechanism is practically meaningful.',
  },
  {
    question: 'How should I use pathway data safely?',
    answer:
      'Use pathway data to ask better questions, avoid accidental stacking, and decide which full profiles to read next. Do not treat the map as personalized medical or dosing advice.',
  },
]

function compactText(value: unknown, maxLength = 360): string | undefined {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  if (!text) return undefined
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text
}

function compactList(value: unknown, maxItems = 8): string[] | undefined {
  const values = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[;,|]/) : []
  const cleaned = values
    .map(item => compactText(item, 160))
    .filter((item): item is string => Boolean(item))
    .slice(0, maxItems)
  return cleaned.length > 0 ? cleaned : undefined
}

function compactExplorerRecord(record: ExplorerSourceRecord): ExplorerPayloadRecord | null {
  const slug = compactText(record.slug, 120)
  const name = compactText(record.displayName || record.name || record.slug, 120)
  if (!slug || !name) return null

  return {
    slug,
    name,
    displayName: compactText(record.displayName, 120),
    mechanism: compactText(record.mechanism, 360),
    mechanisms: compactList(record.mechanisms),
    pathway_bucket: compactText(record.pathway_bucket, 160),
    pathways: compactList(record.pathways),
    description: compactText(record.description, 420),
    summary: compactText(record.summary, 420),
    primary_effects: compactList(record.primary_effects),
    primaryEffects: compactList(record.primaryEffects),
    effects: compactList(record.effects),
    evidence_tier: compactText(record.evidence_tier, 40),
    evidenceLevel: compactText(record.evidenceLevel, 40),
    confidence: compactText(record.confidence, 40),
  }
}

function compactExplorerPayload(records: ExplorerSourceRecord[]): ExplorerPayloadRecord[] {
  return records
    .map(compactExplorerRecord)
    .filter((record): record is ExplorerPayloadRecord => Boolean(record))
}

export default async function PathwayExplorerPage() {
  const [rawHerbs, rawCompounds] = await Promise.all([getHerbs(), getCompounds()])

  const herbs = compactExplorerPayload(rawHerbs.filter((h: Record<string, unknown>) => {
    try {
      return getRuntimeVisibility(h).canRender
    } catch {
      return true
    }
  }))

  const compounds = compactExplorerPayload(rawCompounds.filter((c: Record<string, unknown>) => {
    try {
      return getRuntimeVisibility(c).canRender
    } catch {
      return true
    }
  }))

  return (
    <div className='mx-auto max-w-6xl space-y-10 px-4 py-8 sm:py-10'>
      <AuthorityJsonLd
        title={TITLE}
        description={DESCRIPTION}
        url="https://thehippiescientist.net/learn/explorer/"
        type="Article"
        breadcrumbs={[
          { name: 'Home', url: 'https://thehippiescientist.net/' },
          { name: 'Education', url: 'https://thehippiescientist.net/learn/' },
          { name: 'Pathway Explorer', url: 'https://thehippiescientist.net/learn/explorer/' },
        ]}
      />
      <FaqJsonLd items={faqItems} />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/learn' },
          { label: 'Pathway Explorer' },
        ]}
      />

      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Neuroscience decoded</p>
        <h1 className='mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl'>
          Biological pathway explorer for herbs, supplements, and compounds.
        </h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
          Use this explorer to map mechanisms across GABA, dopamine, serotonin, acetylcholine,
          inflammation, stress-response, and other biological systems. Then use the full evidence
          profiles to check what each pathway connection actually means.
        </p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/learn/gaba/' className='chip-readable hover:bg-white transition'>GABA pathway</Link>
          <Link href='/learn/interactions/' className='chip-readable hover:bg-white transition'>Interaction safety</Link>
          <Link href='/learn/efficacy-model/' className='chip-readable hover:bg-white transition'>Efficacy modeler</Link>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-3' aria-label='How to read pathway relationships'>
        {pathwayCards.map((card) => (
          <article key={card.title} className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
            <h2 className='text-base font-bold text-ink'>{card.title}</h2>
            <p className='mt-2 text-sm leading-6 text-muted'>{card.body}</p>
          </article>
        ))}
      </section>

      <section className='rounded-[2rem] border border-brand-900/10 bg-brand-50/60 p-6 shadow-sm sm:p-8'>
        <div className='max-w-3xl space-y-3'>
          <p className='eyebrow-label'>Evidence workflow</p>
          <h2 className='text-3xl font-semibold tracking-tight text-ink'>A better way to move from mechanism to decision</h2>
          <p className='text-sm leading-7 text-muted'>
            Pathway maps are useful for discovery, but they are only one layer of supplement evaluation.
            A pathway match tells you where to investigate next; it does not tell you whether a product is effective,
            safe, or appropriately dosed.
          </p>
        </div>
        <ol className='mt-6 grid gap-3 md:grid-cols-2'>
          {explorerWorkflow.map((step, index) => (
            <li key={step} className='rounded-2xl border border-brand-900/10 bg-white/80 p-4 text-sm leading-6 text-muted'>
              <span className='mr-2 font-bold text-brand-800'>{index + 1}.</span>{step}
            </li>
          ))}
        </ol>
      </section>

      <PathwayExplorerClient herbs={herbs} compounds={compounds} />

      <section className='rounded-2xl border border-brand-900/10 bg-white/90 p-6 shadow-sm'>
        <h2 className='text-2xl font-semibold tracking-tight text-ink'>FAQ</h2>
        <div className='mt-4 grid gap-4'>
          {faqItems.map((item) => (
            <article key={item.question} className='rounded-2xl border border-brand-900/10 bg-brand-50/40 p-4'>
              <h3 className='font-bold text-ink'>{item.question}</h3>
              <p className='mt-2 text-sm leading-7 text-muted'>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
