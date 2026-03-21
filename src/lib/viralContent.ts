import type { Herb } from '@/types'

export type HerbViralHooks = {
  didYouKnow: string[]
  beginnerExplanation: string
  safetyInsight: string
  whyItMatters: string
}

function splitBits(value: unknown): string[] {
  if (!value) return []
  const source = Array.isArray(value) ? value : [value]
  return source
    .flatMap(entry => String(entry).split(/[;,.|\n]/g))
    .map(entry => entry.trim())
    .filter(Boolean)
}

function pickName(herb: Herb) {
  return String(herb.common || herb.name || herb.scientific || herb.slug || 'This herb')
}

function compact(value: unknown, fallback: string) {
  const text = String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!text) return fallback
  return text.length > 180 ? `${text.slice(0, 177).trimEnd()}…` : text
}

export function buildHerbViralHooks(herb: Herb): HerbViralHooks {
  const name = pickName(herb)
  const effects = splitBits(herb.effects || herb.effectsSummary)
  const compounds = splitBits(herb.active_compounds || herb.compounds)
  const mechanism = compact(
    herb.mechanism || herb.mechanismOfAction,
    'Mechanism still being mapped.'
  )
  const safety = compact(
    herb.safety || herb.toxicity || herb.contraindicationsText,
    'Safety varies by dose, context, and existing medications.'
  )

  const didYouKnow = [
    `Did you know? ${name} is discussed for ${effects[0] || 'its distinctive psychoactive profile'}.`,
    `Did you know? ${name} contains compounds like ${compounds[0] || 'multiple active constituents'} that may shape its effects.`,
    `Did you know? Researchers often describe ${name} through ${mechanism.toLowerCase()}`,
  ]

  return {
    didYouKnow,
    beginnerExplanation: `${name} is best understood as a plant profile with effects, mechanisms, and safety boundaries that change by preparation and person.`,
    safetyInsight: `Safety insight: ${safety}`,
    whyItMatters: `${name} matters because understanding its mechanism and risks helps people make lower-risk, evidence-aware decisions.`,
  }
}

export function getShareInsight(herb: Herb, fallback = '') {
  const hooks = buildHerbViralHooks(herb)
  return fallback || hooks.didYouKnow[0] || hooks.whyItMatters
}
