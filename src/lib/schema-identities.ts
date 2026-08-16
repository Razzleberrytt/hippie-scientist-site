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

function hasSchemaType(node: Record<string, unknown>, expected: string): boolean {
  const type = node['@type']
  return Array.isArray(type) ? type.includes(expected) : type === expected
}

/**
 * Canonicalize only the site's two first-party authority entities. The
 * relationship name matters: historical builders sometimes used the site
 * Organization as an Article `author`; that exact first-party author role is
 * normalized to the canonical Person. Publisher/reviewer Organization roles
 * remain organizations. Third-party identities are never rewritten.
 */
export function normalizeSiteSchemaIdentities(value: unknown, relationship = ''): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeSiteSchemaIdentities(entry, relationship))
  }
  if (!value || typeof value !== 'object') return value

  const source = value as Record<string, unknown>
  const normalized = Object.fromEntries(
    Object.entries(source).map(([key, child]) => [
      key,
      normalizeSiteSchemaIdentities(child, key),
    ]),
  ) as Record<string, unknown>

  const isFirstPartyOrganization = hasSchemaType(normalized, 'Organization') && normalized.name === SITE_NAME

  if (relationship === 'author' && isFirstPartyOrganization) {
    return authorSchemaIdentity()
  }

  if (isFirstPartyOrganization) {
    return {
      ...normalized,
      '@id': ORGANIZATION_SCHEMA_ID,
      url: SITE_URL,
    }
  }

  if (hasSchemaType(normalized, 'Person') && normalized.name === AUTHOR_NAME) {
    return {
      ...normalized,
      '@id': AUTHOR_SCHEMA_ID,
      url: AUTHOR_URL,
      affiliation: normalized.affiliation ?? organizationSchemaRef(),
    }
  }

  return normalized
}
