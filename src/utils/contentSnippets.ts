import herbsRaw from '@/data/herbs/herbs.normalized.json'
import { decorateCompounds } from '@/lib/compounds'
import { getCommonName } from '@/lib/herbName'
import type { Herb } from '@/types'
import { buildCardSummary } from '@/lib/summary'

export type ContentSnippet = {
  kind: 'herb' | 'compound'
  slug: string
  title: string
  hook: string
  explanation: string
  safetyNote: string
  ctaPath: string
}

function compactText(value: unknown, fallback: string) {
  const text = String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!text) return fallback
  return text.length > 155 ? `${text.slice(0, 152).trimEnd()}…` : text
}

function buildHook(item: Herb, title: string, kind: 'herb' | 'compound') {
  const mechanism = compactText(item.mechanism || item.mechanismOfAction || item.effects, '')
  if (mechanism) {
    return `This ${kind} may influence your brain via ${mechanism.toLowerCase()}.`
  }
  return `This ${kind}, ${title}, has a distinct neurochemical profile worth understanding.`
}

function buildExplanation(item: Herb, title: string, kind: 'herb' | 'compound') {
  return buildCardSummary({
    effects: item.effectsSummary || item.effects,
    mechanism: item.mechanism || item.mechanismOfAction,
    description: item.description,
    activeCompounds: item.active_compounds || item.compounds,
    fallback: `${title} is tracked in our database for ${kind === 'herb' ? 'botanical' : 'compound-level'} effects, mechanisms, and practical context.`,
    maxLen: 155,
  })
}

function buildSafety(item: Herb) {
  return compactText(
    item.safety || item.toxicity || item.contraindications,
    'Safety profile is incomplete; check contraindications, interactions, and dosage context before use.'
  )
}

function fromHerb(herb: Herb): ContentSnippet | null {
  if (!herb.slug) return null
  const title = getCommonName(herb) || herb.scientific || herb.common || herb.slug
  return {
    kind: 'herb',
    slug: herb.slug,
    title,
    hook: buildHook(herb, title, 'herb'),
    explanation: buildExplanation(herb, title, 'herb'),
    safetyNote: buildSafety(herb),
    ctaPath: `/herbs/${herb.slug}`,
  }
}

function fromCompound(compound: Herb): ContentSnippet | null {
  if (!compound.slug) return null
  const title = compound.common || compound.scientific || compound.name || compound.slug
  return {
    kind: 'compound',
    slug: compound.slug,
    title,
    hook: buildHook(compound, title, 'compound'),
    explanation: buildExplanation(compound, title, 'compound'),
    safetyNote: buildSafety(compound),
    ctaPath: `/compounds/${compound.slug}`,
  }
}

const herbSnippets = (Array.isArray(herbsRaw) ? herbsRaw : [])
  .map(item => fromHerb(item as Herb))
  .filter(Boolean) as ContentSnippet[]

const compoundSnippets = decorateCompounds()
  .map(item => fromCompound(item))
  .filter(Boolean) as ContentSnippet[]

export const contentSnippets: ContentSnippet[] = [...herbSnippets, ...compoundSnippets]

export function getSnippet(kind: 'herb' | 'compound', slug: string) {
  return contentSnippets.find(item => item.kind === kind && item.slug === slug)
}

export function getDailyDiscoverySnippet(date = new Date()) {
  if (!contentSnippets.length) return null
  const seed = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return contentSnippets[hash % contentSnippets.length]
}
