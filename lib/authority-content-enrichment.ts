import { list, text } from '@/lib/display-utils'
import { cleanEditorialText, dedupeEditorialItems, isRenderableText, shouldRenderCard } from '@/lib/editorial-rendering'
import { buildResearchKnowledgeReport } from '../src/lib/research-knowledge-layer'

function title(value: unknown) {
  return text(value)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function first(values: unknown[], fallback: string) {
  return values.map(text).find(Boolean) || fallback
}

export function buildPracticalInterpretation(record: Record<string, unknown>) {
  const name = isRenderableText(record?.displayName || record?.name || record?.slug)
    ? title(record?.displayName || record?.name || record?.slug)
    : 'This profile'
  const effects = dedupeEditorialItems([
    ...list(record?.best_for),
    ...list(record?.primary_effects),
    ...list(record?.effects),
  ].map(title), 4)

  if (effects.length === 0) {
    return `${name} currently has limited practical interpretation context available. Focus on evidence quality and safety before drawing strong conclusions.`
  }

  return `${name} is most commonly explored for ${effects.join(', ')} support. The strongest interpretation usually depends on formulation quality, baseline status, consistency, and whether the intended outcome matches the actual evidence base.`
}

export function buildRealisticExpectations(record: Record<string, unknown>) {
  const timing = cleanEditorialText(first([
    record?.time_to_effect,
    record?.timeToEffect,
    record?.onset,
  ], 'timing varies by formulation and baseline context'))

  return `Real-world outcomes are rarely immediate. ${timing}. Acute subjective effects, long-term adaptation, and measurable clinical outcomes should not be treated as interchangeable.`
}

export function buildOutcomeSpecificGuidance(record: Record<string, unknown>) {
  const outcomes = dedupeEditorialItems([
    ...list(record?.best_for),
    ...list(record?.goals),
    ...list(record?.primary_effects),
  ].map(title), 6)

  return outcomes.filter(isRenderableText).map((outcome) => ({
    outcome,
    guidance: `${outcome} outcomes should be evaluated using consistency, recovery context, sleep quality, nutrition status, and realistic timelines rather than expecting dramatic overnight changes.`,
  })).filter((item) => shouldRenderCard(item.outcome, item.guidance))
}

export function buildCompareInsights(record: Record<string, unknown>) {
  const name = isRenderableText(record?.displayName || record?.name || record?.slug)
    ? title(record?.displayName || record?.name || record?.slug)
    : 'This profile'
  const mechanisms = dedupeEditorialItems([
    ...list(record?.mechanisms),
    ...list(record?.pathways),
  ].map(title), 4)

  return {
    headline: `How ${name} differs from adjacent options`,
    summary: mechanisms.length > 0
      ? `${name} is often compared through ${mechanisms.join(', ')} pathway context rather than only broad marketing categories.`
      : `${name} should be compared using evidence quality, mechanism overlap, tolerability, and practical fit rather than hype-driven rankings.`,
  }
}

export function buildHumanEvidenceSummary(record: Record<string, unknown>) {
  const research = buildResearchKnowledgeReport(record)

  return {
    evidenceWeight: research.evidenceWeight,
    summary: cleanEditorialText(research.summary),
    interpretation:
      research.evidenceWeight >= 24
        ? 'Human evidence appears relatively developed compared to many adjacent profiles.'
        : research.evidenceWeight >= 12
          ? 'Evidence is mixed or still developing and should be interpreted cautiously.'
          : 'Current evidence is limited, preliminary, or heavily mechanistic.',
  }
}

export function buildCommonMistakesSection(record: Record<string, unknown>) {
  const name = isRenderableText(record?.displayName || record?.name || record?.slug)
    ? title(record?.displayName || record?.name || record?.slug)
    : 'This profile'

  return [
    `Treating ${name} as a universal solution rather than a context-dependent tool.`,
    'Ignoring formulation quality, dose transparency, and ingredient standardization.',
    'Expecting immediate dramatic effects from outcomes that usually develop gradually.',
    'Stacking too many overlapping compounds simultaneously and making results impossible to interpret.',
  ]
}
