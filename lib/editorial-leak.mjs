/**
 * Editorial instructions that leaked into reader-facing prose.
 *
 * The workbook doubles as a briefing document, so some `summary` and
 * `description` cells hold guidance written *to* an author rather than *for* a
 * reader — "It should be framed modestly because traditional use is much
 * stronger than modern evidence." On 37 profiles that instruction is not a
 * trailing note, it is the entire field, and 31 of those pages are live with
 * `index,follow`.
 *
 * `build-runtime-from-workbook.mjs` already routes `summary` and `description`
 * through `cleanUserFacingText`, so the sanitizer was wired in all along. It
 * missed these because its one framing pattern was
 * `/it is best framed (as|around|for)/` — it required a preposition that the
 * real prose ("framed modestly because…", "framed conservatively because…")
 * never supplies. The patterns below are anchored on the verb instead.
 *
 * `scripts/audit/find-leaked-pipeline-text.mjs` covers a wider set of pipeline
 * artefacts for weekly reporting. This module holds the patterns the *build*
 * enforces, so it stays deliberately conservative: a false positive here
 * discards real prose from a live page.
 *
 * This is `.mjs` rather than `.ts` so the workbook parser and the CI validator
 * can share one definition without a build step.
 */

/**
 * Prose that addresses whoever is writing the page. Each pattern is anchored on
 * a verb of editorial direction ("framed", "positioned", "described as") rather
 * than on topic words, so ordinary sentences about an herb cannot match.
 *
 * @type {{ pattern: RegExp, name: string }[]}
 */
export const EDITORIAL_INSTRUCTION_PATTERNS = [
  { pattern: /\bit\s+(?:is|should\s+be)\s+(?:best\s+)?framed\b/i, name: 'framing-instruction' },
  { pattern: /\bshould\s+be\s+(?:framed|positioned|presented|described|treated)\b/i, name: 'presentation-instruction' },
  { pattern: /\bframe\s+(?:this|it)\b/i, name: 'imperative-framing' },
  { pattern: /\bpreserv\w*\s+(?:\w+\s+){0,3}discoverability\b/i, name: 'seo-instruction' },
  // Imperative voice: an instruction to whoever writes the page, with no
  // subject at all. 77 records carry one of these as their entire summary —
  // "Keep claims tied to source-backed preparation and safety context." is on
  // 35 profiles, 44 of the 77 are indexable.
  { pattern: /^\s*keep\s+(?:claims|language|framing|dosing|copy|wording)\b/i, name: 'imperative-keep' },
  { pattern: /^\s*treat\s+(?:dosing|outcomes|claims|this|these)\b/i, name: 'imperative-treat' },
  // Internal governance jargon. Neither term has any reader-facing meaning, so
  // its presence anywhere in prose marks the sentence as pipeline copy.
  { pattern: /\breview[- ]gated\b/i, name: 'governance-jargon' },
  { pattern: /\bpmid[- ]backed\b/i, name: 'governance-jargon' },
]

/**
 * Pipeline artefacts: row labels, enrichment-mode notes and other machinery
 * that was never meant to be read. These predate this module and lived as
 * duplicate literals in `build-runtime-from-workbook.mjs` and
 * `canonical/derive.mjs`, whose copy carried the comment "mirrors
 * build-runtime-from-workbook.mjs". Both now import from here so the two
 * pipelines cannot drift apart again.
 *
 * @type {RegExp[]}
 */
export const PIPELINE_ARTEFACT_PATTERNS = [
  /is linked here to/i,
  /lean herb row|lean monograph row/i,
  /high.speed phytochemical/i,
  /internal cross-linking supports/i,
  /\bis tracked for\b/i,
  /decision-ready summary/i,
  /evidence level:/i,
  /scispace evidence pass|evidence pass/i,
  /enriched in bulk|bulk mode/i,
]

/**
 * Internal governance rulings. These are decisions *about* publishing —
 * monetization blocks, review verdicts, workbook revision stamps — and none of
 * them has a reader-facing meaning.
 *
 * They are separated from the two sets above because they are not prose that
 * needs sanitizing out of a sentence: their presence anywhere in a published
 * string means an internal-only column was wired to a public field, which is a
 * structural defect that stripping a sentence would only hide. 219 strings in
 * `public/data` carried one, including 23 rendered as citation titles.
 *
 * @type {{ pattern: RegExp, name: string }[]}
 */
/** The version stamp that prefixes a workbook governance ruling. */
const WORKBOOK_REVISION_RULING = /^\s*v\d+(?:\.\d+)+\s*:/i

export const INTERNAL_GOVERNANCE_PATTERNS = [
  // "v10.0: …", "v9.4: …" — a workbook revision stamp on an editorial ruling.
  { pattern: WORKBOOK_REVISION_RULING, name: 'workbook-revision-ruling' },
  { pattern: /\bblock\s+monetiz\w+/i, name: 'monetization-ruling' },
  { pattern: /\bkeep\s+out\s+of\s+monetization\b/i, name: 'monetization-ruling' },
  { pattern: /\bmonetized\s+recommendation\b/i, name: 'monetization-ruling' },
  { pattern: /\bdo\s+not\s+publish\b/i, name: 'publication-ruling' },
  { pattern: /\binternal[- ]only\b/i, name: 'internal-marker' },
  { pattern: /\bsource\s+citation\s+missing\s+in\s+workbook\b/i, name: 'pipeline-status-note' },
  { pattern: /\bqueued\s+for\s+pmid\b/i, name: 'pipeline-status-note' },
]

/**
 * Every internal-governance pattern the value matches.
 *
 * @param {unknown} value
 * @returns {{ name: string }[]}
 */
export function findInternalGovernanceLeaks(value) {
  const text = String(value ?? '')
  if (!text.trim()) return []
  return INTERNAL_GOVERNANCE_PATTERNS.filter(({ pattern }) => pattern.test(text)).map(({ name }) => ({ name }))
}

/**
 * Everything the build refuses to publish in reader-facing prose.
 *
 * @type {RegExp[]}
 */
export const USER_FACING_LEAK_PATTERNS = [
  ...PIPELINE_ARTEFACT_PATTERNS,
  ...EDITORIAL_INSTRUCTION_PATTERNS.map(({ pattern }) => pattern),
  ...INTERNAL_GOVERNANCE_PATTERNS.map(({ pattern }) => pattern),
]

/**
 * Whether any leak pattern — artefact or instruction — matches.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isLeakedUserFacingText(value) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  return Boolean(text && USER_FACING_LEAK_PATTERNS.some((pattern) => pattern.test(text)))
}

/**
 * Drop only the offending sentences, keeping any genuine prose beside them.
 *
 * Several cells pair a real opening line with a trailing instruction —
 * pantethine's "Pantethine is a coenzyme A precursor studied for modest lipid
 * improvements." is real prose, and replacing the whole field with boilerplate
 * would discard it.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function stripLeakedSentences(value) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  if (!text) return ''
  // A version-stamped ruling — "v10.0: … block monetized recommendation." — is
  // internal as a whole value and is never partially salvageable. It also
  // cannot be split safely: the period inside the version number ends a
  // "sentence", so clause recovery would publish the fragment "v10." as prose.
  // Other rulings can still be welded to real content and are handled below.
  if (WORKBOOK_REVISION_RULING.test(text)) return ''
  const sentences = text.match(/[^.!?]+[.!?]*/g) ?? [text]
  return sentences
    .map((sentence) => (isLeakedUserFacingText(sentence) ? stripLeakedClauses(sentence) : sentence))
    .filter(Boolean)
    .join(' ')
    .replace(/\s+([.,;])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Drop only the offending clause when an instruction is welded to real content
 * by a semicolon or a pipe.
 *
 * Bacopa's dose cell reads "Dose varies by standardized extract and bacoside
 * content; do not publish a universal dose without extract standardization."
 * Only the second clause is an instruction, and dropping the whole sentence
 * would take a real dosing caveat with it — on a safety-relevant field. Working
 * one clause down recovers the content and still removes the instruction.
 *
 * @param {string} sentence
 * @returns {string}
 */
function stripLeakedClauses(sentence) {
  const trailingPunctuation = sentence.match(/[.!?]+\s*$/)?.[0]?.trim() ?? ''
  const clauses = sentence.split(/\s*[;|]\s*/).filter((clause) => clause.trim())
  if (clauses.length < 2) return ''

  const kept = clauses.filter((clause) => !isLeakedUserFacingText(clause))
  if (!kept.length) return ''

  const rebuilt = kept
    .map((clause) => clause.replace(/[.!?]+\s*$/, '').trim())
    .filter(Boolean)
    .join('; ')
  if (!rebuilt) return ''
  return `${rebuilt.charAt(0).toUpperCase()}${rebuilt.slice(1)}${trailingPunctuation || '.'}`
}

/**
 * Sanitize a reader-facing field, falling back only when nothing survives.
 *
 * @param {unknown} value
 * @param {string} fallback
 * @returns {string}
 */
export function cleanUserFacingText(value, fallback) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  if (!text) return fallback
  if (!isLeakedUserFacingText(text)) return text
  return stripLeakedSentences(text) || fallback
}

/** Fields that reach a reader, a meta description, or JSON-LD. */
export const READER_FACING_FIELDS = [
  'summary',
  'description',
  'short_description',
  'overview',
  'meta_description',
  'evidence_summary',
]

/**
 * Every field name that is published, wherever it appears in the tree.
 *
 * The validator walks nested structures rather than only top-level records,
 * because the leaks that shipped were not on the records the old validator
 * read. `sources[].title` renders as the name of a study in
 * `ShowMeTheStudies`, `ReferencedStudies` and `References`; `claimMap[].claim`
 * renders as the claim itself. Both sat one level below a record and so were
 * never inspected.
 *
 * @type {string[]}
 */
export const PUBLIC_TEXT_FIELDS = [
  ...READER_FACING_FIELDS,
  'generated_description',
  'searchText',
  'title',
  'claim',
  'text',
  'citation',
  'excerpt',
  'headline',
  // Serialized into the public detail payloads alongside each claim, so it is
  // fetchable whether or not a component renders it.
  'notes',
  // Dosing prose is rendered on the profile and is safety-relevant, so an
  // instruction hidden in it ("do not publish a universal dose without extract
  // standardization") is both a leak and a hazard.
  'dosage',
  'typical_dosage',
]

/**
 * Every instruction pattern the value matches.
 *
 * @param {unknown} value
 * @returns {{ name: string }[]}
 */
export function findEditorialLeaks(value) {
  const text = String(value ?? '')
  if (!text.trim()) return []
  return EDITORIAL_INSTRUCTION_PATTERNS.filter(({ pattern }) => pattern.test(text)).map(({ name }) => ({ name }))
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function hasEditorialLeak(value) {
  return findEditorialLeaks(value).length > 0
}

/**
 * Remove every sentence that reads as an editorial instruction.
 *
 * Returns the surviving prose, which on most affected records is the empty
 * string — the instruction *is* the whole field there. Callers decide what an
 * empty result means; this function never invents replacement text.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function stripEditorialLeak(value) {
  const text = String(value ?? '')
  if (!text.trim()) return ''

  const sentences = text.match(/[^.!?]+[.!?]*/g) ?? [text]
  return sentences
    .filter((sentence) => !hasEditorialLeak(sentence))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}
