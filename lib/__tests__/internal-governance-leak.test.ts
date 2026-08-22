import { describe, expect, it } from 'vitest'

import {
  PUBLIC_TEXT_FIELDS,
  findInternalGovernanceLeaks,
  isLeakedUserFacingText,
  stripLeakedSentences,
} from '../editorial-leak.mjs'

/**
 * Fixtures taken verbatim from `public/data` before the repair. Each one was
 * published: the first three were rendered as the *title of a study* by
 * `ShowMeTheStudies`, the fourth as a scientific claim, the fifth as dosing
 * guidance on a herb profile.
 */
const SHIPPED_LEAKS = {
  citationTitleMonetization:
    "v10.0: The 2024 JAMA Internal Medicine RCT used 2 g/day for 6 months in 598 women and found no significant prevention benefit; block monetized recommendation.",
  citationTitleHype:
    'v9.4: Mostly animal/preclinical and influencer hype; keep out of monetization until human evidence exists. | Source citation missing in workbook; queued for PMID backfill.',
  citationTitleRestriction:
    'v8.2: ODS notes deficiency is rare and biotin can interfere with laboratory tests; strong consumer claims should be restricted.',
  claimRuling:
    "v10.0: Chromium evidence for diabetes/glucose is mixed; block monetized 'blood sugar' recommendation.",
  dosageRuling:
    'Dose varies by standardized extract and bacoside content; do not publish a universal dose without extract standardization. | Bacopa monnieri extracts/standardized bacoside products; combinations should not be credited solely to bacopa.',
}

describe('internal governance rulings never reach public output', () => {
  it('detects every ruling that actually shipped', () => {
    for (const [name, value] of Object.entries(SHIPPED_LEAKS)) {
      expect(findInternalGovernanceLeaks(value).length, name).toBeGreaterThan(0)
      expect(isLeakedUserFacingText(value), name).toBe(true)
    }
  })

  it('leaves ordinary scientific prose alone', () => {
    const realProse = [
      'Effect of Ashwagandha (Withania somnifera) extract on sleep: A systematic review and meta-analysis',
      'Cranberries for preventing urinary tract infections',
      'Citicoline and Memory Function in Healthy Older Adults: A Randomized, Double-Blind, Placebo-Controlled Clinical Trial',
      'Ashwagandha is an adaptogenic herb studied for stress and sleep outcomes.',
      'Typical study doses range from 300 to 600 mg of a standardized root extract daily.',
    ]
    for (const value of realProse) {
      expect(findInternalGovernanceLeaks(value), value).toHaveLength(0)
      expect(isLeakedUserFacingText(value), value).toBe(false)
    }
  })

  it('never publishes a fragment of a version-stamped ruling', () => {
    // The version number contains a period, so naive sentence splitting ends a
    // "sentence" after "v10." and would publish that fragment as prose. A
    // version-stamped ruling is internal as a whole value.
    for (const key of ['citationTitleMonetization', 'citationTitleHype', 'citationTitleRestriction', 'claimRuling'] as const) {
      const result = stripLeakedSentences(SHIPPED_LEAKS[key])
      expect(result, key).toBe('')
      expect(result, key).not.toMatch(/^v\d/)
    }
  })

  it('recovers safety-relevant content welded to a ruling by a semicolon', () => {
    // Dropping the whole sentence would take a real dosing caveat with it.
    const result = stripLeakedSentences(SHIPPED_LEAKS.dosageRuling)
    expect(result).toContain('Dose varies by standardized extract and bacoside content')
    expect(result).toContain('combinations should not be credited solely to bacopa')
    expect(result).not.toMatch(/do not publish/i)
    expect(findInternalGovernanceLeaks(result)).toHaveLength(0)
  })

  it('covers the fields the leaks actually shipped in', () => {
    // The previous validator inspected six top-level prose fields and passed,
    // because every leak that shipped was in one of these instead.
    for (const field of ['title', 'claim', 'notes', 'dosage', 'typical_dosage', 'searchText']) {
      expect(PUBLIC_TEXT_FIELDS, field).toContain(field)
    }
  })

  it('is idempotent — sanitizing twice changes nothing the second time', () => {
    for (const value of Object.values(SHIPPED_LEAKS)) {
      const once = stripLeakedSentences(value)
      expect(stripLeakedSentences(once)).toBe(once)
    }
  })
})
