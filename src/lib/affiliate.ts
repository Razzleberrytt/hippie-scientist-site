export const AMAZON_ASSOCIATE_ID = 'razzleberry02-20'

type AffiliateSearchLink = {
  label: string
  url: string
  helperText: string
}

export function buildAmazonSearchUrl(query: string) {
  const encoded = encodeURIComponent(query)
  return `https://www.amazon.com/s?k=${encoded}&tag=${AMAZON_ASSOCIATE_ID}`
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
