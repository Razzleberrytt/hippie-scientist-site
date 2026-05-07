import { formatDisplayLabel, isClean, list, text, unique } from './display-utils'

export type EditorialEntity = Record<string, any>

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
}

const normalize = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const words = (value = '') => new Set(normalize(value).split(' ').filter(word => word.length > 2))

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
  ...list(entity.primary_effects),
  ...list(entity.primaryActions),
  ...list(entity.effects),
  ...list(entity.mechanisms),
  ...list(entity.tags),
].filter(Boolean)).join(' ')

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
  const entityWords = words([label, getEntitySearchText(entity)].join(' '))

  return posts
    .map(post => {
      const haystack = [post.title, post.excerpt, post.content].filter(Boolean).join(' ')
      const postWords = words(haystack)
      const exactNameScore = normalize(haystack).includes(normalize(label)) ? 8 : 0
      const overlapScore = [...entityWords].filter(word => postWords.has(word)).length
      return { post, score: exactNameScore + overlapScore }
    })
    .filter(item => item.score > 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => ({
      href: `/blog/${post.slug}`,
      title: post.title,
      description: post.excerpt || 'Editorial research note connected to this profile.',
      meta: [post.date, post.readingTime].filter(Boolean).join(' • '),
      kind: 'article',
    }))
}

export const findArticleEntities = (post: BlogPostRecord, entities: EditorialEntity[], kind: 'herb' | 'compound', limit = 6): DiscoveryLink[] => {
  const haystack = [post.title, post.excerpt, post.content].filter(Boolean).join(' ')
  const postWords = words(haystack)

  return entities
    .map(entity => {
      const label = getEntityLabel(entity)
      const exactNameScore = normalize(haystack).includes(normalize(label)) ? 10 : 0
      const entityWords = words(getEntitySearchText(entity))
      const overlapScore = [...entityWords].filter(word => postWords.has(word)).length
      return { entity, score: exactNameScore + overlapScore }
    })
    .filter(item => item.score > 1 && item.entity.slug)
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
