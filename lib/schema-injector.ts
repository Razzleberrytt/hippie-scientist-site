/**
 * JSON-LD injection utilities for Article schema.
 *
 * This builder complements the MedicalWebPage/@graph system in schema-graph.ts
 * by producing a standalone Article node suitable for Google Rich Results.
 * It is deliberately separate from the @graph to avoid type conflicts with
 * MedicalWebPage nodes and to allow per-section injection.
 *
 * Informational herb profiles are not commercial product listings, so no
 * Product node is emitted here — Product schema was intentionally removed.
 *
 * Serialization: serializeJsonLd() centralises schema sanitization, first-party
 * identity normalization, and HTML-safe escaping for JSON-LD script payloads.
 */

import { sanitizeJsonLdPayload } from '@/lib/json-ld-sanitize'
import {
  AUTHOR_NAME,
  AUTHOR_URL,
  ORGANIZATION_SCHEMA_ID,
  authorSchemaRef,
  normalizeSiteSchemaIdentities,
  organizationSchemaIdentity,
} from './schema-identities'

export type JsonLdNode = Record<string, unknown>

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

/**
 * Sanitizes and serializes a JSON-LD payload for use in an HTML script element.
 * First-party author/publisher objects are normalized to their canonical IDs,
 * then <, >, and & are escaped so values cannot break out of the script tag.
 */
export function serializeJsonLd(node: unknown): string {
  const sanitized = sanitizeJsonLdPayload(node)
  const normalized = normalizeSiteSchemaIdentities(sanitized)

  return JSON.stringify(normalized ?? {})
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

// ---------------------------------------------------------------------------
// Article schema
// ---------------------------------------------------------------------------

export type HerbArticleSchemaArgs = {
  /** Page headline / H1, max 110 chars for AMP eligibility */
  headline: string
  /** Meta description or first-sentence summary */
  description: string
  /** Absolute canonical URL */
  url: string
  /** Absolute URL of the representative image — required for Article rich results */
  image?: string
  /** ISO 8601 date, e.g. "2026-01-15" */
  datePublished?: string
  /** ISO 8601 date, e.g. "2026-06-14" */
  dateModified?: string
  /** Author display name. The canonical site author remains Willie unless explicitly different. */
  authorName?: string
  /** Author absolute URL. */
  authorUrl?: string
  /** Evidence grade retained for API compatibility; not emitted as Article additionalProperty. */
  evidenceGrade?: string
  /**
   * Optional list of cited sources emitted as schema:citation nodes.
   * Each entry should be a descriptive title or full bibliographic reference.
   */
  citations?: string[]
}

/**
 * Builds a Schema.org Article node for a herb evidence profile page.
 */
export function buildHerbArticleSchema(args: HerbArticleSchemaArgs): JsonLdNode {
  const isCanonicalAuthor =
    (!args.authorName || args.authorName === AUTHOR_NAME)
    && (!args.authorUrl || args.authorUrl === AUTHOR_URL)

  const author: JsonLdNode = isCanonicalAuthor
    ? { '@type': 'Person', ...authorSchemaRef(), name: AUTHOR_NAME, url: AUTHOR_URL }
    : {
        '@type': 'Person',
        name: args.authorName ?? AUTHOR_NAME,
        ...(args.authorUrl ? { url: args.authorUrl } : {}),
      }

  const node: JsonLdNode = {
    '@context': 'https://schema.org',
    '@type': ['ScholarlyArticle', 'Article'],
    headline: args.headline,
    description: args.description,
    url: args.url,
    author,
    publisher: organizationSchemaIdentity(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': args.url,
    },
  }

  if (args.image) node.image = args.image
  if (args.datePublished) node.datePublished = args.datePublished
  if (args.dateModified) node.dateModified = args.dateModified

  if (args.citations && args.citations.length > 0) {
    node.citation = args.citations.map(title => ({
      '@type': 'CreativeWork',
      name: title,
    }))
  }

  if ((node.publisher as Record<string, unknown>)['@id'] !== ORGANIZATION_SCHEMA_ID) {
    throw new Error('Herb article publisher identity drifted from canonical organization')
  }

  return node
}
