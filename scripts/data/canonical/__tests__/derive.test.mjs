import { describe, it, expect } from 'vitest'
import {
  normalizeAlias,
  uniqueList,
  buildMechanismTaxonomy,
  normalizeMechanisms,
  cleanUserFacingText,
  isLeakedUserFacingText,
  deriveVisibility,
} from '../derive.mjs'

const TS = '2026-01-01T00:00:00.000Z'

function mechanismEntity(name, category, cls, synonyms) {
  return {
    id: `ent_mechanism_${name}`,
    entity_type: 'mechanism',
    canonical_name: name,
    slug: name.toLowerCase(),
    aliases: synonyms,
    data: { category, mechanism_class: cls, target_system: '', synonyms: [name, ...synonyms] },
  }
}

describe('string helpers', () => {
  it('normalizeAlias strips case, punctuation, and diacritics', () => {
    expect(normalizeAlias('Anti-Inflammatory')).toBe('anti inflammatory')
    expect(normalizeAlias('café')).toBe('cafe')
  })
  it('uniqueList splits on pipe/semicolon/comma/newline and dedupes', () => {
    expect(uniqueList(['a|b; c', 'A , d'])).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('mechanism normalization', () => {
  const taxonomy = buildMechanismTaxonomy([
    mechanismEntity('Anti-inflammatory', 'core', 'Physiological effect', ['inflammation reduction', 'Inflammatory Signaling Modulation']),
    mechanismEntity('Antioxidant', 'core', 'Physiological effect', ['Oxidative Stress Modulation']),
  ])

  it('maps raw terms to canonical labels, categories, classes', () => {
    const out = normalizeMechanisms(['Inflammatory Signaling Modulation', 'Oxidative Stress Modulation'], taxonomy)
    expect(out.canonical_mechanisms).toEqual(['Anti-inflammatory', 'Antioxidant'])
    expect(out.mechanism_categories).toEqual(['core'])
    expect(out.mechanism_classes).toEqual(['Physiological effect'])
    expect(out.mechanism_normalization_status).toBe('fully_mapped')
    expect(out.unmapped_mechanisms).toEqual([])
  })

  it('flags unmapped terms and partial status', () => {
    const out = normalizeMechanisms(['inflammation reduction', 'totally unknown mechanism'], taxonomy)
    expect(out.canonical_mechanisms).toEqual(['Anti-inflammatory'])
    expect(out.unmapped_mechanisms).toEqual(['totally unknown mechanism'])
    expect(out.mechanism_normalization_status).toBe('partially_mapped')
  })

  it('reports no_raw_mechanisms for empty input', () => {
    expect(normalizeMechanisms([''], taxonomy).mechanism_normalization_status).toBe('no_raw_mechanisms')
  })
})

describe('user-facing text hygiene', () => {
  it('detects leaked pipeline text and substitutes the fallback', () => {
    expect(isLeakedUserFacingText('It is best framed as a vitamin-C-rich fruit')).toBe(true)
    expect(isLeakedUserFacingText('A calming adaptogen used traditionally.')).toBe(false)
    expect(cleanUserFacingText('Garlic is tracked for fat_loss', 'FALLBACK')).toBe('FALLBACK')
    expect(cleanUserFacingText('A real summary.', 'FALLBACK')).toBe('A real summary.')
    expect(cleanUserFacingText('', 'FALLBACK')).toBe('FALLBACK')
  })
})

describe('deriveVisibility', () => {
  const base = {
    slug: 'ashwagandha', name: 'Ashwagandha', summary: 'A well-studied adaptogen with substantial human evidence across stress and sleep outcomes.',
    runtime_export_decision: 'full_public_runtime', profile_status: 'complete',
    evidence_tier: 'moderate', primary_effects: ['stress', 'sleep'], effects: ['stress', 'sleep'],
    mechanisms: ['GABAergic modulation'], contraindications: ['pregnancy'],
  }

  it('returns index,follow + PUBLISH for a strong record', () => {
    const v = deriveVisibility(base, 'herb')
    expect(v.visibility_tier).toBe('public')
    expect(v.robots).toBe('index,follow')
    expect(v.indexability_status).toBe('PUBLISH')
    expect(v.indexability_score).toBeGreaterThanOrEqual(75)
    expect(Array.isArray(v.indexability_reasons)).toBe(true)
  })

  it('blocks a record whose export decision is hidden', () => {
    const v = deriveVisibility({ ...base, runtime_export_decision: 'hidden' }, 'herb')
    expect(v.indexability_status).toBe('BLOCKED')
    expect(v.robots).toBe('noindex,follow')
  })
})
