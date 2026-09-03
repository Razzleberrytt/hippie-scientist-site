export const ARTICLE_SOCIAL_CARD_VERSION = 2
export const ARTICLE_SOCIAL_CARD_WIDTH = 1200
export const ARTICLE_SOCIAL_CARD_HEIGHT = 630
export const ARTICLE_SOCIAL_CARD_FORMAT = 'jpeg'
export const ARTICLE_SOCIAL_CATEGORY_MAX_LENGTH = 42

const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim()

const truncate = (value, max) => {
  const text = clean(value)
  if (text.length <= max) return text
  return `${text.slice(0, Math.max(1, max - 1)).trimEnd()}…`
}

export function normalizeArticleSocialTitle(value) {
  return clean(value)
    .replace(/\s*\|\s*The Hippie Scientist\s*$/i, '')
    .replace(/\s*\(2026\)\s*$/i, '')
    .trim()
}

export function normalizeArticleSocialCategory(value) {
  return truncate(clean(value || 'Evidence Review'), ARTICLE_SOCIAL_CATEGORY_MAX_LENGTH)
}

export function normalizeArticleSocialSourceCount(value) {
  return Number.isInteger(value) && value > 0 ? value : 0
}

export function articleSocialAssetPath(slug) {
  return `/media/social/articles/${clean(slug)}.jpg`
}

function fnv1a32(value) {
  let hash = 0x811c9dc5
  const input = String(value)
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash >>> 0
}

export function articleSocialCacheKey(source) {
  const slug = clean(source?.slug)
  const title = normalizeArticleSocialTitle(source?.title)
  const category = normalizeArticleSocialCategory(source?.category)
  const sourceCount = normalizeArticleSocialSourceCount(source?.sourceCount)
  const identity = [
    `template:${ARTICLE_SOCIAL_CARD_VERSION}`,
    `slug:${slug}`,
    `title:${title}`,
    `category:${category}`,
    `sources:${sourceCount}`,
  ].join('|')
  const digest = fnv1a32(identity).toString(36).padStart(7, '0')
  return `${ARTICLE_SOCIAL_CARD_VERSION}-${digest}`
}

export function articleSocialImagePath(source) {
  return `${articleSocialAssetPath(source?.slug)}?v=${articleSocialCacheKey(source)}`
}

export function articleSocialAltText(title) {
  const normalized = normalizeArticleSocialTitle(title)
  return normalized ? `${normalized} — The Hippie Scientist` : 'The Hippie Scientist article preview'
}
