/**
 * Compose a profile summary from the record's own verified fields.
 *
 * 248 indexable profiles carry a generated placeholder as their summary —
 * "Acerola botanical profile with evidence, safety, and practical fit." Those
 * pages are not empty. Acerola has a botanical name, a Grade C rating backed by
 * a randomized controlled trial, four recorded mechanisms, specific safety
 * cautions, four contraindications and three cited studies. Only the sentence
 * introducing all of it says nothing.
 *
 * Everything written here is assembled from fields already on the record, each
 * of which is either authored in the workbook or derived from PubMed. No claim
 * is introduced that the record does not already make, and any clause whose
 * source field is missing is omitted rather than filled with a guess — a
 * shorter true summary beats a complete invented one.
 *
 * Generation is deterministic: the same record always produces the same text,
 * so a rebuild never silently rewords a published page.
 */

import { CANONICAL_GRADE_LABEL, type CanonicalEvidenceGrade } from './evidence-grade'

const text = (value: unknown): string => String(value ?? '').replace(/\s+/g, ' ').trim()

function list(value: unknown, limit?: number): string[] {
  const items = Array.isArray(value) ? value : text(value).split(/[;|]/)
  const cleaned = items.map(text).filter(Boolean)
  return typeof limit === 'number' ? cleaned.slice(0, limit) : cleaned
}

/** "a, b and c" */
function joinNatural(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function lowerFirst(value: string): string {
  return value ? value.charAt(0).toLowerCase() + value.slice(1) : value
}

/**
 * Lower-case a Title Case phrase for mid-sentence use without destroying the
 * acronyms inside it. Mechanism names arrive as "Inflammatory Signaling
 * Modulation" and "AMPK Signaling"; naive lower-casing of the first character
 * alone yields "inflammatory Signaling Modulation", and lower-casing the whole
 * string yields "ampk signaling".
 *
 * A token is left alone unless it looks like an ordinary capitalised word —
 * one leading capital followed only by lower-case letters. That preserves
 * AMPK, NF-κB, GABA-A and mixed-case chemistry.
 */
function humanizePhrase(value: string): string {
  return value
    .split(/\s+/)
    .map((token) => (/^[A-Z][a-z]+$/.test(token) ? token.toLowerCase() : token))
    .join(' ')
}

/**
 * Strip a trailing period so clauses can be joined without doubling it, and
 * trim the trailing conjunction fragments that appear in some safety cells.
 */
function clause(value: unknown): string {
  return text(value).replace(/\s*[.;]+\s*$/, '')
}

/**
 * Returns a summary, or '' when the record supports nothing truthful.
 */
export function buildProfileSummary(record: Record<string, unknown> | null | undefined): string {
  if (!record || typeof record !== 'object') return ''

  const name = text(record.name)
  if (!name) return ''

  const scientificName = text(record.scientific_name || record.latin_name || record.botanical_name)
  const grade = text(record.evidence_grade)
  const gradeLabel = CANONICAL_GRADE_LABEL[grade as CanonicalEvidenceGrade]
  const gradeBacked = record.evidence_grade_backed !== false
  const rationale = clause(record.evidence_rationale)
  const mechanisms = list(record.mechanisms, 3)
  const effects = list(Array.isArray(record.effects) && record.effects.length ? record.effects : record.primary_effects, 3)
  // Some contraindication cells are a full explanatory sentence. Those read as
  // a run-on once joined, so short entries are preferred and a long one is only
  // used when nothing shorter exists.
  const allContraindications = list(record.contraindications).map(clause)
  const shortContraindications = allContraindications.filter((item) => item.length <= 60)
  const contraindications = shortContraindications.length
    ? shortContraindications.slice(0, 2)
    // Nothing short enough: take one and cut it at the explanatory clause, so
    // the summary names the caution without swallowing its whole rationale.
    : allContraindications.slice(0, 1).map((item) => clause(item.split(/\s+(?:because|such as)\s+/i)[0]))
  const safety = clause(record.safety)

  const sentences: string[] = []

  // 1. Identity and where the evidence stands. Preserve the editorial grade
  // when the repository cannot demonstrate it, but do not translate that grade
  // into a settled strength claim such as "strong evidence".
  const subject = scientificName ? `${name} (${scientificName})` : name
  if (gradeLabel) {
    const [ratingPart, meaningPart] = gradeLabel.split(/:\s*/)
    if (!gradeBacked) {
      sentences.push(
        `${subject} carries an editorial ${ratingPart} rating, but the studies recorded on this profile do not demonstrate that grade.`,
      )
    } else {
      sentences.push(
        meaningPart
          ? `${subject} carries a ${ratingPart} rating — ${humanizePhrase(meaningPart).toLowerCase()}.`
          : `${subject} carries a ${ratingPart} rating.`,
      )
    }
  } else {
    sentences.push(`${subject} has no evidence grade assigned in our dataset.`)
  }

  // 2. What that grade rests on. Already a complete sentence about counts and
  //    design, derived from the cited literature.
  if (rationale && !/^no study design has been recorded/i.test(rationale)) {
    sentences.push(`${rationale}.`)
  }

  // 3. Mechanism, explicitly labelled as mechanism. Listing a pathway without
  //    that qualifier is how a target becomes mistaken for a benefit.
  if (mechanisms.length) {
    sentences.push(
      `Recorded activity centres on ${joinNatural(mechanisms.map(humanizePhrase))}, which describes mechanism rather than demonstrated benefit.`,
    )
  } else if (effects.length) {
    sentences.push(`Recorded contexts of use: ${joinNatural(effects.map(humanizePhrase))}.`)
  }

  // 4. Safety, preferring the specific contraindications over prose.
  if (contraindications.length) {
    // Only the leading character is lowered here. `humanizePhrase` would
    // destroy proper nouns that appear in cautions — "Apiaceae" is a botanical
    // family, not a Title Case word to be normalised away.
    sentences.push(`Noted cautions include ${joinNatural(contraindications.map(lowerFirst))}.`)
  } else if (safety) {
    sentences.push(`${safety}.`)
  }

  return sentences.join(' ')
}

/**
 * Generated placeholders that a real summary should replace. Anything not
 * matching here is treated as authored prose and left alone.
 */
const PLACEHOLDER_SUMMARY = [
  /\b(?:botanical|compound)\s+profile\s+with\s+evidence,\s+safety,\s+and\s+practical\s+fit\.?$/i,
  /\bprofile\s+with\s+mechanism,?\s+safety,?\s+and\s+practical\s+context\b/i,
  /^no summary available yet\.?$/i,
]

export function isPlaceholderSummary(value: unknown): boolean {
  const summary = text(value)
  if (!summary) return true
  return PLACEHOLDER_SUMMARY.some((pattern) => pattern.test(summary))
}
