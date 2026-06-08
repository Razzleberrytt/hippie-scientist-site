import { text } from '@/lib/display-utils'
import { buildMonetizationOpportunity } from '@/lib/monetization-intelligence-layer'
import { buildSemanticIntelligenceReport } from '@/lib/semantic-intelligence-layer'

export type ConversionCTA = {
  label: string
  href: string
  description: string
  tone: 'explore' | 'compare' | 'stack' | 'ecosystem'
}

function title(value: unknown) {
  return text(value)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function slug(value: unknown) {
  return text(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function buildPrimaryCTA(record: Record<string, unknown>): ConversionCTA {
  const semantic = buildSemanticIntelligenceReport(record)
  const name = title(record?.displayName || record?.name || record?.slug)

  if (semantic.priority === 'high') {
    return {
      label: `Explore deeper ${name} pathways`,
      href: `/explore?q=${slug(name)}`,
      description: 'Continue into adjacent mechanisms, evidence layers, and ecosystem relationships.',
      tone: 'explore',
    }
  }

  return {
    label: `Research related ${name} profiles`,
    href: `/search?q=${slug(name)}`,
    description: 'Compare adjacent semantic profiles before drawing conclusions.',
    tone: 'explore',
  }
}

export function buildCompareCTA(record: Record<string, unknown>): ConversionCTA {
  const topic = title(record?.displayName || record?.name || record?.slug)

  return {
    label: `Compare ${topic} alternatives`,
    href: `/compare/${slug(topic)}`,
    description: 'Review adjacent compounds, mechanisms, and evidence context side-by-side.',
    tone: 'compare',
  }
}

export function buildStackCTA(record: Record<string, unknown>): ConversionCTA {
  const topic = title(record?.displayName || record?.name || record?.slug)

  return {
    label: `Explore ${topic} stack compatibility`,
    href: `/stacks/${slug(topic)}`,
    description: 'Investigate synergistic pathways, overlap concerns, and ecosystem fit.',
    tone: 'stack',
  }
}

export function buildContinuationCTA(record: Record<string, unknown>): ConversionCTA {
  const semantic = buildSemanticIntelligenceReport(record)

  return {
    label: 'Continue the semantic thread',
    href: semantic.recommendedRouteType === 'ecosystem'
      ? '/explore/ecosystems'
      : semantic.recommendedRouteType === 'compare'
        ? '/compare'
        : '/explore',
    description: 'Follow adjacent evidence, pathway, and ecosystem relationships.',
    tone: 'explore',
  }
}

export function buildEcosystemCTA(record: Record<string, unknown>): ConversionCTA {
  const topic = slug((Array.isArray(record?.primary_effects) ? record.primary_effects[0] : undefined) || (Array.isArray(record?.topics) ? record.topics[0] : undefined) || record?.slug)

  return {
    label: 'Explore the broader ecosystem',
    href: `/ecosystems/${topic}`,
    description: 'Navigate related compounds, pathways, and semantic clusters.',
    tone: 'ecosystem',
  }
}

export function buildAdaptiveConversionCTAs(record: Record<string, unknown>) {
  const monetization = buildMonetizationOpportunity(record)

  const base = [
    buildPrimaryCTA(record),
    buildCompareCTA(record),
    buildContinuationCTA(record),
    buildEcosystemCTA(record),
  ]

  if (monetization.confidence !== 'exploratory') {
    base.push(buildStackCTA(record))
  }

  return base
}
