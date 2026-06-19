import { describe, expect, it } from 'vitest'
import { getRuntimeVisibility } from '../../lib/runtime-visibility'

// Regression coverage for the recurring string-vs-boolean sitemap_included bug:
// generated data must gate identically whether booleans survive the pipeline
// or arrive as legacy "true"/"false" strings.
describe('getRuntimeVisibility', () => {
  const publishable = {
    slug: 'test-herb',
    name: 'Test Herb',
    robots: 'index,follow',
  }

  it('indexes records with boolean sitemap_included true', () => {
    const visibility = getRuntimeVisibility({ ...publishable, sitemap_included: true })
    expect(visibility.canIndex).toBe(true)
    expect(visibility.canRender).toBe(true)
  })

  it('indexes records with string sitemap_included "true"', () => {
    const visibility = getRuntimeVisibility({ ...publishable, sitemap_included: 'true' })
    expect(visibility.canIndex).toBe(true)
  })

  it('treats string "TRUE" case-insensitively', () => {
    const visibility = getRuntimeVisibility({ ...publishable, sitemap_included: 'TRUE' })
    expect(visibility.canIndex).toBe(true)
  })

  it('does NOT index boolean sitemap_included false', () => {
    const visibility = getRuntimeVisibility({ ...publishable, sitemap_included: false })
    expect(visibility.canIndex).toBe(false)
  })

  it('does NOT index the truthy string "false"', () => {
    const visibility = getRuntimeVisibility({ ...publishable, sitemap_included: 'false' })
    expect(visibility.canIndex).toBe(false)
  })

  it('PUBLISH indexability_status takes priority', () => {
    const visibility = getRuntimeVisibility({
      slug: 'test-herb',
      indexability_status: 'PUBLISH',
    })
    expect(visibility.canIndex).toBe(true)
  })

  it('NOINDEX indexability_status blocks indexing even when sitemap fields say publish', () => {
    const visibility = getRuntimeVisibility({
      ...publishable,
      sitemap_included: true,
      indexability_status: 'NOINDEX',
    })
    expect(visibility.canIndex).toBe(false)
    expect(visibility.canRender).toBe(true)
  })

  it('non-canonical status values fall through to the sitemap gate', () => {
    const visibility = getRuntimeVisibility({
      ...publishable,
      sitemap_included: true,
      indexability_status: 'eligible',
    })
    expect(visibility.canIndex).toBe(true)
  })

  it('runtime_export_decision hide suppresses rendering entirely', () => {
    const visibility = getRuntimeVisibility({
      ...publishable,
      sitemap_included: true,
      runtime_export_decision: 'hide',
    })
    expect(visibility.canRender).toBe(false)
    expect(visibility.canIndex).toBe(false)
  })
})
