import { describe, expect, it } from 'vitest'
import {
  serializeJsonLd,
  buildHerbArticleSchema,
} from '../schema-injector'

// ---------------------------------------------------------------------------
// serializeJsonLd
// ---------------------------------------------------------------------------

describe('serializeJsonLd', () => {
  it('produces valid JSON', () => {
    const result = serializeJsonLd({ '@type': 'Article', name: 'Ashwagandha' })
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
    expect(schema['@type']).toEqual(expect.arrayContaining(['ScholarlyArticle', 'Article']))
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
