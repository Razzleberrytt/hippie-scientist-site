export type ConditionDomain =
  | 'sleep'
  | 'stress'
  | 'anxiety'
  | 'focus'
  | 'mood'
  | 'metabolic'
  | 'exercise'
  | 'cognition'

export type ConditionNodeId =
  | ConditionDomain
  | 'sleep-insomnia'
  | 'sleep-quality'
  | 'sleep-latency'
  | 'sleep-duration'
  | 'stress-perceived'
  | 'stress-physiologic'
  | 'anxiety-general'
  | 'anxiety-situational'
  | 'focus-attention'
  | 'focus-working-memory'
  | 'mood-depressive-symptoms'
  | 'mood-wellbeing'
  | 'metabolic-glucose'
  | 'metabolic-lipids'
  | 'metabolic-weight'
  | 'exercise-strength'
  | 'exercise-endurance'
  | 'exercise-recovery'
  | 'cognition-memory'
  | 'cognition-processing-speed'
  | 'cognition-executive-function'

export type ConditionOntologyNode = {
  id: ConditionNodeId
  label: string
  parentId?: ConditionDomain
  aliases: string[]
  routeSegment: string
  searchTerms: string[]
}

export const CONDITION_ONTOLOGY: ConditionOntologyNode[] = [
  { id: 'sleep', label: 'Sleep', aliases: ['sleep'], routeSegment: 'sleep', searchTerms: ['sleep supplements', 'sleep evidence'] },
  { id: 'sleep-insomnia', label: 'Insomnia symptoms', parentId: 'sleep', aliases: ['insomnia', 'difficulty sleeping'], routeSegment: 'insomnia', searchTerms: ['insomnia supplements', 'difficulty sleeping'] },
  { id: 'sleep-quality', label: 'Sleep quality', parentId: 'sleep', aliases: ['sleep quality', 'restful sleep'], routeSegment: 'sleep-quality', searchTerms: ['sleep quality supplements'] },
  { id: 'sleep-latency', label: 'Sleep latency', parentId: 'sleep', aliases: ['sleep onset', 'fall asleep', 'sleep latency'], routeSegment: 'sleep-latency', searchTerms: ['fall asleep faster'] },
  { id: 'sleep-duration', label: 'Sleep duration', parentId: 'sleep', aliases: ['sleep duration', 'total sleep time'], routeSegment: 'sleep-duration', searchTerms: ['sleep duration'] },

  { id: 'stress', label: 'Stress', aliases: ['stress'], routeSegment: 'stress', searchTerms: ['stress supplements', 'stress evidence'] },
  { id: 'stress-perceived', label: 'Perceived stress', parentId: 'stress', aliases: ['perceived stress', 'stress symptoms'], routeSegment: 'perceived-stress', searchTerms: ['perceived stress supplements'] },
  { id: 'stress-physiologic', label: 'Physiologic stress markers', parentId: 'stress', aliases: ['cortisol', 'physiologic stress'], routeSegment: 'stress-markers', searchTerms: ['cortisol supplements'] },

  { id: 'anxiety', label: 'Anxiety', aliases: ['anxiety'], routeSegment: 'anxiety', searchTerms: ['anxiety supplements', 'anxiety evidence'] },
  { id: 'anxiety-general', label: 'General anxiety symptoms', parentId: 'anxiety', aliases: ['general anxiety', 'anxiety symptoms'], routeSegment: 'general-anxiety', searchTerms: ['anxiety symptom supplements'] },
  { id: 'anxiety-situational', label: 'Situational anxiety', parentId: 'anxiety', aliases: ['situational anxiety', 'acute anxiety'], routeSegment: 'situational-anxiety', searchTerms: ['situational anxiety'] },

  { id: 'focus', label: 'Focus', aliases: ['focus', 'concentration'], routeSegment: 'focus', searchTerms: ['focus supplements', 'concentration supplements'] },
  { id: 'focus-attention', label: 'Attention', parentId: 'focus', aliases: ['attention', 'sustained attention'], routeSegment: 'attention', searchTerms: ['attention supplements'] },
  { id: 'focus-working-memory', label: 'Working memory', parentId: 'focus', aliases: ['working memory'], routeSegment: 'working-memory', searchTerms: ['working memory supplements'] },

  { id: 'mood', label: 'Mood', aliases: ['mood'], routeSegment: 'mood', searchTerms: ['mood supplements', 'mood evidence'] },
  { id: 'mood-depressive-symptoms', label: 'Depressive symptoms', parentId: 'mood', aliases: ['depressive symptoms', 'low mood'], routeSegment: 'depressive-symptoms', searchTerms: ['depressive symptoms supplements'] },
  { id: 'mood-wellbeing', label: 'Wellbeing', parentId: 'mood', aliases: ['wellbeing', 'well-being', 'positive mood'], routeSegment: 'wellbeing', searchTerms: ['wellbeing supplements'] },

  { id: 'metabolic', label: 'Metabolic health', aliases: ['metabolic health'], routeSegment: 'metabolic', searchTerms: ['metabolic supplements'] },
  { id: 'metabolic-glucose', label: 'Glucose control', parentId: 'metabolic', aliases: ['glucose', 'blood sugar', 'glycemic control'], routeSegment: 'glucose', searchTerms: ['blood sugar supplements'] },
  { id: 'metabolic-lipids', label: 'Lipids', parentId: 'metabolic', aliases: ['cholesterol', 'lipids', 'triglycerides'], routeSegment: 'lipids', searchTerms: ['cholesterol supplements'] },
  { id: 'metabolic-weight', label: 'Weight outcomes', parentId: 'metabolic', aliases: ['weight', 'body weight'], routeSegment: 'weight', searchTerms: ['weight supplements evidence'] },

  { id: 'exercise', label: 'Exercise performance', aliases: ['exercise', 'performance'], routeSegment: 'exercise', searchTerms: ['exercise supplements'] },
  { id: 'exercise-strength', label: 'Strength', parentId: 'exercise', aliases: ['strength', 'muscle strength'], routeSegment: 'strength', searchTerms: ['strength supplements'] },
  { id: 'exercise-endurance', label: 'Endurance', parentId: 'exercise', aliases: ['endurance', 'aerobic performance'], routeSegment: 'endurance', searchTerms: ['endurance supplements'] },
  { id: 'exercise-recovery', label: 'Recovery', parentId: 'exercise', aliases: ['recovery', 'exercise recovery'], routeSegment: 'recovery', searchTerms: ['exercise recovery supplements'] },

  { id: 'cognition', label: 'Cognition', aliases: ['cognition', 'cognitive function'], routeSegment: 'cognition', searchTerms: ['cognitive supplements'] },
  { id: 'cognition-memory', label: 'Memory', parentId: 'cognition', aliases: ['memory', 'recall'], routeSegment: 'memory', searchTerms: ['memory supplements'] },
  { id: 'cognition-processing-speed', label: 'Processing speed', parentId: 'cognition', aliases: ['processing speed', 'reaction time'], routeSegment: 'processing-speed', searchTerms: ['processing speed supplements'] },
  { id: 'cognition-executive-function', label: 'Executive function', parentId: 'cognition', aliases: ['executive function', 'cognitive flexibility'], routeSegment: 'executive-function', searchTerms: ['executive function supplements'] },
]

const normalizedAlias = new Map<string, ConditionOntologyNode>()
for (const node of CONDITION_ONTOLOGY) {
  normalizedAlias.set(node.label.toLowerCase(), node)
  normalizedAlias.set(node.id, node)
  for (const alias of node.aliases) normalizedAlias.set(alias.toLowerCase(), node)
}

export function getConditionNode(id: ConditionNodeId) {
  return CONDITION_ONTOLOGY.find((node) => node.id === id) ?? null
}

export function conditionChildren(domain: ConditionDomain) {
  return CONDITION_ONTOLOGY.filter((node) => node.parentId === domain)
}

export function normalizeCondition(value: string) {
  return normalizedAlias.get(value.trim().toLowerCase()) ?? null
}

export function conditionAncestors(id: ConditionNodeId): ConditionOntologyNode[] {
  const node = getConditionNode(id)
  if (!node) return []
  if (!node.parentId) return [node]
  const parent = getConditionNode(node.parentId)
  return parent ? [parent, node] : [node]
}

export function conditionBreadcrumb(id: ConditionNodeId) {
  return conditionAncestors(id).map((node) => ({ label: node.label, routeSegment: node.routeSegment }))
}

export function internalLinkTargets(id: ConditionNodeId) {
  const node = getConditionNode(id)
  if (!node) return []

  const siblings = node.parentId
    ? conditionChildren(node.parentId).filter((candidate) => candidate.id !== node.id)
    : conditionChildren(node.id as ConditionDomain)

  return [
    ...(node.parentId ? [getConditionNode(node.parentId)].filter(Boolean) : []),
    ...siblings,
  ].map((target) => ({
    id: target!.id,
    label: target!.label,
    href: `/conditions/${target!.routeSegment}`,
  }))
}

export function contentClusterFor(id: ConditionNodeId) {
  const node = getConditionNode(id)
  if (!node) return null
  const root = node.parentId ? getConditionNode(node.parentId) : node
  return {
    pillar: root ? `/conditions/${root.routeSegment}` : null,
    current: `/conditions/${node.routeSegment}`,
    related: internalLinkTargets(id),
    searchTerms: [...new Set([...(root?.searchTerms ?? []), ...node.searchTerms])],
  }
}
