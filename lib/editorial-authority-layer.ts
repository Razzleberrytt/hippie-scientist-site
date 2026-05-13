import { list, text, unique } from '@/lib/display-utils'
import { buildResearchKnowledgeReport } from '@/lib/research-knowledge-layer'
import { buildSemanticIntelligenceReport } from '@/lib/semantic-intelligence-layer'

export type EditorialAuthorityNote = {
  label: string
  body: string
  tone: 'interpretation' | 'caution' | 'expectation' | 'uncertainty'
}

function title(value: unknown) {
  return text(value)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function buildEditorialAuthorityNotes(record: any): EditorialAuthorityNote[] {
  const semantic = buildSemanticIntelligenceReport(record)
  const research = buildResearchKnowledgeReport(record)
  const name = title(record?.displayName || record?.name || record?.slug || 'This profile')
  const effects = unique([
    ...list(record?.best_for),
    ...list(record?.primary_effects),
    ...list(record?.effects),
  ].map(title).filter(Boolean)).slice(0, 4)

  return [
    {
      label: 'What this actually means',
      body: effects.length
        ? `${name} is best interpreted through ${effects.join(', ')} context. Treat this as a research-navigation summary, not a guaranteed outcome.`
        : `${name} should be interpreted cautiously until more outcome-specific evidence is available.`,
      tone: 'interpretation',
    },
    {
      label: 'Evidence nuance',
      body: research.summary,
      tone: research.evidenceWeight >= 24 ? 'interpretation' : 'uncertainty',
    },
    {
      label: 'Realistic expectations',
      body: 'Effects can depend on dose, formulation, baseline status, timing, interactions, and whether the intended outcome matches the evidence base.',
      tone: 'expectation',
    },
    {
      label: 'Caution context',
      body: 'Check medication interactions, pregnancy status, medical conditions, stimulant sensitivity, and overlapping stacks before use.',
      tone: 'caution',
    },
    {
      label: 'Semantic authority read',
      body: `${name} currently ranks as ${semantic.priority} for semantic authority based on mechanism density, evidence signals, ecosystem alignment, and traversal diversity.`,
      tone: 'interpretation',
    },
  ]
}
