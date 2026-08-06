import type { Metadata } from 'next'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import BotanicalActivityAtlasClient, { type BotanicalAtlasRecord } from '@/components/atlas/BotanicalActivityAtlasClient'
import { getHerbs } from '@/lib/runtime-data'
import { getRuntimeVisibility } from '../../../lib/runtime-visibility'
import { buildToolPageSchemaGraph } from '@/lib/schema-graph'
import { buildPageMetadata, SITE_URL } from '@/lib/seo'
import {
  normalizeCompoundClass,
  normalizeEffect,
  normalizeEvidence,
  normalizeIntensity,
  normalizeSafetySignal,
  uniqueNormalized,
} from '@/lib/botanical-atlas-taxonomy'
import type { RuntimeRecord } from '@/types/content'

export const metadata: Metadata = buildPageMetadata({
  title: 'Botanical Activity Atlas – Effects, Compounds & Safety',
  description:
    'Compare pharmacologically active botanicals by effects, active compounds, noticeability, evidence strength, timing, and safety signals.',
  path: '/tools/botanical-activity-atlas',
})

const list = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean)
  if (typeof value === 'string') return value.split(/[;,|]/).map((item) => item.trim()).filter(Boolean)
  return []
}

const text = (...values: unknown[]): string => {
  const value = values.find((item) => typeof item === 'string' && item.trim())
  return typeof value === 'string' ? value.trim() : ''
}

const toAtlasRecord = (herb: RuntimeRecord): BotanicalAtlasRecord => {
  const rawEffects = list(herb.primary_effects ?? herb.effects ?? herb.primaryActions)
  const rawClasses = list(herb.compoundClasses ?? herb.pharmCategories ?? herb.compoundClass)
  const rawSafety = list(herb.safety_flags ?? herb.interactionTags ?? herb.contraindications ?? herb.interactions)

  return {
    slug: herb.slug,
    name: text(herb.displayName, herb.name, herb.commonName, herb.common, herb.slug.replaceAll('-', ' ')),
    scientificName: text(herb.scientificName, herb.scientificname, herb.latinName) || undefined,
    effects: uniqueNormalized(rawEffects, normalizeEffect),
    compounds: list(herb.activeCompounds ?? herb.active_compounds ?? herb.compounds ?? herb.activeconstituents),
    compoundClasses: uniqueNormalized(rawClasses, normalizeCompoundClass),
    evidence: normalizeEvidence(text(herb.evidence_tier, herb.evidenceTier, herb.evidence_grade, herb.evidenceLevel)),
    intensity: normalizeIntensity(text(herb.intensityLabel, herb.intensityClean, herb.intensityLevel, herb.intensity)),
    safety: uniqueNormalized(rawSafety, normalizeSafetySignal),
    onset: text(herb.time_to_effect, herb.onset) || undefined,
    duration: text(herb.duration) || undefined,
  }
}

export default async function BotanicalActivityAtlasPage() {
  const rawHerbs = await getHerbs()
  const herbs = rawHerbs
    .filter((herb: RuntimeRecord) => {
      try {
        return getRuntimeVisibility(herb).canRender
      } catch {
        return true
      }
    })
    .map(toAtlasRecord)
    .filter((herb: BotanicalAtlasRecord) => herb.effects.length || herb.compounds.length || herb.safety.length)
    .sort((a: BotanicalAtlasRecord, b: BotanicalAtlasRecord) => a.name.localeCompare(b.name))

  const schemaGraph = buildToolPageSchemaGraph({
    path: '/tools/botanical-activity-atlas',
    title: 'Botanical Activity Atlas',
    description:
      'An interactive comparison of active botanicals by constituent chemistry, effect profile, evidence, noticeability, timing, and safety signals.',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Tools', url: `${SITE_URL}/tools/` },
      { name: 'Botanical Activity Atlas', url: `${SITE_URL}/tools/botanical-activity-atlas/` },
    ],
    faqQuestions: [
      {
        question: 'What counts as an active botanical?',
        answer:
          'The atlas includes botanicals with constituents that may produce measurable physiological or psychological effects. Active does not necessarily mean intoxicating, strongly noticeable, effective, or safe.',
      },
      {
        question: 'Does a high noticeability rating mean a botanical works better?',
        answer:
          'No. Noticeability describes how apparent an effect may be, while evidence strength describes how confidently an effect is supported. A noticeable product can still have weak evidence or an unfavorable safety profile.',
      },
      {
        question: 'Can the atlas determine whether a botanical is safe for me?',
        answer:
          'No. It is an educational comparison tool. Medication use, health conditions, pregnancy, product quality, dose, and combinations can substantially change risk.',
      },
    ],
  })

  return (
    <main className='mx-auto max-w-7xl space-y-8 px-4 py-8 sm:py-10'>
      <SchemaGraphScript graph={schemaGraph} />

      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>Interactive Research Tool</p>
        <h1 className='mt-2 text-3xl font-bold tracking-tight text-ink sm:text-5xl'>Botanical Activity Atlas</h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          Explore which botanicals contain pharmacologically active compounds, what effects they are associated with, how noticeable those effects may be, how strong the evidence is, and which safety signals deserve attention.
        </p>
      </section>

      <section className='grid gap-4 md:grid-cols-3'>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='font-bold text-ink'>Activity is not efficacy</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>A compound can affect a receptor, enzyme, or pathway without producing a useful real-world outcome.</p>
        </article>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='font-bold text-ink'>Noticeability is not quality</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>Strong sensations may reflect stimulation, sedation, toxicity, side effects, or dose—not superior benefits.</p>
        </article>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='font-bold text-ink'>Labels are normalized</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>Related source terms are grouped into consistent effect, evidence, chemistry, noticeability, and safety categories.</p>
        </article>
      </section>

      <BotanicalActivityAtlasClient records={herbs} />

      <section className='rounded-2xl border border-amber-900/15 bg-amber-50/60 p-5 text-xs leading-relaxed text-amber-950'>
        <p className='font-bold'>Educational use only</p>
        <p className='mt-1.5'>This atlas summarizes structured reference data and cannot establish product identity, dose, purity, personal suitability, or clinical safety. Review medication and health-condition interactions with a qualified clinician or pharmacist.</p>
      </section>
    </main>
  )
}
