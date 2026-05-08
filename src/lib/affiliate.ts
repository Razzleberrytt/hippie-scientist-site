import { isClean, list, text } from '@/lib/display-utils'

export const AMAZON_ASSOCIATE_ID = 'razzleberry02-20'

type AffiliateSearchLink = {
  label: string
  url: string
  helperText: string
}

function hasResearchPendingEffect(item: any) {
  return list(item?.primary_effects).some((effect) => /research-pending/i.test(effect))
}

export function normalizeAffiliateQuery(name: string, affiliate_query?: string) {
  return text(affiliate_query) || text(name)
}

export function buildAmazonSearchUrl(query: string) {
  const encoded = encodeURIComponent(text(query).replace(/-/g, ' ').replace(/\s+/g, ' ').trim())
  return `https://www.amazon.com/s?k=${encoded}&tag=${AMAZON_ASSOCIATE_ID}`
}

export function canShowAffiliateModule(item: any) {
  if (!item) return false
  if (!item.affiliate_ready) return false
  if (/^hide$/i.test(text(item.runtime_export_decision))) return false
  if (/^minimal$/i.test(text(item.profile_status))) return false
  if (hasResearchPendingEffect(item)) return false

  return true
}

export function getAffiliateShopLinks(item: any, fallbackName: string, kind: 'herb' | 'compound' = 'herb'): AffiliateSearchLink[] {
  if (!canShowAffiliateModule(item)) return []

  const query = normalizeAffiliateQuery(fallbackName, item.affiliate_query)
  if (!isClean(query)) return []

  const curatedUrl = text(item.amazon_affiliate_url) || text(item.affiliate_url) || text(item.product_url)

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
  ]
}

export function getHerbSearchLinks(herbName: string): AffiliateSearchLink[] {
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
  ]
}

export function getCompoundSearchLinks(compoundName: string): AffiliateSearchLink[] {
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
  ]
}
