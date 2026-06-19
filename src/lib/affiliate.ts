import { isClean, list, text } from '@/lib/display-utils'
import { isRestrictedIngredient, isRestrictedRecord } from './restricted-ingredients'

export const AMAZON_ASSOCIATE_ID = 'razzleberry02-20'

export function extractUrlString(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const url = obj.hyperlink ?? obj.url ?? obj.value ?? obj.text
    if (typeof url === 'string') return url.trim()
  }
  return String(value).trim()
}

export function ensureAmazonAffiliateTag(url: string): string {
  if (!url) return ''
  if (!url.includes('amazon.com') && !url.includes('amazon.co.uk')) {
    return url
  }

  try {
    const urlObj = new URL(url)
    const tag = urlObj.searchParams.get('tag')
    if (tag !== AMAZON_ASSOCIATE_ID) {
      urlObj.searchParams.set('tag', AMAZON_ASSOCIATE_ID)
    }
    return urlObj.toString()
  } catch {
    if (url.includes('tag=')) {
      return url.replace(/tag=[^&]+/g, `tag=${AMAZON_ASSOCIATE_ID}`)
    } else {
      const separator = url.includes('?') ? '&' : '?'
      return `${url}${separator}tag=${AMAZON_ASSOCIATE_ID}`
    }
  }
}

type AffiliateSearchLink = {
  label: string
  url: string
  helperText: string
}

function hasResearchPendingEffect(item: any) {
  return list(item?.primary_effects).some((effect) => /research-pending/i.test(effect))
}

export function canRenderAffiliateLinks(item: any) {
  if (!item) return false

  // Compliance gate: never monetize or promote records flagged in the master workbook governance columns.
  return !isRestrictedRecord(item)
}

export function normalizeAffiliateQuery(name: string, affiliate_query?: string) {
  return text(affiliate_query) || text(name)
}

export function buildAmazonSearchUrl(query: string) {
  if (isRestrictedIngredient(query)) return ''
  const encoded = encodeURIComponent(text(query).replace(/-/g, ' ').replace(/\s+/g, ' ').trim())
  return `https://www.amazon.com/s?k=${encoded}&tag=${AMAZON_ASSOCIATE_ID}`
}

export function canShowAffiliateModule(item: any) {
  if (!item) return false
  if (!canRenderAffiliateLinks(item)) return false
  if (!item.affiliate_ready) return false
  if (/^hide$/i.test(text(item.runtime_export_decision))) return false
  if (/^minimal$/i.test(text(item.profile_status))) return false
  if (hasResearchPendingEffect(item)) return false

  return true
}

export function getAffiliateShopLinks(item: any, fallbackName: string, kind: 'herb' | 'compound' = 'herb'): AffiliateSearchLink[] {
  if (!canShowAffiliateModule(item)) return []

  const query = normalizeAffiliateQuery(fallbackName, item.affiliate_query)
  if (isRestrictedIngredient(query)) return []
  if (!isClean(query)) return []

  const rawUrl = extractUrlString(item.amazon_affiliate_url) || extractUrlString(item.affiliate_url) || extractUrlString(item.product_url)
  const curatedUrl = ensureAmazonAffiliateTag(rawUrl)
  if (isRestrictedIngredient(curatedUrl)) return []

  if (curatedUrl) {
    return [
      {
        label: 'Shop related products',
        url: curatedUrl,
        helperText: 'Curated product research link',
      },
    ]
  }

  const productType = text(item.default_product_type) || (kind === 'compound' ? 'supplement' : 'herbal supplement')

  return [
    {
      label: 'Shop related products',
      url: buildAmazonSearchUrl(`${query} ${productType}`),
      helperText: 'Compare labels, serving size, testing, and form before buying.',
    },
  ].filter(link => link.url)
}

export function getHerbSearchLinks(herbName: string): AffiliateSearchLink[] {
  if (isRestrictedIngredient(herbName)) return []
  return [
    {
      label: 'Capsules',
      url: buildAmazonSearchUrl(`${herbName} capsules supplement`),
      helperText: 'Common daily-use format',
    },
    {
      label: 'Extracts',
      url: buildAmazonSearchUrl(`${herbName} extract standardized supplement`),
      helperText: 'Compare concentrated forms',
    },
    {
      label: 'Powder or tea',
      url: buildAmazonSearchUrl(`${herbName} powder tea`),
      helperText: 'Loose or traditional forms',
    },
  ].filter(link => link.url)
}

export function getCompoundSearchLinks(compoundName: string): AffiliateSearchLink[] {
  if (isRestrictedIngredient(compoundName)) return []
  return [
    {
      label: 'Supplements',
      url: buildAmazonSearchUrl(`${compoundName} supplement`),
      helperText: 'General product search',
    },
    {
      label: 'Capsules',
      url: buildAmazonSearchUrl(`${compoundName} capsules`),
      helperText: 'Common supplement form',
    },
    {
      label: 'Powder',
      url: buildAmazonSearchUrl(`${compoundName} powder`),
      helperText: 'Bulk or mixable options',
    },
  ].filter(link => link.url)
}

export function getGovernedHerbSearchLinks(herb: any, fallbackName: string): AffiliateSearchLink[] {
  if (!canRenderAffiliateLinks(herb)) return []
  return getHerbSearchLinks(text(herb?.displayName || herb?.name || fallbackName))
}

export function getGovernedCompoundSearchLinks(compound: any, fallbackName: string): AffiliateSearchLink[] {
  if (!canRenderAffiliateLinks(compound)) return []
  return getCompoundSearchLinks(text(compound?.displayName || compound?.name || compound?.compoundName || fallbackName))
}
