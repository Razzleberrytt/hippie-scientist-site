/**
 * evidence-grade.ts
 *
 * `evidence_grade` in the workbook is free text. Across the current corpus it
 * holds well over a hundred distinct values — `"a"`, `"C+"`, `"moderate-high"`,
 * `"Strong drug evidence"`, `"B for PCOS; D for core goals"` — because it has
 * been filled by different passes with different conventions.
 *
 * Templates previously passed that raw string straight into the grade badge,
 * which produced three separate defects:
 *
 *   1. lowercase `"c"` never matched the `C` styling key, so most herb profiles
 *      rendered a generic "Grade c" instead of "Grade C: Limited Evidence";
 *   2. multi-word values were painted verbatim inside a 64px circular badge;
 *   3. a missing grade defaulted to `'C'`, asserting a specific evidence grade
 *      the data never supported.
 *
 * This module is the single normalization boundary. It maps any raw value to a
 * canonical letter when one is genuinely implied, and returns `null` when it is
 * not — callers must render the absence rather than invent a grade.
 *
 * `evidence_tier` ("Strong / Moderate / Limited / Mechanistic Human Evidence")
 * is already a clean taxonomy and remains the preferred signal; this exists to
 * stop the messier field from contradicting it on screen.
 */

export type EvidenceLetter = 'A' | 'B' | 'C' | 'D' | 'F'

export type EvidenceBand = 'strong' | 'moderate' | 'limited' | 'preliminary' | 'insufficient'

export type NormalizedEvidenceGrade = {
  /** Canonical letter, or null when the raw value does not imply one. */
  letter: EvidenceLetter | null
  /** Coarse band, usable even when no letter can be assigned. */
  band: EvidenceBand | null
  /** Human-readable label for display. */
  label: string
  /** The original value, preserved for tooltips and audit trails. */
  raw: string
  /** True when the raw value was already a clean letter grade. */
  canonical: boolean
  /**
   * True when the raw value describes different grades for different outcomes
   * (e.g. "B for PCOS; D for core goals"). A single badge cannot represent
   * these honestly, so callers should show the text rather than a letter.
   */
  outcomeDependent: boolean
}

const BAND_LABEL: Record<EvidenceBand, string> = {
  strong: 'Strong evidence',
  moderate: 'Moderate evidence',
  limited: 'Limited evidence',
  preliminary: 'Preliminary evidence',
  insufficient: 'Insufficient evidence',
}

const LETTER_FOR_BAND: Record<EvidenceBand, EvidenceLetter> = {
  strong: 'A',
  moderate: 'B',
  limited: 'C',
  preliminary: 'D',
  insufficient: 'F',
}

export const LETTER_LABEL: Record<EvidenceLetter, string> = {
  A: 'Grade A: Strong Evidence',
  B: 'Grade B: Moderate Evidence',
  C: 'Grade C: Limited Evidence',
  D: 'Grade D: Theoretical Evidence',
  F: 'Grade F: Insufficient or Contraindicated',
}

/** A bare letter grade, optionally with a +/- modifier. */
const BARE_LETTER_RE = /^([a-df])\s*[+-]?$/i

/**
 * Values that grade different outcomes differently. Detected before anything
 * else, because picking one letter out of them would misrepresent the record.
 */
const OUTCOME_DEPENDENT_RE = /\b[a-df]\s*[+-]?\s+for\s+\w+.*;\s*[a-df]\s*[+-]?\s+for\s+/i

/**
 * Phrase-level mappings, ordered most specific first.
 *
 * Hedged compounds round *down*, never up: "moderate-high" lands on `moderate`
 * and "limited-to-moderate" on `moderate` only because "moderate" is its weaker
 * ceiling. Overstating how strong the evidence is would be the costlier error
 * on health content, so ambiguity always resolves toward the weaker claim.
 *
 * Deliberately absent: "not applicable". A grade that does not apply — a blend,
 * a stack, a non-gradeable entity — is not the same as insufficient evidence,
 * so it falls through to an unassigned grade rather than being shown as "F".
 */
const PHRASE_BANDS: [RegExp, EvidenceBand][] = [
  [/\b(moderate[- ]to[- ]strong|strong|robust|high[- ]quality|well[- ]established)\b/i, 'strong'],
  [/\b(limited[- ]to[- ]moderate|moderate)\b/i, 'moderate'],
  [/\b(mixed|inconsistent|limited|low[- ]moderate|emerging)\b/i, 'limited'],
  [/\b(preliminary|pilot|early|weak|mechanistic|theoretical|low)\b/i, 'preliminary'],
  [/\b(insufficient|no human|none|avoid|blocked)\b/i, 'insufficient'],
]

function bandFromPhrase(value: string): EvidenceBand | null {
  for (const [pattern, band] of PHRASE_BANDS) {
    if (pattern.test(value)) return band
  }
  return null
}

function bandFromLetter(letter: EvidenceLetter): EvidenceBand {
  switch (letter) {
    case 'A':
      return 'strong'
    case 'B':
      return 'moderate'
    case 'C':
      return 'limited'
    case 'D':
      return 'preliminary'
    default:
      return 'insufficient'
  }
}

const EMPTY: NormalizedEvidenceGrade = {
  letter: null,
  band: null,
  label: 'Evidence grade not assigned',
  raw: '',
  canonical: false,
  outcomeDependent: false,
}

/**
 * Normalize any raw `evidence_grade` value.
 *
 * Never invents a grade: an unrecognized or empty value yields `letter: null`,
 * and the caller is expected to render that absence rather than a default.
 */
export function normalizeEvidenceGrade(raw: unknown): NormalizedEvidenceGrade {
  const value = String(raw ?? '').trim()
  if (!value) return EMPTY

  if (OUTCOME_DEPENDENT_RE.test(value)) {
    return { letter: null, band: null, label: value, raw: value, canonical: false, outcomeDependent: true }
  }

  const bare = BARE_LETTER_RE.exec(value)
  if (bare) {
    const letter = bare[1].toUpperCase() as EvidenceLetter
    return {
      letter,
      band: bandFromLetter(letter),
      label: LETTER_LABEL[letter],
      raw: value,
      canonical: true,
      outcomeDependent: false,
    }
  }

  const band = bandFromPhrase(value)
  if (band) {
    const letter = LETTER_FOR_BAND[band]
    return {
      letter,
      band,
      // Keep the source wording visible — "Strong drug evidence" says more than
      // "Grade A", and flattening it would lose the qualifier.
      label: `${LETTER_LABEL[letter]} — ${value}`,
      raw: value,
      canonical: false,
      outcomeDependent: false,
    }
  }

  return { ...EMPTY, raw: value, label: value }
}

/**
 * Map a clean `evidence_tier` value ("Strong Human Evidence", "Mechanistic
 * Evidence", …) onto the same band scale, so the two fields can be compared.
 */
export function bandFromEvidenceTier(tier: unknown): EvidenceBand | null {
  const value = String(tier ?? '').toLowerCase()
  if (!value) return null
  if (value.includes('strong')) return 'strong'
  if (value.includes('moderate')) return 'moderate'
  if (value.includes('limited') || value.includes('early') || value.includes('contextual')) return 'limited'
  if (value.includes('mechanistic') || value.includes('preclinical')) return 'preliminary'
  return null
}

const BAND_ORDER: EvidenceBand[] = ['insufficient', 'preliminary', 'limited', 'moderate', 'strong']

/**
 * How far apart the grade and tier fields sit, in bands. Two or more is a
 * contradiction a reader can see: the badge and the tier label disagree.
 */
export function gradeTierDistance(gradeBand: EvidenceBand | null, tierBand: EvidenceBand | null): number | null {
  if (!gradeBand || !tierBand) return null
  return Math.abs(BAND_ORDER.indexOf(gradeBand) - BAND_ORDER.indexOf(tierBand))
}

export { BAND_LABEL, BAND_ORDER }
