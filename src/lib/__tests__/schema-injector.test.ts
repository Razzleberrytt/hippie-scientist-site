import { describe, expect, it } from 'vitest'
import {
  serializeJsonLd,
  buildHerbProductSchema,
  buildHerbArticleSchema,
} from '../schema-injector'

// ---------------------------------------------------------------------------
// serializeJsonLd
// ---------------------------------------------------------------------------

describe('serializeJsonLd', () => {
  it('produces valid JSON', () => {
    const result = serializeJsonLd({ '@type': 'Product', name: 'Ashwagandha' })
    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('escapes < to prevent </script> injection', () => {
    const malicious = '</script><script>alert(1)</script>'
    const result = serializeJsonLd({ name: malicious })
    expect(result).not.toContain('</script>')
    expect(result).toContain('\\u003c')
  })

  it('escapes > to close script-injection vectors', () => {
    const result = serializeJsonLd({ value: '<img src=x onerror=alert(1)>' })
    expect(result).not.toContain('>')
    expect(result).toContain('\\u003e')
  })

  it('escapes & to prevent entity injection', () => {
    const result = serializeJsonLd({ url: 'https://example.com/?a=1&b=2' })
    expect(result).not.toContain('&b')
    expect(result).toContain('\\u0026')
  })

  it('round-trips cleanly through JSON.parse', () => {
    const node = { '@type': 'Article', headline: 'A & B < C > D', url: 'https://example.com/' }
    const serialized = serializeJsonLd(node)
    const parsed = JSON.parse(serialized)
    expect(parsed['@type']).toBe('Article')
    expect(parsed.headline).toBe('A & B < C > D')
  })
})

// ---------------------------------------------------------------------------
// buildHerbProductSchema — Google Rich Results compliance
// ---------------------------------------------------------------------------

describe('buildHerbProductSchema', () => {
  const base = {
    name: 'Ashwagandha',
    description: 'An adaptogenic herb used to reduce stress and anxiety.',
    url: 'https://thehippiescientist.net/herbs/ashwagandha/',
  }

  it('emits required @context and @type', () => {
    const schema = buildHerbProductSchema(base)
    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('Product')
  })

  it('includes the required name field (Google Rich Results)', () => {
    const schema = buildHerbProductSchema(base)
    expect(schema.name).toBe('Ashwagandha')
  })

  it('includes description as a qualifying additional property', () => {
    const schema = buildHerbProductSchema(base)
    expect(schema.description).toBe(base.description)
  })

  it('includes url', () => {
    const schema = buildHerbProductSchema(base)
    expect(schema.url).toBe(base.url)
  })

  it('defaults brand to The Hippie Scientist', () => {
    const schema = buildHerbProductSchema(base)
    expect(schema.brand).toEqual({ '@type': 'Brand', name: 'The Hippie Scientist' })
  })

  it('accepts a custom brand name', () => {
    const schema = buildHerbProductSchema({ ...base, brand: 'Custom Brand' })
    const brand = schema.brand as Record<string, unknown>
    expect(brand.name).toBe('Custom Brand')
  })

  it('omits image when not provided', () => {
    const schema = buildHerbProductSchema(base)
    expect(schema.image).toBeUndefined()
  })

  it('includes image when provided', () => {
    const schema = buildHerbProductSchema({ ...base, image: 'https://thehippiescientist.net/og-ashwagandha.jpg' })
    expect(schema.image).toBe('https://thehippiescientist.net/og-ashwagandha.jpg')
  })

  it('includes sku when provided', () => {
    const schema = buildHerbProductSchema({ ...base, sku: 'ashwagandha' })
    expect(schema.sku).toBe('ashwagandha')
  })

  it('includes category when provided', () => {
    const schema = buildHerbProductSchema({ ...base, category: 'Herbal Supplement' })
    expect(schema.category).toBe('Herbal Supplement')
  })

  it('omits offers node when no price is supplied', () => {
    const schema = buildHerbProductSchema(base)
    expect(schema.offers).toBeUndefined()
  })

  it('emits a valid Offer node when price is supplied', () => {
    const schema = buildHerbProductSchema({
      ...base,
      offers: { price: 19.99, priceCurrency: 'USD' },
    })
    const offers = schema.offers as Record<string, unknown>
    expect(offers['@type']).toBe('Offer')
    expect(offers.price).toBe(19.99)
    expect(offers.priceCurrency).toBe('USD')
    expect(offers.availability).toBe('https://schema.org/InStock')
    expect(offers.url).toBe(base.url)
  })

  it('uses custom offerUrl when supplied in offers', () => {
    const schema = buildHerbProductSchema({
      ...base,
      offers: { price: 24.99, priceCurrency: 'USD', offerUrl: 'https://amazon.com/dp/B000X' },
    })
    const offers = schema.offers as Record<string, unknown>
    expect(offers.url).toBe('https://amazon.com/dp/B000X')
  })

  it('uses custom availability when supplied', () => {
    const schema = buildHerbProductSchema({
      ...base,
      offers: { price: 24.99, priceCurrency: 'USD', availability: 'https://schema.org/OnlineOnly' },
    })
    const offers = schema.offers as Record<string, unknown>
    expect(offers.availability).toBe('https://schema.org/OnlineOnly')
  })

  it('serializes without XSS vectors', () => {
    const schema = buildHerbProductSchema({ ...base, description: '<script>alert(1)</script>' })
    const serialized = serializeJsonLd(schema)
    expect(serialized).not.toContain('<script>')
  })
})

// ---------------------------------------------------------------------------
// buildHerbArticleSchema — Google Rich Results compliance
// ---------------------------------------------------------------------------

describe('buildHerbArticleSchema', () => {
  const base = {
    headline: 'Ashwagandha Benefits, Dosage & Safety',
    description: 'Evidence-based review of ashwagandha: stress, sleep, and safety data.',
    url: 'https://thehippiescientist.net/herbs/ashwagandha/',
    image: 'https://thehippiescientist.net/og-ashwagandha.jpg',
    datePublished: '2026-01-15',
    dateModified: '2026-06-14',
  }

  it('emits required @context and @type', () => {
    const schema = buildHerbArticleSchema(base)
    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('Article')
  })

  it('includes headline (required for Article rich results)', () => {
    const schema = buildHerbArticleSchema(base)
    expect(schema.headline).toBe(base.headline)
  })

  it('includes image (required for Article rich results)', () => {
    const schema = buildHerbArticleSchema(base)
    expect(schema.image).toBe(base.image)
  })

  it('includes datePublished (required for Article rich results)', () => {
    const schema = buildHerbArticleSchema(base)
    expect(schema.datePublished).toBe('2026-01-15')
  })

  it('includes dateModified when provided', () => {
    const schema = buildHerbArticleSchema(base)
    expect(schema.dateModified).toBe('2026-06-14')
  })

  it('omits dateModified when not provided', () => {
    const { dateModified: _, ...noModified } = base
    const schema = buildHerbArticleSchema(noModified)
    expect(schema.dateModified).toBeUndefined()
  })

  it('includes author.name (required for Article rich results)', () => {
    const schema = buildHerbArticleSchema(base)
    const author = schema.author as Record<string, unknown>
    expect(typeof author.name).toBe('string')
    expect((author.name as string).length).toBeGreaterThan(0)
  })

  it('defaults author name to The Hippie Scientist', () => {
    const schema = buildHerbArticleSchema(base)
    const author = schema.author as Record<string, unknown>
    expect(author.name).toBe('The Hippie Scientist')
  })

  it('accepts a custom author name', () => {
    const schema = buildHerbArticleSchema({ ...base, authorName: 'Custom Author' })
    const author = schema.author as Record<string, unknown>
    expect(author.name).toBe('Custom Author')
  })

  it('publisher matches author (required for Article rich results)', () => {
    const schema = buildHerbArticleSchema(base)
    expect(schema.author).toEqual(schema.publisher)
  })

  it('includes mainEntityOfPage linking back to the URL', () => {
    const schema = buildHerbArticleSchema(base)
    const mep = schema.mainEntityOfPage as Record<string, unknown>
    expect(mep['@type']).toBe('WebPage')
    expect(mep['@id']).toBe(base.url)
  })

  it('omits image when not provided', () => {
    const { image: _, ...noImage } = base
    const schema = buildHerbArticleSchema(noImage)
    expect(schema.image).toBeUndefined()
  })

  it('emits evidenceGrade as a PropertyValue when provided', () => {
    const schema = buildHerbArticleSchema({ ...base, evidenceGrade: 'B — Moderate' })
    const prop = schema.additionalProperty as Record<string, unknown>
    expect(prop['@type']).toBe('PropertyValue')
    expect(prop.name).toBe('Evidence grade')
    expect(prop.value).toBe('B — Moderate')
  })

  it('omits additionalProperty when evidenceGrade is absent', () => {
    const schema = buildHerbArticleSchema(base)
    expect(schema.additionalProperty).toBeUndefined()
  })

  it('serializes without XSS vectors', () => {
    const schema = buildHerbArticleSchema({
      ...base,
      headline: '"><script>alert(1)</script>',
    })
    const serialized = serializeJsonLd(schema)
    expect(serialized).not.toContain('<script>')
    expect(serialized).not.toContain('">')
  })
})
