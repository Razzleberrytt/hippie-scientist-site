import { describe, expect, it } from 'vitest'
import { classifyContraindicationValue } from './audit-severity-token-contraindications.mjs'

describe('classifyContraindicationValue', () => {
  it('classifies an empty value as EMPTY', () => {
    expect(classifyContraindicationValue('')).toBe('EMPTY')
    expect(classifyContraindicationValue('   ')).toBe('EMPTY')
    expect(classifyContraindicationValue(undefined)).toBe('EMPTY')
  })

  it('classifies a bare single token as TOKEN_ONLY', () => {
    expect(classifyContraindicationValue('moderate')).toBe('TOKEN_ONLY')
    expect(classifyContraindicationValue('kidney')).toBe('TOKEN_ONLY')
    expect(classifyContraindicationValue('low_to_moderate')).toBe('TOKEN_ONLY')
  })

  it('classifies comma/semicolon-separated bare tokens as TOKEN_ONLY', () => {
    expect(classifyContraindicationValue('pregnancy,liver,kidney')).toBe('TOKEN_ONLY')
    expect(classifyContraindicationValue('pregnancy; liver; kidney')).toBe('TOKEN_ONLY')
  })

  it('classifies real sourced prose as PROSE', () => {
    expect(
      classifyContraindicationValue(
        'Avoid with warfarin due to a documented bleeding-risk interaction; discontinue before any procedure requiring general anesthesia.',
      ),
    ).toBe('PROSE')
  })

  it('classifies a value with a mix of tokens and prose as PROSE', () => {
    expect(classifyContraindicationValue('pregnancy; avoid in patients with a history of seizures')).toBe('PROSE')
  })
})
