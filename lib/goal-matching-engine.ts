import type { GraphRuntime, GraphNode } from '../src/types/graph'
import { loadRuntimeGraph } from './runtime-graph'

export type GoalMatch = {
  slug: string
  name: string
  type: 'herb' | 'compound' | 'stack'
  score: number
  confidence: number
  reasons: string[]
  bestFor: string[]
  avoidIf: string[]
}

const GOAL_SYNONYMS: Record<string, string[]> = {
  sleep: ['sleep', 'insomnia', 'rest', 'gaba', 'melatonin', 'somnifera'],
  stress: ['stress', 'cortisol', 'adaptogen', 'calm', 'relaxation'],
  anxiety: ['anxiety', 'anxiolytic', 'nervous', 'calm', 'relax', 'gaba'],
  focus: ['focus', 'attention', 'concentration', 'adhd', 'stimulant', 'caffeine', 'dopamine'],
  energy: ['energy', 'fatigue', 'stamina', 'vitality', 'atp', 'mitochondria', 'stimulation'],
  inflammation: ['inflammation', 'inflammatory', 'nf-kb', 'cox-2', 'cytokine', 'inflamm'],
  pain: ['pain', 'analgesic', 'nociceptive', 'joint', 'antinociceptive'],
  cognition: ['cognition', 'cognitive', 'memory', 'nootropic', 'acetylcholine', 'brain', 'synapse'],
  longevity: ['longevity', 'aging', 'sirt1', 'autophagy', 'nad+', 'antioxidant', 'senescence'],
}

function normalize(str: string): string {
  return (str || '').toLowerCase().trim()
}

function list(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  if (typeof value === 'string') {
    return value.split(/[|;,]/).map((x) => x.trim()).filter(Boolean)
  }
  return value ? [String(value)] : []
}

export function rankEntitiesForGoal(goal: string, graphInput?: GraphRuntime): GoalMatch[] {
  const graph = graphInput || loadRuntimeGraph()
  const targetGoal = normalize(goal)
  const synonyms = GOAL_SYNONYMS[targetGoal] || [targetGoal]

  const nodes = graph.nodes || []
  const matches: GoalMatch[] = []

  nodes.forEach((node) => {
    const reasons: string[] = []
    let score = 0
    let matchCount = 0

    const bestFor = list(node.best_for)
    const avoidIf = list(node.avoid_if)
    const topics = node.topics || []
    const pathways = node.pathways || []
    const mechanisms = node.mechanisms || []
    const effects = node.effects || []
    const summary = normalize(node.summary || '')

    // Check best_for explicit field
    const bestForMatches = bestFor.filter((item) =>
      synonyms.some((syn) => normalize(item).includes(syn))
    )
    if (bestForMatches.length > 0) {
      score += 0.4
      matchCount++
      reasons.push(`Explicitly indicated as best for: ${bestForMatches.join(', ')}`)
    }

    // Check topics
    const topicMatches = topics.filter((item) =>
      synonyms.some((syn) => normalize(item).includes(syn))
    )
    if (topicMatches.length > 0) {
      score += 0.3
      matchCount++
      reasons.push(`Associated with topics: ${topicMatches.join(', ')}`)
    }

    // Check mechanisms and pathways
    const mechMatches = [
      ...mechanisms.filter((m) => synonyms.some((syn) => normalize(m).includes(syn))),
      ...pathways.filter((p) => synonyms.some((syn) => normalize(p).includes(syn))),
    ]
    if (mechMatches.length > 0) {
      score += 0.2
      matchCount++
      reasons.push(`Biological mechanisms/pathways align: ${mechMatches.slice(0, 2).join(', ')}`)
    }

    // Check effects
    const effectMatches = effects.filter((e) =>
      synonyms.some((syn) => normalize(e).includes(syn))
    )
    if (effectMatches.length > 0) {
      score += 0.2
      matchCount++
      reasons.push(`Reported outcomes: ${effectMatches.join(', ')}`)
    }

    // Check summary text description fallback
    if (matchCount === 0) {
      const textMatches = synonyms.some((syn) => summary.includes(syn))
      if (textMatches) {
        score += 0.1
        matchCount++
        reasons.push('Mentioned in research summaries.')
      }
    }

    if (score > 0) {
      // Adjust score by evidence tier
      const tier = node.evidence_tier || 'Evidence-Limited'
      let tierMultiplier = 0.5
      let confidence = 0.3

      if (tier === 'Strong Human Evidence') {
        tierMultiplier = 1.0
        confidence = 0.9
        reasons.push('Supported by high-quality human evidence.')
      } else if (tier === 'Moderate Human Evidence') {
        tierMultiplier = 0.85
        confidence = 0.75
        reasons.push('Supported by moderate human clinical evidence.')
      } else if (tier === 'Limited Human Evidence' || tier === 'Preliminary Evidence') {
        tierMultiplier = 0.7
        confidence = 0.6
        reasons.push('Emerging or preliminary human findings.')
      } else if (tier === 'Mechanistic Evidence') {
        tierMultiplier = 0.5
        confidence = 0.4
        reasons.push('Evidence is primarily mechanistic or preclinical.')
      } else if (tier === 'Traditional Use Context') {
        tierMultiplier = 0.3
        confidence = 0.2
        reasons.push('Based on historical traditional use.')
      }

      const finalScore = Math.min(1.0, score * tierMultiplier)

      matches.push({
        slug: node.slug,
        name: node.name,
        type: node.type,
        score: parseFloat(finalScore.toFixed(2)),
        confidence,
        reasons,
        bestFor,
        avoidIf,
      })
    }
  })

  return matches.sort((a, b) => b.score - a.score)
}
