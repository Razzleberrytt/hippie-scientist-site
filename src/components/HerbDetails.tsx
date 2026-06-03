import React from 'react'
import type { Herb } from '../types'
import { pick } from '../lib/present'
import { cleanLine } from '../lib/pretty'
import { splitField } from '../utils/herb'

const normalizeText = (value: unknown): string => {
  if (Array.isArray(value)) {
    const joined = normalizeList(value).join(', ')
    return joined
  }
  if (typeof value === 'string') {
    const cleaned = cleanLine(value)
    if (cleaned) return cleaned
  }
  if (typeof value === 'number') {
    return String(value)
  }
  if (value && typeof value === 'object') {
    const values = Object.values(value as Record<string, unknown>)
    const text = normalizeList(values).join(', ')
    if (text) return text
  }
  return ''
}

const normalizeList = (value: unknown): string[] => {
  const results: string[] = []
  const push = (entry: string) => {
    const cleaned = cleanLine(entry)
      .replace(/^[-•·\u2022\u2023\u25E6\u2043\u2219]+\s*/, '')
      .trim()
    if (cleaned) {
      const key = cleaned.toLowerCase()
      if (!results.some(item => item.toLowerCase() === key)) {
        results.push(cleaned)
      }
    }
  }

  const visit = (input: unknown) => {
    if (!input) return
    if (Array.isArray(input)) {
      input.forEach(visit)
      return
    }
    if (typeof input === 'string') {
      const normalized = input
        .replace(/\r?\n+/g, ';')
        .replace(/[•·\u2022\u2023\u25E6\u2043\u2219]+/g, ';')
      const parts = splitField(normalized)
      if (parts.length > 1) {
        parts.forEach(part => visit(part))
      } else {
        push(normalized)
      }
      return
    }
    if (typeof input === 'number') {
      push(String(input))
      return
    }
    if (input && typeof input === 'object') {
      const values = Object.values(input as Record<string, unknown>)
      if (values.length) {
        values.forEach(visit)
      }
      return
    }
  }

  visit(value)
  return results
}

const firstText = (...values: unknown[]): string => {
  for (const value of values) {
    const list = normalizeList(value)
    if (list.length) {
      return list.join(', ')
    }
    const text = normalizeText(value)
    if (text) return text
  }
  return ''
}

const mergeLists = (...values: unknown[]): string[] => {
  const seen = new Set<string>()
  const result: string[] = []
  values.forEach(value => {
    normalizeList(value).forEach(item => {
      const key = item.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        result.push(item)
      }
    })
  })
  return result
}

export function normalizeHerbDetails(herb: Herb) {
  const effects = firstText(herb.effects, pick.effects(herb))
  const description = firstText(herb.description, pick.description(herb))
  const categories = mergeLists(
    herb.categories,
    herb.category,
    herb.subcategory,
    herb.category_label
  )
  const tagLabels = mergeLists(herb.tags, pick.tags(herb))
  const tags = mergeLists(categories, tagLabels)
  const region = firstText(
    herb.region,
    pick.region(herb),
    mergeLists(herb.regiontags).join(', '),
    (herb as any).regionNotes
  )
  const active_compounds = mergeLists(
    herb.active_compounds,
    herb.compounds,
    (herb as any).compoundsDetailed,
    (herb as any).activeconstituents,
    ((herb as any).activeConstituents || []).map((entry: any) => entry?.name)
  )
  const preparation = firstText(
    herb.preparation,
    herb.preparations,
    (herb as any).preparationsText,
    pick.preparations(herb)
  )
  const dosage = firstText(herb.dosage, (herb as any).dosage_notes, pick.dosage(herb))
  const contraindications = firstText(
    herb.contraindications,
    (herb as any).contraindicationsText,
    pick.contraind(herb)
  )
  const interactions = firstText(
    herb.interactions,
    (herb as any).interactionsText,
    (herb as any).drugInteractions,
    pick.interactions(herb)
  )
  const legal = [
    firstText(herb.legal, herb.legalstatus, (herb as any).legalStatus, pick.legalstatus(herb)),
    firstText(herb.legalnotes, (herb as any).legalnotes),
  ]
    .filter(Boolean)
    .join(' — ')
  const sources = mergeLists(herb.sources, pick.sources(herb))

  return {
    effects,
    description,
    categories,
    tags,
    region,
    active_compounds,
    preparation,
    dosage,
    contraindications,
    interactions,
    legal,
    sources,
  }
}

const getEvidenceTierClass = (tier: string) => {
  switch (tier.toLowerCase()) {
    case 'high':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
    case 'moderate':
    case 'medium':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/25'
    default:
      return 'bg-white/8 text-white/55 border-white/15'
  }
}

export default function HerbDetails({ herb }: { herb: Herb }) {
  const details = normalizeHerbDetails(herb)
  const rows: Array<[string, React.ReactNode]> = []

  if (details.effects) rows.push(['Effects', details.effects])
  if (details.description) rows.push(['Description', details.description])

  if (details.tags.length) {
    rows.push([
      'Tags',
      <div className='flex flex-wrap gap-2'>
        {details.tags.map((t, i) => (
          <span key={i} className='pill focus-glow bg-white/10 text-white/80'>
            {t}
          </span>
        ))}
      </div>,
    ])
  }

  if (details.region) rows.push(['Region', details.region])

  if (details.active_compounds.length)
    rows.push([
      'Active Compounds',
      <div className='flex flex-wrap gap-1'>
        {details.active_compounds.map(compound => (
          <span
            key={compound}
            className='inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[0.68rem] font-medium text-white/55'
          >
            {compound}
          </span>
        ))}
      </div>,
    ])

  if (details.preparation) rows.push(['Preparation & Forms', details.preparation])

  if (details.dosage) rows.push(['Dosage', details.dosage])

  if (details.contraindications) rows.push(['Contraindications', details.contraindications])

  if (details.interactions) rows.push(['Interactions', details.interactions])

  if (details.legal) rows.push(['Legal', details.legal])

  if (details.sources.length)
    rows.push([
      'Sources',
      <ul className='space-y-2'>
        {details.sources.map((s, i) => (
          <li key={i} className='border-l-2 border-white/12 pl-3 text-xs font-mono text-white/40'>
            {/^(https?:)/i.test(s) ? (
              <a className='link' href={s} target='_blank' rel='noopener noreferrer'>
                {s}
              </a>
            ) : (
              s
            )}
          </li>
        ))}
      </ul>,
    ])

  if (!rows.length) return null

  const herbName = firstText(
    herb.name,
    herb.common,
    herb.commonName,
    herb.slug?.replace(/-/g, ' ')
  )
  const latinName = firstText(herb.latinName, herb.scientific, herb.scientificname)
  const evidenceTier = firstText(herb.evidence_tier, herb.evidenceLevel, herb.confidence)
  const summary = firstText(herb.summary, details.description)
  const confidence = firstText(herb.confidence, herb.evidenceLevel)
  const primaryEffects = normalizeList((herb as any).primary_effects ?? herb.effects)

  return (
    <div className='space-y-8'>
      <section className='grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-start'>
        <div className='space-y-3'>
          {herbName ? <h1 className='font-display text-4xl font-normal sm:text-5xl'>{herbName}</h1> : null}
          {latinName ? <p className='mt-1 font-mono text-sm italic text-white/45'>{latinName}</p> : null}
          {evidenceTier ? (
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize ${getEvidenceTierClass(
                evidenceTier
              )}`}
            >
              {evidenceTier} evidence
            </span>
          ) : null}
          {summary ? <p className='max-w-2xl text-sm leading-relaxed text-white/80'>{summary}</p> : null}
        </div>

        <aside className='rounded-xl border border-white/10 bg-white/[0.02] p-4'>
          <h2 className='mb-3 text-lg font-semibold text-white'>Key Stats</h2>
          <dl className='space-y-3 text-sm'>
            <div className='flex items-start justify-between gap-4'>
              <dt className='text-white/55'>Compound count</dt>
              <dd className='font-mono text-white/85'>{details.active_compounds.length || '—'}</dd>
            </div>
            <div className='flex items-start justify-between gap-4'>
              <dt className='text-white/55'>Primary effects</dt>
              <dd className='text-right text-white/85'>
                {primaryEffects.length ? primaryEffects.slice(0, 3).join(', ') : '—'}
              </dd>
            </div>
            <div className='flex items-start justify-between gap-4'>
              <dt className='text-white/55'>Confidence</dt>
              <dd className='capitalize text-white/85'>{confidence || '—'}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <hr className='my-8 border-white/8' />

      <section className='space-y-6'>
        {rows.map(([k, v], index) => (
          <React.Fragment key={k}>
            <div>
              <h2 className='mb-3 text-lg font-semibold text-white'>{k}</h2>
              <div className='text-white/85'>{v}</div>
            </div>
            {index < rows.length - 1 ? <hr className='my-8 border-white/8' /> : null}
          </React.Fragment>
        ))}
      </section>
    </div>
  )
}
