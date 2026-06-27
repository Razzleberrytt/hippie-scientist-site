/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { buildPageMetadata } from '../../../src/lib/seo'
import type { Metadata } from 'next'
import { getHerbs, getCompounds } from '../../../src/lib/runtime-data'
import type { RuntimeRecord } from '../../../src/types/content'
import { getRuntimeVisibility } from '../../../lib/runtime-visibility'
import DynamicComparerClient from '../../../src/components/compare/DynamicComparerClient'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import { isRestrictedRecord } from '../../../src/lib/restricted-ingredients'

export const metadata: Metadata = buildPageMetadata({
  title: 'Dynamic Ingredient Comparison Matrix',
  description: 'Select and compare any two herbs, compounds, or adaptogens side-by-side on evidence strength, mechanisms, safety profiles, and dosages.',
  path: '/compare/dynamic/',
})

type CompareClientItem = {
  slug: string
  name: string
  displayName: string
  summary?: string
  description?: string
  evidence_tier?: string
  evidenceLevel?: string
  confidence?: string
  safety?: string
  safety_flags?: string[]
  mechanism?: string
  mechanisms?: string[]
  pathways?: string[]
  onset?: string
  time_to_effect?: string
  duration?: string
  dosage?: string
  dose?: string
  preparation?: string
  preparations?: string
  best_for?: string | string[]
  bestFor?: string | string[]
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
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).slice(0, 12)
  const raw = asText(value)
  return raw ? raw.split(/[;,\n]+/).map(item => item.trim()).filter(Boolean).slice(0, 12) : []
}

function canUseRecord(record: RuntimeRecord) {
  if (isRestrictedRecord(record)) return false
  try {
    return getRuntimeVisibility(record).canRender
  } catch {
    return true
  }
}

function toCompareClientItem(record: RuntimeRecord): CompareClientItem {
  const slug = firstText(record.slug)
  const name = firstText(record.displayName, record.name, record.compoundName, slug)
  const mechanisms = toTextList(record.mechanisms)
  const bestFor = toTextList(record.bestFor)
  const bestForSnake = toTextList(record.best_for)
  return {
    slug,
    name,
    displayName: name,
    summary: firstText(record.summary, record.shortEarthySummary, record.generated_description),
    description: firstText(record.description, record.summary),
    evidence_tier: firstText(record.evidence_tier, record.evidenceLevel, record.confidence),
    evidenceLevel: firstText(record.evidenceLevel, record.evidence_tier, record.confidence),
    confidence: firstText(record.confidence, record.evidence_tier, record.evidenceLevel),
    safety: firstText(record.safety, record.safety_level, record.safetyNotes, record.safety_notes),
    safety_flags: toTextList(record.safety_flags),
    mechanism: firstText(record.mechanism, mechanisms[0]),
    mechanisms,
    pathways: toTextList(record.pathways),
    onset: firstText(record.onset),
    time_to_effect: firstText(record.time_to_effect),
    duration: firstText(record.duration),
    dosage: firstText(record.dosage, record.dose),
    dose: firstText(record.dose, record.dosage),
    preparation: firstText(record.preparation, record.preparations),
    preparations: firstText(record.preparations, record.preparation),
    best_for: bestForSnake.length ? bestForSnake : firstText(record.bestFor, record.primary_effects),
    bestFor: bestFor.length ? bestFor : firstText(record.best_for, record.primary_effects),
  }
}

export default async function DynamicComparePage() {
  const [rawHerbs, rawCompounds] = await Promise.all([getHerbs(), getCompounds()])
  const herbs = rawHerbs.filter(canUseRecord).map(toCompareClientItem).filter(item => item.slug)
  const compounds = rawCompounds.filter(canUseRecord).map(toCompareClientItem).filter(item => item.slug)

  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10'>
      <AuthorityJsonLd title="Dynamic Ingredient Comparison Matrix" description="Side-by-side scientific comparison of herbs, compounds, and active extracts." url="https://thehippiescientist.net/compare/dynamic/" type="MedicalWebPage" />
      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>Scientific Tradeoff Auditor</p>
        <h1 className='text-3xl font-bold tracking-tight text-ink sm:text-5xl mt-2'>Dynamic Comparison Matrix</h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>Audit potential options by choosing any two botanical extracts or compounds from our database. Compare safety profiles, receptor targets, evidence certitude, and standard preparations in real-time.</p>
      </section>
      <DynamicComparerClient herbs={herbs} compounds={compounds} />
    </div>
  )
}
