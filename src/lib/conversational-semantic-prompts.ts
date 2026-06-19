import { text, unique } from '@/lib/display-utils'
import { buildAdaptiveTraversal } from './adaptive-semantic-traversal'

export type ConversationalSemanticPrompt = {
  question: string
  answerFrame: string
  intent: 'compare' | 'gentler-route' | 'stronger-evidence' | 'mechanism-depth' | 'ecosystem-bridge' | 'stack-context'
  href?: string
  signals: string[]
}

function title(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function displayName(record: any) {
  return title(text(record?.displayName || record?.name || record?.slug || 'this profile'))
}

export function buildConversationalSemanticPrompts(
  source: any,
  candidates: any[] = [],
  limit = 6,
): ConversationalSemanticPrompt[] {
  const traversal = buildAdaptiveTraversal(source, candidates, 8)
  const firstProfile = traversal.find((item) => item.type === 'profile')
  const firstEcosystem = traversal.find((item) => item.type === 'ecosystem')
  const sourceName = displayName(source)

  const prompts: ConversationalSemanticPrompt[] = [
    firstProfile
      ? {
          question: `Want to compare ${sourceName} with an adjacent option?`,
          answerFrame: firstProfile.description,
          intent: 'compare',
          href: firstProfile.href,
          signals: firstProfile.signals,
        }
      : null,
    firstEcosystem
      ? {
          question: 'Want to continue into the larger ecosystem?',
          answerFrame: firstEcosystem.description,
          intent: 'ecosystem-bridge',
          href: firstEcosystem.href,
          signals: firstEcosystem.signals,
        }
      : null,
    {
      question: 'Looking for the gentler route?',
      answerFrame: 'Explore lower-intensity adjacent options when tolerance, stimulation, sedation, or interaction risk matters.',
      intent: 'gentler-route',
      signals: ['Tolerance', 'Safety Context', 'Lower Intensity'],
    },
    {
      question: 'Want the stronger-evidence path?',
      answerFrame: 'Prioritize profiles with clearer human evidence, stronger endpoint specificity, and better evidence maturity signals.',
      intent: 'stronger-evidence',
      signals: ['Human Evidence', 'Endpoint Specificity', 'Evidence Maturity'],
    },
    {
      question: 'Want to understand the mechanism layer?',
      answerFrame: 'Move from surface-level benefits into pathway context, mechanism overlap, and uncertainty-aware biological interpretation.',
      intent: 'mechanism-depth',
      signals: ['Mechanisms', 'Pathway Context', 'Uncertainty'],
    },
    {
      question: 'Would this make more sense in a routine?',
      answerFrame: 'Explore stack context when timing, overlap, dose practicality, and routine design matter more than single-profile selection.',
      intent: 'stack-context',
      signals: ['Stack Fit', 'Timing', 'Overlap Caution'],
    },
  ].filter(Boolean) as ConversationalSemanticPrompt[]

  return prompts.slice(0, limit)
}

export function buildSemanticExplorationThread(source: any, candidates: any[] = []) {
  const traversal = buildAdaptiveTraversal(source, candidates, 5)
  const names = traversal.map((item) => item.title.replace(/^Continue into /, '').replace(/^Explore the /, '')).slice(0, 3)

  return {
    title: 'Suggested exploration thread',
    summary: names.length > 0
      ? `A strong next path is ${unique(names).join(' → ')}.`
      : 'A strong next path will emerge as more semantic relationships are available.',
    items: traversal,
  }
}
