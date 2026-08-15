/**
 * dose-presentation.ts
 *
 * The workbook column behind every profile's dose is `dosage_or_preferred_form`
 * — deliberately dual-purpose. It holds a studied regimen for some entities and
 * a product form ("capsule or standardized extract") for many others, and the
 * runtime pipeline flattens both into `dosage` / `typical_dosage`.
 *
 * Rendering that flattened value under a "Dose guidance" label means a reader
 * who asked "how much?" is told "a capsule" — which is not an answer, and is
 * exactly the kind of non-answer an AI grounding system will reuse verbatim.
 *
 * This module classifies the field so templates can present each case honestly:
 * a real dose as a dose, a form as a form, and an explicit absence as an
 * explicit absence. Improving it improves every herb and compound profile at
 * once.
 */

export type DoseFieldKind = 'dose' | 'form' | 'duration' | 'abstention' | 'empty'

export type DosePresentation = {
  kind: DoseFieldKind
  /** Present only when the field genuinely states an amount. */
  dose?: string
  /** Present when the field describes the product form instead. */
  form?: string
  /** Honest explanation to show when no dose can be stated. */
  note?: string
}

/** An amount paired with a unit — what makes a dose a dose. */
const AMOUNT_RE =
  /\d+(?:[.,]\d+)?\s*(?:-|–|—|to\s)?\s*\d*(?:[.,]\d+)?\s*(mg|g|mcg|µg|ug|iu|ml|billion\s*cfu|cfu|drops?|%)\b/i

/**
 * Product-form vocabulary. When a short field is built entirely from these
 * words and carries no amount, it is describing a package, not a dose.
 */
const FORM_WORDS = new Set([
  'capsule', 'capsules', 'softgel', 'softgels', 'tablet', 'tablets', 'powder',
  'liquid', 'oil', 'tincture', 'extract', 'standardized', 'chelated', 'mineral',
  'botanical', 'oral', 'supplement', 'form', 'gummy', 'gummies', 'spray',
  'essential', 'free', 'when', 'use', 'is', 'intended', 'or', 'and', 'a', 'the',
  'prescription', 'lavender', 'topical', 'sublingual', 'chewable', 'syrup', 'tea',
])

/**
 * Duration vocabulary. A handful of records carry "long", "medium", or
 * "short-to-medium" here — a *duration* column's value written into the dose
 * column. Distinct from a form descriptor and worth reporting separately,
 * because the fix is upstream field mapping rather than missing research.
 */
const DURATION_RE = /^(very\s+)?(short|medium|long)([- ]to[- ](short|medium|long))?([- ]term)?$/i

/** Language the editors use when deliberately declining to state a dose. */
const ABSTENTION_RE =
  /(preparation[- ]specific|use standardized product label|no established consumer dosing|do not publish|see full guide|varies by (tradition|formulation|preparation|standardized extract)|require source-backed|not infer one universal dose)/i

const EMPTY_RE = /^(|-+|—+|–+|n\/?a|none|tbd|unknown|null|undefined)$/i

function isFormDescriptor(value: string): boolean {
  const tokens = value
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  if (!tokens.length) return false
  return tokens.length <= 8 && tokens.every((token) => FORM_WORDS.has(token))
}

/**
 * Classify a raw dose field. Order matters: an abstention may legitimately
 * mention "extract" while still refusing to state an amount, so it is checked
 * before the form-descriptor test.
 */
export function classifyDoseField(raw: unknown): DoseFieldKind {
  const value = String(raw ?? '').trim()
  if (EMPTY_RE.test(value)) return 'empty'
  if (DURATION_RE.test(value)) return 'duration'
  if (AMOUNT_RE.test(value)) return 'dose'
  if (ABSTENTION_RE.test(value)) return 'abstention'
  if (isFormDescriptor(value)) return 'form'
  // Unrecognized prose that states no amount is treated as an abstention rather
  // than promoted to a dose — the safer default for health content.
  return 'abstention'
}

const NO_DOSE_NOTE =
  'No standardized dose is established for this ingredient in our source data. Preparations differ widely, so follow the standardization on the product you actually have and speak to a clinician before starting.'

const FORM_ONLY_NOTE =
  'Our source data records the usual product form for this ingredient but no studied dose. Preparations differ widely, so follow the standardization on the product you actually have and speak to a clinician before starting.'

/**
 * Build what a profile template should actually render for dosing.
 *
 * @param raw the flattened `dosage` / `typical_dosage` value from runtime data
 */
export function getDosePresentation(raw: unknown): DosePresentation {
  const value = String(raw ?? '').trim()
  const kind = classifyDoseField(value)

  switch (kind) {
    case 'dose':
      return { kind, dose: value }
    case 'form':
      return { kind, form: value, note: FORM_ONLY_NOTE }
    case 'duration':
      // A duration is not dosing information at all, so nothing is surfaced
      // beyond the honest absence.
      return { kind, note: NO_DOSE_NOTE }
    case 'abstention':
      return { kind, note: value.length > 24 ? value : NO_DOSE_NOTE }
    default:
      return { kind: 'empty', note: NO_DOSE_NOTE }
  }
}

/** True when the profile can genuinely answer "what dose?". */
export function hasStatedDose(raw: unknown): boolean {
  return classifyDoseField(raw) === 'dose'
}
