import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import HerbSchemaGenerator from '../SchemaGenerator'

const BASE_PROPS = {
  name: 'Ashwagandha',
  slug: 'ashwagandha',
  description: 'An adaptogenic herb used to reduce stress and anxiety.',
  url: 'https://thehippiescientist.net/herbs/ashwagandha/',
  image: 'https://thehippiescientist.net/og-ashwagandha.jpg',
  dateReviewed: '2026-06-14',
  evidenceGrade: 'B — Moderate',
}

function getScripts(c: HTMLElement): { product?: Record<string, unknown>; article: Record<string, unknown> } {
  const scripts = c.querySelectorAll('script[type="application/ld+json"]')
  const parsed = Array.from(scripts).map(s => JSON.parse(s.textContent ?? '{}'))
  const product = parsed.find(p => p['@type'] === 'Product')
  const article = parsed.find(p => p['@type'] === 'Article')!
  return { product, article }
}

describe('HerbSchemaGenerator', () => {
  it('renders Article JSON-LD by default', () => {
    const { container: c } = render(<HerbSchemaGenerator {...BASE_PROPS} />)
    const scripts = c.querySelectorAll('script[type="application/ld+json"]')
    expect(scripts.length).toBe(1)
    const { article, product } = getScripts(c)
    expect(article['@type']).toBe('Article')
    expect(product).toBeUndefined()
  })

  // ----- Product schema -----

  it('Product node has correct @context and @type', () => {
    const { container: c } = render(<HerbSchemaGenerator {...BASE_PROPS} offer={{ price: 19.99, priceCurrency: 'USD' }} />)
    const { product } = getScripts(c)
    expect(product?.['@context']).toBe('https://schema.org')
    expect(product?.['@type']).toBe('Product')
  })

  it('Product node contains the herb name', () => {
    const { container: c } = render(<HerbSchemaGenerator {...BASE_PROPS} offer={{ price: 19.99, priceCurrency: 'USD' }} />)
    const { product } = getScripts(c)
    expect(product?.name).toBe('Ashwagandha')
  })

  it('Product node contains the description', () => {
    const { container: c } = render(<HerbSchemaGenerator {...BASE_PROPS} offer={{ price: 19.99, priceCurrency: 'USD' }} />)
    const { product } = getScripts(c)
    expect(product?.description).toBe(BASE_PROPS.description)
  })

  it('Product node uses slug as sku', () => {
    const { container: c } = render(<HerbSchemaGenerator {...BASE_PROPS} offer={{ price: 19.99, priceCurrency: 'USD' }} />)
    const { product } = getScripts(c)
    expect(product?.sku).toBe('ashwagandha')
  })

  it('Product node defaults category to Herbal Supplement', () => {
    const { container: c } = render(<HerbSchemaGenerator {...BASE_PROPS} offer={{ price: 19.99, priceCurrency: 'USD' }} />)
    const { product } = getScripts(c)
    expect(product?.category).toBe('Herbal Supplement')
  })

  it('Product node accepts a custom category', () => {
    const { container: c } = render(<HerbSchemaGenerator {...BASE_PROPS} category="Adaptogen" offer={{ price: 19.99, priceCurrency: 'USD' }} />)
    const { product } = getScripts(c)
    expect(product?.category).toBe('Adaptogen')
  })

  it('Product node brand is The Hippie Scientist', () => {
    const { container: c } = render(<HerbSchemaGenerator {...BASE_PROPS} offer={{ price: 19.99, priceCurrency: 'USD' }} />)
    const { product } = getScripts(c)
    const brand = product?.brand as Record<string, unknown>
    expect(brand.name).toBe('The Hippie Scientist')
  })

  it('Product node is omitted when no offer prop is given', () => {
    const { container: c } = render(<HerbSchemaGenerator {...BASE_PROPS} />)
    const { product } = getScripts(c)
    expect(product).toBeUndefined()
  })

  it('Product node includes offers when offer prop is provided', () => {
    const { container: c } = render(
      <HerbSchemaGenerator
        {...BASE_PROPS}
        offer={{ price: 19.99, priceCurrency: 'USD' }}
      />
    )
    const { product } = getScripts(c)
    const offers = product?.offers as Record<string, unknown>
    expect(offers['@type']).toBe('Offer')
    expect(offers.price).toBe(19.99)
    expect(offers.priceCurrency).toBe('USD')
    expect(offers.availability).toBe('https://schema.org/InStock')
  })

  // ----- Article schema -----

  it('Article node has correct @context and @type', () => {
    const { container: c } = render(<HerbSchemaGenerator {...BASE_PROPS} />)
    const { article } = getScripts(c)
    expect(article['@context']).toBe('https://schema.org')
    expect(article['@type']).toBe('Article')
  })

  it('Article headline includes the herb name (Google Rich Results required)', () => {
    const { container: c } = render(<HerbSchemaGenerator {...BASE_PROPS} />)
    const { article } = getScripts(c)
    expect(String(article.headline)).toContain('Ashwagandha')
  })

  it('Article has image (Google Rich Results required)', () => {
    const { container: c } = render(<HerbSchemaGenerator {...BASE_PROPS} />)
    const { article } = getScripts(c)
    expect(article.image).toBe(BASE_PROPS.image)
  })

  it('Article has datePublished from dateReviewed (Google Rich Results required)', () => {
    const { container: c } = render(<HerbSchemaGenerator {...BASE_PROPS} />)
    const { article } = getScripts(c)
    expect(article.datePublished).toBe('2026-06-14')
  })

  it('Article author.name is present (Google Rich Results required)', () => {
    const { container: c } = render(<HerbSchemaGenerator {...BASE_PROPS} />)
    const { article } = getScripts(c)
    const author = article.author as Record<string, unknown>
    expect(typeof author.name).toBe('string')
    expect((author.name as string).length).toBeGreaterThan(0)
  })

  it('Article publisher matches author', () => {
    const { container: c } = render(<HerbSchemaGenerator {...BASE_PROPS} />)
    const { article } = getScripts(c)
    expect(article.publisher).toEqual(article.author)
  })

  it('Article mainEntityOfPage links back to the canonical URL', () => {
    const { container: c } = render(<HerbSchemaGenerator {...BASE_PROPS} />)
    const { article } = getScripts(c)
    const mep = article.mainEntityOfPage as Record<string, unknown>
    expect(mep['@id']).toBe(BASE_PROPS.url)
  })

  it('Article evidenceGrade emitted as PropertyValue', () => {
    const { container: c } = render(<HerbSchemaGenerator {...BASE_PROPS} />)
    const { article } = getScripts(c)
    const prop = article.additionalProperty as Record<string, unknown>
    expect(prop['@type']).toBe('PropertyValue')
    expect(prop.name).toBe('Evidence grade')
    expect(prop.value).toBe('B — Moderate')
  })

  // ----- XSS safety -----

  it('serialised output does not contain raw < characters', () => {
    const { container: c } = render(
      <HerbSchemaGenerator
        {...BASE_PROPS}
        description='<script>alert("xss")</script>'
      />
    )
    const scripts = c.querySelectorAll('script[type="application/ld+json"]')
    for (const s of Array.from(scripts)) {
      expect(s.textContent).not.toContain('<script>')
    }
  })
})
