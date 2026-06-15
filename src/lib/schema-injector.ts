/**
 * JSON-LD injection utilities for Product and Article schema types.
 *
 * These builders complement the MedicalWebPage/@graph system in schema-graph.ts
 * by producing standalone Product and Article nodes suitable for Google Rich Results.
 * They are deliberately separate from the @graph to avoid type conflicts with
 * MedicalWebPage nodes and to allow per-section injection.
 *
 * Serialization: serializeJsonLd() centralises the HTML-safe escaping used when
 * writing JSON-LD script payloads.
 */

export type JsonLdNode = Record<string, unknown>

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

/**
 * Serializes a JSON-LD node to a string safe for use in HTML script elements.
 * Escapes <, >, and & to their Unicode escape sequences so a malicious value
 * cannot break out of the enclosing <script> tag.
 */
export function serializeJsonLd(node: JsonLdNode): string {
  return JSON.stringify(node)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

// ---------------------------------------------------------------------------
// Product schema
// ---------------------------------------------------------------------------

export type HerbProductSchemaArgs = {
  /** Common display name, e.g. "Ashwagandha" */
  name: string
  /** One-sentence description used as schema description */
  description: string
  /** Absolute canonical URL for the profile page */
  url: string
  /** Absolute URL of the representative image (OG image is fine) */
  image?: string
  /** Brand name; defaults to site name */
  brand?: string
  /** Value used as schema `sku` — the herb slug works well */
  sku?: string
  /** Product category label, e.g. "Herbal Supplement" */
  category?: string
  /** Optional pricing information for Offer node */
  offers?: {
    price: number
    priceCurrency: string
    /** Defaults to https://schema.org/InStock */
    availability?: string
    /** Defaults to `url` */
    offerUrl?: string
  }
}

/**
 * Builds a Schema.org Product node for a herb supplement profile.
 *
 * Unlike the existing productJsonLd() in src/lib/seo.ts, this function does
 * not require a price: it emits a valid Product node that satisfies Google's
 * minimum requirements for basic product appearance (name + description +
 * brand). An Offer sub-node is added only when price data is supplied.
 *
 * Google Rich Results minimum required fields satisfied here:
 *   - name (required)
 *   - description (one of the qualifying additional properties)
 */
export function buildHerbProductSchema(args: HerbProductSchemaArgs): JsonLdNode {
  const node: JsonLdNode = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: args.name,
    description: args.description,
    url: args.url,
    brand: {
      '@type': 'Brand',
      name: args.brand ?? 'The Hippie Scientist',
    },
  }

  if (args.image) node.image = args.image
  if (args.sku) node.sku = args.sku
  if (args.category) node.category = args.category

  if (args.offers) {
    node.offers = {
      '@type': 'Offer',
      price: args.offers.price,
      priceCurrency: args.offers.priceCurrency,
      availability: args.offers.availability ?? 'https://schema.org/InStock',
      url: args.offers.offerUrl ?? args.url,
    }
  }

  return node
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
    '@type': 'Article',
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

  if (args.evidenceGrade) {
    node.additionalProperty = {
      '@type': 'PropertyValue',
      name: 'Evidence grade',
      value: args.evidenceGrade,
    }
  }

  return node
}
