import type { GovernedCollectionSummary } from '@/lib/collectionEnrichment'
import { hasPlaceholderText } from '@/lib/summary'

export type GovernedCollectionIntroSignal =
  | 'association_theme'
  | 'evidence_distribution'
  | 'safety_presence'
  | 'uncertainty_or_conflict'
  | 'review_coverage'

export type GovernedCollectionIntroResult = {
  mode: 'governed' | 'fallback'
  intro: string
  supportingNote?: string
  usedSignals: GovernedCollectionIntroSignal[]
  excludedSignals: Array<{ signal: GovernedCollectionIntroSignal; reason: string }>
}

function toPlural(value: number, singular: string, plural = `${singular}s`) {
  if (plural === `${singular}s` && singular.endsWith('y')) {
    plural = `${singular.slice(0, -1)}ies`
  }
  return `${value} ${value === 1 ? singular : plural}`
}

function formatThemes(themes: string[]) {
  if (!themes.length) return null
  if (themes.length === 1) return themes[0]
  if (themes.length === 2) return `${themes[0]} and ${themes[1]}`
  return `${themes[0]}, ${themes[1]}, and ${themes[2]}`
}

function toCoverageText(summary: GovernedCollectionSummary) {
  if (summary.includedCount === 0) return 'no matched entries'
  return `${summary.governedReviewedCount}/${summary.includedCount} entries`
}

function buildEvidenceSentence(summary: GovernedCollectionSummary) {
  const strongerHuman = summary.strongerHumanSupportCount
  const limitedHuman = summary.limitedHumanSupportCount
  const weakOnly = summary.weakEvidenceOnlyCount
  const uncertain = summary.unresolvedConflictOrUncertaintyCount

  if (strongerHuman + limitedHuman >= 2) {
    return `Evidence labels in this set include ${toPlural(strongerHuman, 'entry')} with stronger human support and ${toPlural(limitedHuman, 'entry')} with limited human support.`
  }

  if (weakOnly > 0) {
    return `Most governed entries in this set are currently preclinical, traditional-use, mixed, or otherwise weak-evidence profiles (${toPlural(weakOnly, 'entry')}).`
  }

  if (uncertain > 0) {
    return `Uncertainty or conflicting findings are explicitly flagged across ${toPlural(uncertain, 'entry')}.`
  }

  return `Evidence grading coverage is still limited across the currently governed entries (${toCoverageText(summary)}).`
}

export function buildGovernedCollectionIntro(args: {
  fallbackIntro: string
  summary: GovernedCollectionSummary | null
  qualityApproved: boolean
}): GovernedCollectionIntroResult {
  const { fallbackIntro, summary, qualityApproved } = args

  const excludedSignals: GovernedCollectionIntroResult['excludedSignals'] = []
  if (!qualityApproved) {
    return {
      mode: 'fallback',
      intro: fallbackIntro,
      usedSignals: [],
      excludedSignals: [
        { signal: 'association_theme', reason: 'collection_not_indexable_quality_gate' },
        { signal: 'evidence_distribution', reason: 'collection_not_indexable_quality_gate' },
        { signal: 'safety_presence', reason: 'collection_not_indexable_quality_gate' },
        { signal: 'uncertainty_or_conflict', reason: 'collection_not_indexable_quality_gate' },
        { signal: 'review_coverage', reason: 'collection_not_indexable_quality_gate' },
      ],
    }
  }

  if (!summary || summary.governedReviewedCount < 2) {
    return {
      mode: 'fallback',
      intro: fallbackIntro,
      usedSignals: [],
      excludedSignals: [
        { signal: 'association_theme', reason: 'insufficient_publishable_governed_coverage' },
        { signal: 'evidence_distribution', reason: 'insufficient_publishable_governed_coverage' },
        { signal: 'safety_presence', reason: 'insufficient_publishable_governed_coverage' },
        { signal: 'uncertainty_or_conflict', reason: 'insufficient_publishable_governed_coverage' },
        { signal: 'review_coverage', reason: 'insufficient_publishable_governed_coverage' },
      ],
    }
  }

  const usedSignals: GovernedCollectionIntroSignal[] = []
  const segments: string[] = []

  const themeText = formatThemes(summary.supportedUseThemesTop)
  if (themeText) {
    usedSignals.push('association_theme')
    segments.push(
      `This set is commonly associated with ${themeText} in publish-approved governed summaries.`,
    )
  } else {
    excludedSignals.push({ signal: 'association_theme', reason: 'no_shared_supported_use_theme' })
  }

  usedSignals.push('evidence_distribution')
  segments.push(buildEvidenceSentence(summary))

  if (summary.safetySignalsPresentCount > 0) {
    usedSignals.push('safety_presence')
    segments.push(
      `Safety or interaction cautions are present in ${toPlural(summary.safetySignalsPresentCount, 'entry')}, so individual interaction checks still matter.`,
    )
  } else {
    excludedSignals.push({ signal: 'safety_presence', reason: 'no_governed_safety_entries' })
  }

  if (summary.unresolvedConflictOrUncertaintyCount > 0) {
    usedSignals.push('uncertainty_or_conflict')
    segments.push(
      `Uncertainty or conflict notes are flagged for ${toPlural(summary.unresolvedConflictOrUncertaintyCount, 'entry')}; avoid treating this page as a ranked efficacy list.`,
    )
  } else {
    excludedSignals.push({
      signal: 'uncertainty_or_conflict',
      reason: 'no_uncertainty_conflict_flags',
    })
  }

  usedSignals.push('review_coverage')
  const supportingNote = `Governed review coverage: ${toCoverageText(summary)} are publish-approved.`

  const intro = segments.join(' ')
  if (!intro || hasPlaceholderText(intro)) {
    return {
      mode: 'fallback',
      intro: fallbackIntro,
      usedSignals: [],
      excludedSignals: [
        ...excludedSignals,
        {
          signal: 'evidence_distribution',
          reason: 'governed_intro_quality_fell_back_to_conservative_copy',
        },
      ],
    }
  }

  return {
    mode: 'governed',
    intro,
    supportingNote,
    usedSignals,
    excludedSignals,
  }
}

export function countPlaceholderHeavyCollectionIntro(text: string) {
  return hasPlaceholderText(text) ? 1 : 0
}
