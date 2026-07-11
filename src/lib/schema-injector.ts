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
 * Serialization: serializeJsonLd() centralises schema sanitization and the
 * HTML-safe escaping used when writing JSON-LD script payloads.
 */

import { sanitizeJsonLdPayload } from '@/lib/json-ld-sanitize'

export type JsonLdNode = Record<string, unknown>

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

/**
 * Sanitizes and serializes a JSON-LD payload for use in an HTML script element.
 * Escapes <, >, and & to their Unicode escape sequences so an untrusted value
 * cannot break out of the enclosing <script> tag.
 */
export function serializeJsonLd(node: unknown): string {
  const sanitized = sanitizeJsonLdPayload(node)

  return JSON.stringify(sanitized ?? {})
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
  /** Author/publisher display name */
  authorName?: string
  /** Author/publisher absolute URL */
  authorUrl?: string
  /**
   * Evidence grade string emitted as a PropertyValue, e.g. "B — Moderate".
   * Provides structured context for automated parsers without polluting
   * the core Article fields.
   */
  evidenceGrade?: string
  /**
   * Optional list of cited sources emitted as schema:citation nodes.
   * Each entry should be a descriptive title or full bibliographic reference.
   * Strengthens AI-search discovery signals for scholarly herb research pages.
   */
  citations?: string[]
}

/**
 * Builds a Schema.org Article node for a herb evidence profile page.
 *
 * Google Rich Results minimum required fields:
 *   - headline (required)
 *   - image   (required for Article rich result appearance)
 *   - datePublished (required)
 *   - author.name (required)
 *
 * Supply image, datePublished, and authorName to unlock Article rich results.
 */
export function buildHerbArticleSchema(args: HerbArticleSchemaArgs): JsonLdNode {
  const publisher: JsonLdNode = {
    '@type': 'Organization',
    name: args.authorName ?? 'The Hippie Scientist',
    url: args.authorUrl ?? 'https://thehippiescientist.net',
  }

  const node: JsonLdNode = {
    '@context': 'https://schema.org',
    // ScholarlyArticle is a Schema.org subtype of Article — keeps Article rich
    // result eligibility while providing stronger AI-search discovery signals
    // for botanical research pages.
    '@type': ['ScholarlyArticle', 'Article'],
    headline: args.headline,
    description: args.description,
    url: args.url,
    author: publisher,
    publisher: publisher,
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

  return node
}
