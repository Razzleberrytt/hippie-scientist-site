/**
 * Compose a profile summary from the record's own verified fields.
 */

import { CANONICAL_GRADE_LABEL, normalizeEvidenceGrade } from './evidence-grade'

const text = (value: unknown): string => String(value ?? '').replace(/\s+/g, ' ').trim()

function list(value: unknown, limit?: number): string[] {
  const items = Array.isArray(value) ? value : text(value).split(/[;|]/)
  const cleaned = items.map(text).filter(Boolean)
  return typeof limit === 'number' ? cleaned.slice(0, limit) : cleaned
}
function joinNatural(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}
function lowerFirst(value: string): string { return value ? value.charAt(0).toLowerCase() + value.slice(1) : value }
function humanizePhrase(value: string): string {
  return value.split(/\s+/).map((token) => (/^[A-Z][a-z]+$/.test(token) ? token.toLowerCase() : token)).join(' ')
}
function clause(value: unknown): string { return text(value).replace(/\s*[.;]+\s*$/, '') }

export function buildProfileSummary(record: Record<string, unknown> | null | undefined): string {
  if (!record || typeof record !== 'object') return ''
  const name = text(record.name)
  if (!name) return ''

  const scientificName = text(record.scientific_name || record.latin_name || record.botanical_name)
  const gradeBacked = record.evidence_grade_backed !== false
  const publicGrade = normalizeEvidenceGrade(record.evidence_grade).grade
  const authoredGrade = normalizeEvidenceGrade(record.evidence_grade_source || record.evidence_grade).grade
  const grade = gradeBacked ? publicGrade : authoredGrade
  const gradeLabel = grade ? CANONICAL_GRADE_LABEL[grade] : undefined
  const rationale = clause(record.evidence_rationale)
  const mechanisms = list(record.mechanisms, 3)
  const effects = list(Array.isArray(record.effects) && record.effects.length ? record.effects : record.primary_effects, 3)
  const allContraindications = list(record.contraindications).map(clause)
  const shortContraindications = allContraindications.filter((item) => item.length <= 60)
  const contraindications = shortContraindications.length
    ? shortContraindications.slice(0, 2)
    : allContraindications.slice(0, 1).map((item) => clause(item.split(/\s+(?:because|such as)\s+/i)[0]))
  const safety = clause(record.safety)
  const sentences: string[] = []
  const subject = scientificName ? `${name} (${scientificName})` : name

  if (gradeLabel) {
    const [ratingPart, meaningPart] = gradeLabel.split(/:\s*/)
    if (!gradeBacked) {
      sentences.push(`${subject} carries an editorial ${ratingPart} rating, but the studies recorded on this profile do not demonstrate that grade.`)
    } else {
      sentences.push(meaningPart
        ? `${subject} carries a ${ratingPart} rating — ${humanizePhrase(meaningPart).toLowerCase()}.`
        : `${subject} carries a ${ratingPart} rating.`)
    }
  } else {
    sentences.push(`${subject} has no evidence grade assigned in our dataset.`)
  }

  if (rationale && !/^no study design has been recorded/i.test(rationale)) sentences.push(`${rationale}.`)
  if (mechanisms.length) {
    sentences.push(`Recorded activity centres on ${joinNatural(mechanisms.map(humanizePhrase))}, which describes mechanism rather than demonstrated benefit.`)
  } else if (effects.length) {
    sentences.push(`Recorded contexts of use: ${joinNatural(effects.map(humanizePhrase))}.`)
  }
  if (contraindications.length) sentences.push(`Noted cautions include ${joinNatural(contraindications.map(lowerFirst))}.`)
  else if (safety) sentences.push(`${safety}.`)
  return sentences.join(' ')
}

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
