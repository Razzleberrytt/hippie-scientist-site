import { formatDisplayLabel, isClean, list, text, unique } from './display-utils'

export type EditorialEntity = Record<string, unknown>

export type DiscoveryLink = {
  href: string
  title: string
  description: string
  meta?: string
  kind?: 'herb' | 'compound' | 'article' | 'path'
}

export type BlogPostRecord = {
  slug: string
  title: string
  excerpt?: string
  content?: string
  date?: string
  readingTime?: string
  profile_status?: string
  sitemap_included?: boolean
  controlled_substance?: boolean
  ai_assisted?: boolean
  tags?: string[]
  categories?: string[]
}

const normalize = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const words = (value = '') => new Set(normalize(value).split(' ').filter(word => word.length > 2))
const sharedCount = (left: string[] = [], right: string[] = []) => {
  const rightValues = new Set(right.map(normalize).filter(Boolean))
  return left.map(normalize).filter(value => value && rightValues.has(value)).length
}

export const getEntityLabel = (entity: EditorialEntity) => (
  formatDisplayLabel(entity.displayName) ||
  formatDisplayLabel(entity.name) ||
  formatDisplayLabel(entity.title) ||
  formatDisplayLabel(entity.slug)
)

export const getEntitySearchText = (entity: EditorialEntity) => unique([
  getEntityLabel(entity),
  text(entity.summary),
  text(entity.description),
  text(entity.mechanism_summary),
  text(entity.pathway),
  text(entity.pathways),
  ...list(entity.primary_effects),
  ...list(entity.primaryActions),
  ...list(entity.effects),
  ...list(entity.mechanisms),
  ...list(entity.compounds),
  ...list(entity.active_compounds),
  ...list(entity.constituents),
  ...list(entity.pathways),
  ...list(entity.tags),
].filter(Boolean)).join(' ')

const getEntityCompounds = (entity: EditorialEntity) =>
  unique([
    ...list(entity.compounds),
    ...list(entity.active_compounds),
    ...list(entity.constituents),
    ...list(entity.key_compounds),
  ].map(formatDisplayLabel).filter(isClean))

const getEntityMechanisms = (entity: EditorialEntity) =>
  unique([
    ...list(entity.mechanisms),
    ...list(entity.mechanism_tags),
    formatDisplayLabel(entity.mechanism_summary),
  ].map(formatDisplayLabel).filter(isClean))

const getEntityPathways = (entity: EditorialEntity) =>
  unique([
    ...list(entity.pathways),
    ...list(entity.pathway),
    ...list(entity.pathway_tags),
  ].map(formatDisplayLabel).filter(isClean))

const getEntityEvidenceClusters = (entity: EditorialEntity) =>
  unique([
    ...list(entity.evidence_clusters),
    ...list(entity.primary_effects),
    ...list(entity.primaryActions),
    ...list(entity.effects),
  ].map(formatDisplayLabel).filter(isClean))

const scoreArticleEntityRelationship = (
  post: BlogPostRecord,
  entity: EditorialEntity,
  label: string,
) => {
  const titleText = normalize(post.title || '')
  const bodyText = normalize([post.excerpt, post.content].filter(Boolean).join(' '))
  const fullText = `${titleText} ${bodyText}`
  const postTaxonomy = unique([...(post.tags || []), ...(post.categories || [])].map(formatDisplayLabel).filter(isClean))
  const postWords = words(fullText)

  const labelText = normalize(label)
  const exactTitleScore = labelText && titleText.includes(labelText) ? 30 : 0
  const exactBodyScore = labelText && bodyText.includes(labelText) ? 12 : 0

  const compoundMatches = getEntityCompounds(entity).filter(value => fullText.includes(normalize(value))).length
  const mechanismMatches = getEntityMechanisms(entity).filter(value => fullText.includes(normalize(value))).length
  const pathwayMatches = getEntityPathways(entity).filter(value => fullText.includes(normalize(value))).length
  const evidenceMatches = sharedCount(getEntityEvidenceClusters(entity), postTaxonomy)
  const taxonomyMatches = sharedCount([...list(entity.tags), ...list(entity.categories)], postTaxonomy)

  const entityWords = words(getEntitySearchText(entity))
  const weakWordOverlap = [...entityWords].filter(word => postWords.has(word)).length

  const score =
    exactTitleScore +
    exactBodyScore +
    compoundMatches * 8 +
    mechanismMatches * 5 +
    pathwayMatches * 5 +
    evidenceMatches * 4 +
    taxonomyMatches * 3 +
    Math.min(weakWordOverlap, 4)

  return {
    score,
    hasStrongSignal: exactTitleScore > 0 || exactBodyScore > 0 || compoundMatches > 0 || mechanismMatches > 0 || pathwayMatches > 0,
  }
}

export const getMechanismFamily = (value = '') => {
  const normalized = normalize(value)
  if (/gaba|glutamate|serotonin|dopamine|cortisol|hpa|stress|brain|sleep|calm|mood/.test(normalized)) return 'Neuroendocrine / nervous system'
  if (/inflamm|cytokine|immune|nf kb|nfkb/.test(normalized)) return 'Inflammation / immune signaling'
  if (/glucose|insulin|ampk|metabolic|mitochond|energy/.test(normalized)) return 'Metabolic energy pathways'
  if (/nitric|vascular|blood pressure|endothelial|circulation/.test(normalized)) return 'Vascular tone & circulation'
  if (/antioxidant|oxidative|nrf2|cellular/.test(normalized)) return 'Cellular defense & resilience'
  return 'Whole-system context'
}

export const getEffectCluster = (value = '') => {
  const normalized = normalize(value)
  if (/sleep|dream|night|rest/.test(normalized)) return 'Sleep & recovery'
  if (/stress|anxiety|mood|calm|cortisol/.test(normalized)) return 'Stress & mood'
  if (/focus|cognition|memory|brain|fatigue|energy/.test(normalized)) return 'Cognition & energy'
  if (/immune|inflamm|joint|pain|recovery/.test(normalized)) return 'Recovery & resilience'
  if (/digest|gut|liver|metabolic|glucose|weight/.test(normalized)) return 'Metabolic & digestive'
  return 'General wellness context'
}

export const getEvidenceMaturityLabel = (value = '') => {
  const normalized = normalize(value)
  if (/a tier|strong|high|robust|human data|clinical/.test(normalized)) return 'Human evidence visible'
  if (/moderate|promising|b tier|mixed/.test(normalized)) return 'Promising but uneven'
  if (/limited|early|c tier|d tier|traditional|preclinical/.test(normalized)) return 'Early / traditional signal'
  return 'Evidence needs interpretation'
}

export const getResearchStyleLabel = (entity: EditorialEntity) => {
  const sourceText = normalize([
    text(entity.evidence_grade),
    text(entity.evidenceLevel),
    text(entity.evidence_tier),
    getEntitySearchText(entity),
  ].join(' '))

  if (/traditional|ayurveda|tcm|folk|ethnobot/.test(sourceText)) return 'Traditional-use led'
  if (/pmid|clinical|trial|human|randomized|meta/.test(sourceText)) return 'Human-study led'
  if (/mechanism|pathway|receptor|gaba|nrf2|ampk|cytokine/.test(sourceText)) return 'Mechanism-led'
  return 'Editorial synthesis'
}

export const buildSemanticTopics = (entity: EditorialEntity) => {
  const effects = unique([...list(entity.primary_effects), ...list(entity.primaryActions), ...list(entity.effects)].map(formatDisplayLabel).filter(isClean))
  const mechanisms = unique([...list(entity.mechanisms), formatDisplayLabel(entity.mechanism_summary)].filter(isClean))

  return {
    mechanisms: unique(mechanisms.map(getMechanismFamily)).slice(0, 4),
    effects: unique(effects.map(getEffectCluster)).slice(0, 4),
    maturity: getEvidenceMaturityLabel(text(entity.evidence_grade) || text(entity.evidenceLevel) || text(entity.evidence_tier)),
    researchStyle: getResearchStyleLabel(entity),
  }
}

export const findRelatedArticles = (entity: EditorialEntity, posts: BlogPostRecord[], limit = 4): DiscoveryLink[] => {
  const label = getEntityLabel(entity)

  return posts
    .map(post => {
      const relationship = scoreArticleEntityRelationship(post, entity, label)
      return { post, ...relationship }
    })
    .filter(item => item.hasStrongSignal && item.score >= 8)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => ({
      href: `/articles/${post.slug}`,
      title: post.title,
      description: post.excerpt || 'Editorial research note connected to this profile.',
      meta: [post.date, post.readingTime].filter(Boolean).join(' • '),
      kind: 'article',
    }))
}

export const findArticleEntities = (post: BlogPostRecord, entities: EditorialEntity[], kind: 'herb' | 'compound', limit = 6): DiscoveryLink[] => {
  return entities
    .map(entity => {
      const label = getEntityLabel(entity)
      const relationship = scoreArticleEntityRelationship(post, entity, label)
      return { entity, ...relationship }
    })
    .filter(item => item.entity.slug && item.hasStrongSignal && item.score >= 8)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entity }) => {
      const topics = buildSemanticTopics(entity)
      return {
        href: `/${kind === 'herb' ? 'herbs' : 'compounds'}/${entity.slug}`,
        title: getEntityLabel(entity),
        description: [topics.effects[0], topics.mechanisms[0]].filter(Boolean).join(' • ') || 'Related research profile',
        meta: `${topics.maturity} • ${topics.researchStyle}`,
        kind,
      }
    })
}
