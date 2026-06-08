import { list, text, unique } from '@/lib/display-utils'
import { buildResearchKnowledgeReport } from '@/lib/research-knowledge-layer'

function title(value: unknown) {
  return text(value)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function name(record: Record<string, unknown>) {
  return title(record?.displayName || record?.name || record?.slug)
}

function signals(record: Record<string, unknown>) {
  return unique([
    ...list(record?.best_for),
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
  ].map(title).filter(Boolean)).slice(0, 6)
}

export function buildPracticalDifferences(left: Record<string, unknown>, right: Record<string, unknown>) {
  return {
    left: `${name(left)} is more commonly framed around ${signals(left).slice(0, 3).join(', ') || 'general support'} context.`,
    right: `${name(right)} is more commonly framed around ${signals(right).slice(0, 3).join(', ') || 'general support'} context.`,
  }
}

export function buildOnsetComparison(left: Record<string, unknown>, right: Record<string, unknown>) {
  return {
    left: text(left?.time_to_effect || left?.onset || 'timing varies by formulation and baseline status'),
    right: text(right?.time_to_effect || right?.onset || 'timing varies by formulation and baseline status'),
  }
}

export function buildEvidenceComparison(left: Record<string, unknown>, right: Record<string, unknown>) {
  const leftResearch = buildResearchKnowledgeReport(left)
  const rightResearch = buildResearchKnowledgeReport(right)

  return {
    left: `${name(left)}: ${leftResearch.summary}`,
    right: `${name(right)}: ${rightResearch.summary}`,
  }
}

export function buildStackCompatibilityDifferences(left: Record<string, unknown>, right: Record<string, unknown>) {
  return {
    left: `${name(left)} should be evaluated for overlap, stimulation/sedation interactions, and stack redundancy before combining with additional compounds.`,
    right: `${name(right)} should be interpreted through tolerability, formulation quality, and overlapping mechanism context.`,
  }
}

export function buildPreferenceGuidance(left: Record<string, unknown>, right: Record<string, unknown>) {
  return {
    left: `Users often prefer ${name(left)} when their goals align more closely with ${signals(left).slice(0, 2).join(' and ') || 'its evidence profile'}.`,
    right: `Users often prefer ${name(right)} when their goals align more closely with ${signals(right).slice(0, 2).join(' and ') || 'its evidence profile'}.`,
  }
}

export function buildRealisticExpectationDifferences(left: Record<string, unknown>, right: Record<string, unknown>) {
  return {
    left: `${name(left)} should not be expected to produce immediate dramatic transformations outside of realistic evidence context.`,
    right: `${name(right)} outcomes should be interpreted gradually and through consistency rather than hype-driven expectations.`,
  }
}
