import {
  type InteractionSignal,
  type InteractionSignals,
  type InteractionSourceItem,
} from '@/types/interactions'
import { normalizeMechanismText } from './normalizeMechanismText'

type SignalRule = {
  tag: string
  keywords: string[]
}

const SIGNAL_RULES: SignalRule[] = [
  { tag: 'sedative', keywords: ['sedative', 'sedation', 'calming', 'hypnotic', 'sleep'] },
  { tag: 'anxiolytic', keywords: ['anxiolytic', 'anti-anxiety', 'calming'] },
  { tag: 'cns-depressant', keywords: ['cns depressant', 'central nervous system depressant'] },
  { tag: 'stimulant', keywords: ['stimulant', 'stimulating', 'energizing'] },
  { tag: 'serotonergic', keywords: ['seroton', '5-ht', 'sri', 'ssri', 'serotonergic'] },
  { tag: 'mao-related', keywords: ['mao', 'maoi', 'mao-a', 'mao-b', 'harmala'] },
  { tag: 'gabaergic', keywords: ['gaba', 'gabaergic', 'gaba_a', 'gaba-a'] },
  { tag: 'cholinergic', keywords: ['cholinergic', 'acetylcholine', 'muscarinic', 'nicotinic'] },
  { tag: 'psychedelic', keywords: ['psychedelic', 'hallucinogen', 'visionary', 'entheogen'] },
  {
    tag: 'cardiovascular-caution',
    keywords: ['cardio', 'blood pressure', 'hypertension', 'tachycardia', 'vasoconstrict'],
  },
  {
    tag: 'hepatotoxicity-caution',
    keywords: ['hepatotoxic', 'liver toxicity', 'liver burden', 'liver injury'],
  },
  { tag: 'seizure-risk-caution', keywords: ['seizure', 'convuls', 'epilep'] },
]

const DATA_FIELDS: Array<keyof InteractionSourceItem> = [
  'mechanism',
  'effects',
  'contraindications',
  'safety',
  'interactions',
  'category',
]

function ensureArray(value: string[] | string | undefined): string[] {
  if (Array.isArray(value)) return value.map(entry => String(entry).trim()).filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(/[;,|]/)
      .map(entry => entry.trim())
      .filter(Boolean)
  }
  return []
}

function getNormalizedTextByField(item: InteractionSourceItem): Record<string, string[]> {
  const textByField: Record<string, string[]> = {}

  textByField.mechanism = item.mechanism ? [normalizeMechanismText(item.mechanism)] : []
  textByField.category = item.category ? [normalizeMechanismText(item.category)] : []
  textByField.effects = ensureArray(item.effects).map(normalizeMechanismText)
  textByField.contraindications = ensureArray(item.contraindications).map(normalizeMechanismText)
  textByField.safety = ensureArray(item.safety).map(normalizeMechanismText)
  textByField.interactions = ensureArray(item.interactions).map(normalizeMechanismText)

  return textByField
}

export function extractInteractionSignals(item: InteractionSourceItem): InteractionSignals {
  const textByField = getNormalizedTextByField(item)
  const matchedSignals: InteractionSignal[] = []

  SIGNAL_RULES.forEach(rule => {
    const evidence = new Set<string>()

    for (const field of DATA_FIELDS) {
      const snippets = textByField[field] ?? []
      snippets.forEach(snippet => {
        const matchedKeyword = rule.keywords.find(keyword => snippet.includes(keyword))
        if (!matchedKeyword) return
        evidence.add(`${field}: ${matchedKeyword}`)
      })
    }

    if (evidence.size > 0) {
      matchedSignals.push({ tag: rule.tag, basis: Array.from(evidence) })
    }
  })

  const tags = new Set(matchedSignals.map(signal => signal.tag))
  const evidenceByTag = new Map(matchedSignals.map(signal => [signal.tag, signal.basis]))

  let dataCoverageScore = 0
  if (textByField.mechanism.length > 0) dataCoverageScore += 1
  if (textByField.effects.length > 0) dataCoverageScore += 1
  if (textByField.contraindications.length > 0 || textByField.safety.length > 0)
    dataCoverageScore += 1

  return {
    item,
    tags,
    evidenceByTag,
    dataCoverageScore,
  }
}
