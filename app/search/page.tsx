'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'
import compoundsSummaryData from '@/public/data/compounds-summary.json'
import herbsSummaryData from '@/public/data/herbs-summary.json'
import { cleanSummary, formatDisplayLabel, isClean, labelize, list, text, unique } from '@/lib/display-utils'
import {
  decisionChipClass,
  decisionMetadataClusterClass,
  decisionMetricShellClass,
  decisionMicroLabelClass,
  decisionStatusBadgeClass,
  normalizeDecisionEvidence,
  normalizeDecisionSafety,
} from '@/lib/decision-primitives'
import { getSemanticOrchestrationSignals } from '@/lib/semantic-orchestration'

type SearchType = 'Herb' | 'Compound'
type FilterType = 'All' | 'Herb' | 'Compound'
type SearchIntent = 'general' | 'evidence' | 'safety' | 'mechanism' | 'comparison'

type SearchItem = {
  slug: string
  name: string
  type: SearchType
  href: string
  summary: string
  effects: string[]
  evidence: string
  safety: string
  quality: string
  searchText: string
  authorityScore: number
  discoveryScore: number
  evidenceScore: number
  mechanismScore: number
  ecosystemScore: number
  safetyPenalty: number
  uncertaintyPenalty: number
  translationalPenalty: number
}

type DiscoveryPath = {
  label: string
  query: string
  description: string
}

const discoveryPaths: DiscoveryPath[] = [
  {
    label: 'Stress support',
    query: 'stress',
    description: 'Calm, adaptation, and safety context before choosing a profile.',
  },
  {
    label: 'Sleep',
    query: 'sleep',
    description: 'Wind-down, sleep quality, recovery, and next-day fit.',
  },
  {
    label: 'Cognition',
    query: 'cognition',
    description: 'Memory, mental performance, and mechanism-oriented evidence.',
  },
  {
    label: 'Inflammation',
    query: 'inflammation',
    description: 'Inflammatory, antioxidant, and pain-adjacent pathways.',
  },
  {
    label: 'Energy',
    query: 'energy',
    description: 'Fatigue, vitality, and stimulant-adjacent safety signals.',
  },
  {
    label: 'Focus',
    query: 'focus',
    description: 'Attention, fatigue, and non-jittery support paths.',
  },
  {
    label: 'Recovery',
    query: 'recovery',
    description: 'Sleep, soreness, stress load, and practical context.',
  },
]

const filterOptions: FilterType[] = ['All', 'Herb', 'Compound']

function getName(item: any) {
  return formatDisplayLabel(item.displayName) || formatDisplayLabel(item.name) || formatDisplayLabel(item.slug)
}

function getSummary(item: any, type: SearchType) {
  const summary =
    item.short_earthy_summary ||
    item.shortEarthySummary ||
    item.summaryShort ||
    item.summary ||
    item.coreInsight ||
    item.hero ||
    item.description

  return cleanSummary(summary, type === 'Herb' ? 'herb' : 'compound')
}

function getEffects(item: any) {
  return unique([
    ...list(item.primary_effects),
    ...list(item.primaryEffects),
    ...list(item.primaryActions),
    ...list(item.effects),
    ...list(item.mechanisms),
    ...list(item.primaryDomain),
  ])
    .filter(isClean)
    .slice(0, 4)
}

function getEvidence(item: any) {
  return normalizeDecisionEvidence(
    item.evidence_tier ||
      item.evidenceTier ||
      item.safety?.evidenceTier ||
      item.evidence_grade ||
      item.evidenceLevel ||
      item.confidence ||
      item.summary_quality,
    'Needs review'
  )
}

function getSafety(item: any) {
  return normalizeDecisionSafety(
    item.safety_level ||
      item.safetyLevel ||
      item.safety?.confidence ||
      item.safetyNotes ||
      item.confidenceTier ||
      item.profile_status,
    { hasSafetyNotes: Boolean(item.safetyNotes || item.safety_notes || item.safety) }
  )
}

function getQuality(item: any) {
  return labelize(item.profile_status || item.summary_quality || item.review_status || item.status || item.confidence, 'Profile Review')
}

function typeClass(type: SearchType) {
  return type === 'Herb'
    ? `${decisionStatusBadgeClass} border-brand-700/10 bg-brand-50 text-brand-800`
    : `${decisionStatusBadgeClass} border-blue-700/10 bg-blue-50 text-blue-800`
}

function compareAuthority(a: SearchItem, b: SearchItem) {
  if (b.discoveryScore !== a.discoveryScore) return b.discoveryScore - a.discoveryScore
  if (b.authorityScore !== a.authorityScore) return b.authorityScore - a.authorityScore
  return a.name.localeCompare(b.name)
}

function getSearchIntent(query: string): SearchIntent {
  const value = query.toLowerCase()

  if (/safe|safety|risk|avoid|interaction|contraindication|warning|pregnancy|side effect/.test(value)) return 'safety'
  if (/evidence|study|studies|clinical|human|trial|meta|systematic|research/.test(value)) return 'evidence'
  if (/mechanism|pathway|receptor|target|how does|works|action|bioavailability/.test(value)) return 'mechanism'
  if (/compare|comparison|versus|vs\.?|alternative|similar/.test(value)) return 'comparison'

  return 'general'
}

function weightedSearchScore(item: SearchItem, relevanceScore: number, intent: SearchIntent) {
  if (intent === 'evidence') {
    return relevanceScore * 0.58 + item.evidenceScore * 0.18 + item.authorityScore * 0.16 + item.discoveryScore * 0.08
  }

  if (intent === 'safety') {
    return relevanceScore * 0.58 + (1 - item.safetyPenalty) * 0.18 + item.authorityScore * 0.12 + (1 - item.uncertaintyPenalty) * 0.12
  }

  if (intent === 'mechanism') {
    return relevanceScore * 0.56 + item.mechanismScore * 0.2 + item.ecosystemScore * 0.14 + item.discoveryScore * 0.1
  }

  if (intent === 'comparison') {
    return relevanceScore * 0.54 + item.ecosystemScore * 0.18 + item.discoveryScore * 0.14 + item.authorityScore * 0.1 + (1 - item.translationalPenalty) * 0.04
  }

  return relevanceScore * 0.7 + item.discoveryScore * 0.2 + item.authorityScore * 0.1
}

function normalizeItem(item: any, type: SearchType): SearchItem | null {
  const slug = text(item.slug || item.id)
  if (!slug) return null

  const name = getName(item)
  if (!name || !isClean(name)) return null

  const summary = getSummary(item, type)
  const effects = getEffects(item)
  const evidence = getEvidence(item)
  const safety = getSafety(item)
  const quality = getQuality(item)
  const href = type === 'Herb' ? `/herbs/${slug}` : `/compounds/${slug}`
  const orchestration = getSemanticOrchestrationSignals(item)
  const aliases = list(item.aliases).join(' ')

  return {
    slug,
    name,
    type,
    href,
    summary,
    effects,
    evidence,
    safety,
    quality,
    authorityScore: orchestration.authorityScore,
    discoveryScore: orchestration.discoveryScore,
    evidenceScore: orchestration.evidenceScore,
    mechanismScore: orchestration.mechanismDensity,
    ecosystemScore: orchestration.ecosystemDensity,
    safetyPenalty: orchestration.safetyPenalty,
    uncertaintyPenalty: orchestration.uncertaintyPenalty,
    translationalPenalty: orchestration.translationalPenalty,
    searchText: [name, slug, aliases, summary, effects.join(' '), evidence, safety, quality].join(' '),
  }
}

function SearchMetric({ label, value }: { label: string; value?: string }) {
  if (!value) return null

  return (
    <div className={decisionMetricShellClass}>
      <p className={`${decisionMicroLabelClass} text-[#68786f]`}>{label}</p>
      <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-[#26382f]">{value}</p>
    </div>
  )
}

function ResultCard({ item }: { item: SearchItem }) {
  const bestFor = item.effects.slice(0, 2).join(' • ') || 'Research context'
  const mechanisms = item.effects.slice(2, 4)

  return (
    <Link
      href={item.href}
      className="group flex h-full min-h-[15rem] flex-col rounded-[1.3rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand-700/20 hover:bg-white hover:shadow-[var(--shadow-card-calm)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 sm:min-h-[16rem] sm:p-5"
    >
      <div className="flex flex-1 flex-col">
        <div className={decisionMetadataClusterClass}>
          <span className={typeClass(item.type)}>{item.type}</span>
        </div>

        <div className="mt-4 flex min-w-0 items-start justify-between gap-3">
          <h2 className="min-w-0 break-words text-[1.3rem] font-semibold leading-tight tracking-tight text-ink transition group-hover:text-brand-800 sm:text-2xl">
            {item.name}
          </h2>
        </div>

        <p className="mt-3 line-clamp-2 text-[0.95rem] leading-6 text-[#46574d]">
          {item.summary || 'A conservative profile with evidence, safety, and practical context.'}
        </p>

        <div className="mt-4 rounded-[1.1rem] border border-brand-900/10 bg-brand-50/45 p-3">
          <p className={`${decisionMicroLabelClass} text-brand-800`}>May be relevant for</p>
          <p className="mt-1.5 text-base font-semibold leading-6 text-[#203329]">{bestFor}</p>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <SearchMetric label="Evidence" value={item.evidence} />
          <SearchMetric label="Safety" value={item.safety} />
        </div>

        {mechanisms.length > 0 ? (
          <div className={`${decisionMetadataClusterClass} mt-3 border-t border-brand-900/10 pt-3`}>
            {mechanisms.map(effect => (
              <span key={effect} className={decisionChipClass}>
                {effect}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex min-h-11 items-center justify-center rounded-full bg-brand-800 px-4 py-3 text-sm font-bold text-white transition group-hover:bg-brand-900 group-focus-visible:bg-brand-900">
        Investigate profile <span className="ml-2 transition group-hover:translate-x-0.5" aria-hidden="true">→</span>
      </div>
    </Link>
  )
}
