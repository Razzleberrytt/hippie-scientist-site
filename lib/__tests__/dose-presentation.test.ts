import { describe, expect, it } from 'vitest'

import { classifyDoseField, getDosePresentation, hasStatedDose } from '@/lib/dose-presentation'

/**
 * These strings are taken verbatim from `dosage_or_preferred_form` in the
 * current workbook export. The classifier decides whether a profile publishes
 * an answer to "how much?", so a misclassification either hides a real dose or
 * presents a package description as dosing guidance.
 */

describe('classifyDoseField', () => {
  it('recognizes real regimens with an amount and a unit', () => {
    const realDoses = [
      '300-600 mg extract (KSM-66 or equivalent)',
      '500-1500 mg/day (bioavailable forms)',
      'Standardized extract (70-80% silymarin): 140-420 mg/day in divided doses',
      '1.5-5 g/day extract',
      'Lipidosterolic extract (85-95% fatty acids/sterols): 320 mg/day',
      '500 mg three times daily',
      '4 g/day of combined EPA+DHA',
      '45 drops per day',
    ]
    for (const value of realDoses) {
      expect(classifyDoseField(value), value).toBe('dose')
    }
  })

  it('recognizes product forms that were written into the dose column', () => {
    const forms = [
      'capsule or standardized extract',
      'standardized extract capsule',
      'powder or capsule',
      'softgel or liquid oil',
      'chelated mineral capsule or powder',
      'standardized botanical extract capsule',
      'standardized oral supplement form',
      'capsule or softgel',
    ]
    for (const value of forms) {
      expect(classifyDoseField(value), value).toBe('form')
    }
  })

  it('flags duration values that were written into the dose column', () => {
    // A handful of records carry a duration here — the wrong column entirely.
    for (const value of ['long', 'medium', 'short', 'short-to-medium', 'long-term']) {
      expect(classifyDoseField(value), value).toBe('duration')
    }
  })

  it('preserves deliberate editorial abstentions', () => {
    const abstentions = [
      'Preparation-specific; use standardized product label for Root powder and require source-backed dosing',
      'No established consumer dosing protocol; see full guide article for regulatory context',
      'Varied by formulation; do not infer one universal dose',
      'Dose varies by standardized extract and bacoside content; do not publish a single figure',
    ]
    for (const value of abstentions) {
      expect(classifyDoseField(value), value).toBe('abstention')
    }
  })

  it('treats blanks and placeholders as empty', () => {
    for (const value of ['', '—', '-', 'n/a', 'N/A', 'none', 'TBD', 'unknown']) {
      expect(classifyDoseField(value), JSON.stringify(value)).toBe('empty')
    }
    expect(classifyDoseField(null)).toBe('empty')
    expect(classifyDoseField(undefined)).toBe('empty')
  })

  it('never promotes prose without an amount to a dose', () => {
    // The safe default for health content: if no amount is stated, the page
    // must not claim to answer the dosing question.
    expect(classifyDoseField('take as directed on the label')).not.toBe('dose')
    expect(classifyDoseField('varies considerably between people')).not.toBe('dose')
  })
})

describe('getDosePresentation', () => {
  it('surfaces a real dose as dosing guidance with no disclaimer', () => {
    const result = getDosePresentation('300-600 mg extract (KSM-66 or equivalent)')
    expect(result.kind).toBe('dose')
    expect(result.dose).toBe('300-600 mg extract (KSM-66 or equivalent)')
    expect(result.note).toBeUndefined()
  })

  it('demotes a product form out of the dose slot and explains the absence', () => {
    const result = getDosePresentation('capsule or standardized extract')
    expect(result.kind).toBe('form')
    expect(result.dose).toBeUndefined()
    expect(result.form).toBe('capsule or standardized extract')
    expect(result.note).toMatch(/no studied dose/i)
  })

  it('keeps a substantive abstention as its own wording', () => {
    const value = 'Preparation-specific; use standardized product label for Root powder and require source-backed dosing'
    const result = getDosePresentation(value)
    expect(result.kind).toBe('abstention')
    expect(result.note).toBe(value)
    expect(result.dose).toBeUndefined()
  })

  it('falls back to a written explanation when the field is empty', () => {
    const result = getDosePresentation('')
    expect(result.kind).toBe('empty')
    expect(result.note).toMatch(/no standardized dose is established/i)
  })

  it('surfaces nothing but the absence for a duration value', () => {
    const result = getDosePresentation('long')
    expect(result.kind).toBe('duration')
    expect(result.dose).toBeUndefined()
    expect(result.form).toBeUndefined()
    expect(result.note).toMatch(/no standardized dose is established/i)
  })
})

describe('hasStatedDose', () => {
  it('gates the dosing FAQ to profiles that can actually answer it', () => {
    expect(hasStatedDose('500 mg three times daily')).toBe(true)
    expect(hasStatedDose('capsule or standardized extract')).toBe(false)
    expect(hasStatedDose('Preparation-specific; use standardized product label')).toBe(false)
    expect(hasStatedDose('')).toBe(false)
  })
})
