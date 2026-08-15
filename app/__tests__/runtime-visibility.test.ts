import { describe, expect, it } from 'vitest'
import {
  getDiseaseEditorialAssessment,
  getHealthContentGovernance,
} from '../../lib/health-content-governance'
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

  it('PUBLISH indexability_status takes priority for non-disease content', () => {
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

  it('keeps disease-treatment content out of index, feature, and commerce paths until enhanced review passes', () => {
    const visibility = getRuntimeVisibility({
      ...publishable,
      sitemap_included: true,
      content_intent: 'disease-treatment',
    })

    expect(visibility.canRender).toBe(true)
    expect(visibility.canIndex).toBe(false)
    expect(visibility.canFeature).toBe(false)
    expect(visibility.canMonetize).toBe(false)
  })

  it('allows indexing after disease content clears review, human-evidence, and safety gates', () => {
    const record = {
      ...publishable,
      sitemap_included: true,
      content_intent: 'disease-treatment',
      ymyl_review_status: 'approved',
      evidence_grade: 'B',
      safety: 'Source-backed safety summary.',
      contraindications: 'Source-backed contraindication context.',
      interactions: 'Source-backed interaction context.',
    }

    expect(getDiseaseEditorialAssessment(record)).toMatchObject({
      required: true,
      approved: true,
      reviewApproved: true,
      humanEvidenceAdequate: true,
      safetyCoverageAdequate: true,
    })
    expect(getRuntimeVisibility(record).canIndex).toBe(true)
    expect(getRuntimeVisibility(record).canMonetize).toBe(false)
  })

  it('does not let a generic PUBLISH flag bypass the disease-treatment review gate', () => {
    const visibility = getRuntimeVisibility({
      indexability_status: 'PUBLISH',
      content_intent: 'disease-treatment',
      evidence_grade: 'A',
      safety: 'Safety context.',
      contraindications: 'Contraindication context.',
    })
    expect(visibility.canIndex).toBe(false)
  })

  it('classifies a primary disease condition without scanning secondary safety mentions', () => {
    expect(getHealthContentGovernance({ primary_condition: 'type 2 diabetes' })).toMatchObject({
      intent: 'disease-treatment',
      diseaseTreatment: true,
      source: 'primary-topic',
    })

    expect(getHealthContentGovernance({
      primary_outcome: 'stress',
      safety: 'Use caution in people with diabetes.',
    })).toMatchObject({
      intent: 'general-wellness',
      diseaseTreatment: false,
      source: 'primary-topic',
    })
  })

  it('fails closed if evaluating a malformed record throws', () => {
    const malformed = new Proxy({}, {
      get() {
        throw new Error('malformed runtime record')
      },
    }) as Record<string, unknown>

    expect(getRuntimeVisibility(malformed)).toEqual({
      canRender: false,
      canIndex: false,
      canFeature: false,
      canMonetize: false,
    })
  })
})
