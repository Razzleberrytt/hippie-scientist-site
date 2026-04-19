import { calculateCompoundConfidence } from '@/utils/calculateConfidence'
import { splitClean } from '@/lib/sanitize'
import type { CompoundRecord } from '@/lib/compound-data'
import type { Herb } from '@/types'
import type { SeoLandingConfig } from '@/data/seoLandingConfigs'

export type SeoLandingResult = {
  herbs: Herb[]
  compounds: CompoundRecord[]
}

function normalizeText(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .trim()
}

function confidenceRank(level: string): number {
  if (level === 'high') return 3
  if (level === 'medium') return 2
  return 1
}

function scoreHerbCompleteness(herb: Herb): number {
  const count = [
    herb.description,
    splitClean(herb.mechanisms).join('; ') || herb.mechanism || herb.mechanismOfAction || herb.mechanismofaction,
    herb.primaryActions ?? herb.effects,
    herb.active_compounds,
    herb.compounds,
    herb.safety,
  ].filter(value => splitClean(value).length > 0 || normalizeText(value).length > 0).length

  return count
}

function scoreCompoundCompleteness(compound: CompoundRecord): number {
  const count = [
    compound.description,
    splitClean(compound.mechanisms).join('; ') || compound.mechanism,
    compound.primaryActions ?? compound.effects,
    compound.foundIn ?? compound.herbs,
    compound.legalStatus,
  ].filter(value => splitClean(value).length > 0 || normalizeText(value).length > 0).length

  return count
}

function getHerbConfidence(herb: Herb): string {
  const confidenceValue = String(herb.confidence ?? '').toLowerCase()
  if (confidenceValue === 'high' || confidenceValue === 'medium') return confidenceValue
  return 'low'
}

function getCompoundConfidence(compound: CompoundRecord): string {
  return calculateCompoundConfidence({
    mechanism: splitClean(compound.mechanisms).join('; ') || compound.mechanism,
    effects: compound.primaryActions ?? compound.effects,
    compounds: compound.foundIn ?? compound.herbs,
  })
}

function herbHasSparseData(herb: Herb): boolean {
  const essentialFields = [
    herb.description,
    herb.primaryActions ?? herb.effects,
    splitClean(herb.mechanisms).join('; ') || herb.mechanism || herb.mechanismOfAction || herb.mechanismofaction,
  ]

  const present = essentialFields.filter(value => normalizeText(value).length > 0).length
  return present < 2
}

function compoundHasSparseData(compound: CompoundRecord): boolean {
  const essentialFields = [
    compound.description,
    compound.primaryActions ?? compound.effects,
    splitClean(compound.mechanisms).join('; ') || compound.mechanism,
  ]
  const present = essentialFields.filter(
    value => splitClean(value).length > 0 || normalizeText(value).length > 0
  ).length
  return present < 2
}

function isNeedleMatch(haystack: unknown, needle: string): boolean {
  const normalizedNeedle = normalizeText(needle)
  if (!normalizedNeedle) return false

  return splitClean(haystack).some(value => normalizeText(value).includes(normalizedNeedle))
}

function matchesHerb(config: SeoLandingConfig, herb: Herb): boolean {
  const target = normalizeText(config.target)
  const categoryFields = [
    herb.category,
    herb.category_label,
    ...(Array.isArray(herb.categories) ? herb.categories : []),
    String((herb as Record<string, unknown>).class ?? ''),
  ]
  const effectFields = [herb.primaryActions ?? herb.effects, herb.effectsSummary, herb.tags]
  const compoundFields = [
    herb.activeCompounds,
    herb.active_compounds,
    herb.activeconstituents,
    herb.compounds,
    herb.compoundsDetailed,
    herb.activeConstituents?.map(item => item.name),
  ]

  if (config.kind === 'effect') {
    return effectFields.some(field => isNeedleMatch(field, target))
  }

  if (config.kind === 'class' || config.kind === 'category') {
    return categoryFields.some(field => isNeedleMatch(field, target))
  }

  if (config.kind === 'compound') {
    return compoundFields.some(field => isNeedleMatch(field, target))
  }

  return false
}

function matchesCompound(config: SeoLandingConfig, compound: CompoundRecord): boolean {
  const target = normalizeText(config.target)

  const effectFields = [compound.primaryActions ?? compound.effects, compound.description]
  const classFields = [compound.compoundClass, compound.className, compound.category]
  const compoundRefFields = [compound.name, compound.foundIn ?? compound.herbs]

  if (config.kind === 'effect') {
    return effectFields.some(field => isNeedleMatch(field, target))
  }

  if (config.kind === 'class' || config.kind === 'category') {
    return classFields.some(field => isNeedleMatch(field, target))
  }

  if (config.kind === 'compound') {
    return compoundRefFields.some(field => isNeedleMatch(field, target))
  }

  return false
}

export function getSeoLandingResults(
  config: SeoLandingConfig,
  data: {
    herbs: Herb[]
    compounds: CompoundRecord[]
  }
): SeoLandingResult {
  if (config.entityType === 'herbs') {
    const herbs = data.herbs
      .filter(herb => matchesHerb(config, herb))
      .filter(herb => !herbHasSparseData(herb))
      .sort((a, b) => {
        const confidenceDiff =
          confidenceRank(getHerbConfidence(b)) - confidenceRank(getHerbConfidence(a))
        if (confidenceDiff !== 0) return confidenceDiff

        const completenessDiff = scoreHerbCompleteness(b) - scoreHerbCompleteness(a)
        if (completenessDiff !== 0) return completenessDiff

        const aName = String(a.common || a.name || a.scientific || a.slug || '')
        const bName = String(b.common || b.name || b.scientific || b.slug || '')
        return aName.localeCompare(bName)
      })

    return {
      herbs,
      compounds: [],
    }
  }

  const compounds = data.compounds
    .filter(compound => matchesCompound(config, compound))
    .filter(compound => !compoundHasSparseData(compound))
    .sort((a, b) => {
      const confidenceDiff =
        confidenceRank(getCompoundConfidence(b)) - confidenceRank(getCompoundConfidence(a))
      if (confidenceDiff !== 0) return confidenceDiff

      const completenessDiff = scoreCompoundCompleteness(b) - scoreCompoundCompleteness(a)
      if (completenessDiff !== 0) return completenessDiff

      return a.name.localeCompare(b.name)
    })

  return {
    herbs: [],
    compounds,
  }
}
