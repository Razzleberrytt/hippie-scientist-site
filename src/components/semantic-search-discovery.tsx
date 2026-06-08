'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { cleanSummary, formatDisplayLabel, isClean, list, unique } from '@/lib/display-utils'
import {
  decisionChipClass,
  decisionMetadataClusterClass,
  decisionMicroLabelClass,
  decisionStatusBadgeClass,
} from '@/lib/decision-primitives'

type SearchRecord = {
  slug?: string
  name?: string
  displayName?: string
  summary?: string
  description?: string
  entityType?: 'herb' | 'compound'
  evidence_tier?: string
  primary_effects?: string[]
  effects?: string[]
  mechanisms?: string[]
  pathways?: string[]
}

type SemanticSearchDiscoveryProps = {
  records: SearchRecord[]
}

function normalize(text = '') {
  return text.toLowerCase().trim()
}

function semanticTerms(record: SearchRecord) {
  return unique([
    record.name,
    record.displayName,
    ...list(record.primary_effects),
    ...list(record.effects),
    ...list(record.mechanisms),
    ...list(record.pathways),
  ]
    .map(formatDisplayLabel)
    .filter(isClean))
}

function recordHref(record: SearchRecord) {
  return `/${record.entityType === 'compound' ? 'compounds' : 'herbs'}/${record.slug}`
}

function evidenceClass(value = '') {
  const normalized = value.toLowerCase()

  if (normalized.includes('strong') || normalized.includes('clinical')) {
    return `${decisionStatusBadgeClass} border-emerald-800/15 bg-emerald-50/80 text-emerald-900`
  }

  if (normalized.includes('moderate') || normalized.includes('human')) {
    return `${decisionStatusBadgeClass} border-blue-800/15 bg-blue-50/70 text-blue-900`
  }

  return `${decisionStatusBadgeClass} border-brand-900/10 bg-white/80 text-[#5f6f66]`
}

export default function SemanticSearchDiscovery({ records }: SemanticSearchDiscoveryProps) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const normalized = normalize(query)

    if (!normalized) return records.slice(0, 12)

    return records
      .map((record) => {
        const terms = semanticTerms(record)
        const haystack = normalize(terms.join(' '))

        let score = 0

        if (haystack.includes(normalized)) score += 10
        if (normalize(record.name || '').includes(normalized)) score += 8
        if (normalize(record.displayName || '').includes(normalized)) score += 8

        terms.forEach((term) => {
          if (normalize(term).includes(normalized)) score += 2
        })

        return {
          record,
          score,
        }
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((item) => item.record)
  }, [query, records])

  const suggestions = [
    'Stress pathways',
    'Sleep support',
    'Cognitive support',
    'Adaptogens',
    'Inflammation',
    'GABA pathways',
  ]

  return (
    <section className="compact-section section-rhythm-balanced">
      <div className="space-y-3">
        <div className={decisionMetadataClusterClass}>
          <p className={`${decisionMicroLabelClass} text-brand-700`}>
            Semantic Discovery
          </p>
          <span className={decisionChipClass}>Research-aware exploration</span>
        </div>

        <h2 className="compact-heading">
          Explore by mechanisms, pathways, and evidence context.
        </h2>

        <p className="compact-copy">
          Search surfaces pathway-adjacent profiles, mechanism overlap, and semantic relationships instead of relying only on exact keyword matching.
        </p>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search stress pathways, cognition, inflammation, GABA..."
          className="w-full rounded-[1.4rem] border border-brand-900/10 bg-white/85 px-5 py-4 text-base shadow-sm backdrop-blur-xl"
        />

        <div className={decisionMetadataClusterClass}>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuery(suggestion)}
              className={`${decisionChipClass} transition hover:bg-white`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {results.map((record) => {
          const evidence = formatDisplayLabel(record.evidence_tier || 'Evidence Context')
          const signals = semanticTerms(record).slice(0, 3)

          return (
            <Link
              key={record.slug}
              href={recordHref(record)}
              className="compact-card group section-rhythm-compact"
            >
              <div className={decisionMetadataClusterClass}>
                <span className={evidenceClass(evidence)}>{evidence}</span>
                <span className={`${decisionStatusBadgeClass} border-brand-900/10 bg-brand-50/70 text-brand-800`}>
                  {record.entityType === 'compound' ? 'Compound' : 'Herb'}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="max-w-none break-words text-lg font-semibold leading-tight tracking-tight text-ink group-hover:text-brand-700">
                  {formatDisplayLabel(record.displayName || record.name || record.slug)}
                </h3>

                <p className="line-clamp-2 text-sm leading-6 text-[#46574d]">
                  {cleanSummary(record.summary || record.description || '', record.entityType === 'compound' ? 'compound' : 'herb')}
                </p>
              </div>

              {signals.length > 0 ? (
                <div className={`${decisionMetadataClusterClass} border-t border-brand-900/10 pt-3`}>
                  {signals.map((signal) => (
                    <span key={signal} className={decisionChipClass}>
                      {signal}
                    </span>
                  ))}
                </div>
              ) : null}
            </Link>
          )
        })}
      </div>
    </section>
  )
}