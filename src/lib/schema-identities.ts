import { SITE_NAME, SITE_URL } from './site'

export const WEBSITE_SCHEMA_ID = `${SITE_URL}/#website`
export const ORGANIZATION_SCHEMA_ID = `${SITE_URL}/#organization`
export const AUTHOR_NAME = 'Willie B. Randolph III'
export const AUTHOR_URL = `${SITE_URL}/info/author/`
export const AUTHOR_SCHEMA_ID = `${AUTHOR_URL}#person`

export const ORGANIZATION_SOCIAL_URLS = [
  'https://x.com/TheHippieSci',
  'https://www.instagram.com/thehippiesci',
  'https://www.youtube.com/@TheHippieSci',
] as const

export function organizationSchemaRef() {
  return { '@id': ORGANIZATION_SCHEMA_ID }
}

export function websiteSchemaRef() {
  return { '@id': WEBSITE_SCHEMA_ID }
}

export function authorSchemaRef() {
  return { '@id': AUTHOR_SCHEMA_ID }
}

export function organizationSchemaIdentity() {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_SCHEMA_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.svg`,
    },
    sameAs: [...ORGANIZATION_SOCIAL_URLS],
  }
}

export function authorSchemaIdentity() {
  return {
    '@type': 'Person',
    '@id': AUTHOR_SCHEMA_ID,
    name: AUTHOR_NAME,
    url: AUTHOR_URL,
    affiliation: organizationSchemaRef(),
  }
}
