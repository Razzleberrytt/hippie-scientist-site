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
 * Everything the build refuses to publish in reader-facing prose.
 *
 * @type {RegExp[]}
 */
export const USER_FACING_LEAK_PATTERNS = [
  ...PIPELINE_ARTEFACT_PATTERNS,
  ...EDITORIAL_INSTRUCTION_PATTERNS.map(({ pattern }) => pattern),
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
  const sentences = text.match(/[^.!?]+[.!?]*/g) ?? [text]
  return sentences
    .filter((sentence) => !isLeakedUserFacingText(sentence))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
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
