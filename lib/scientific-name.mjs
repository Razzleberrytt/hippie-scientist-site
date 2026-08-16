/**
 * Validate botanical names against the conventions a reader expects.
 *
 * A profile's Latin name is rendered in italics under the common name and
 * published as `latinName` in structured data, so a malformed one is visible
 * and looks careless on a site whose whole claim is scientific care.
 *
 * The rules are narrower than they first appear, and the exceptions are the
 * point — a naive "Genus species, capital then lowercase" check rejects
 * `Mentha × piperita`, which is correct notation for a hybrid and is exactly
 * how peppermint must be written.
 *
 * Handled:
 *   Genus species                      Withania somnifera
 *   hybrid marker                      Mentha × piperita   (also "x piperita")
 *   infraspecific rank                 Panax ginseng var. coreensis
 *                                      Salvia officinalis subsp. lavandulifolia
 *   genus only                         Echinacea
 *   author citation after the binomial Bacopa monnieri (L.) Wettst.
 */

/** Genus: one capitalised word, letters only. */
const GENUS = /^[A-Z][a-z]+$/
/** Species epithet: lowercase, may be hyphenated. */
const EPITHET = /^[a-z][a-z-]+$/
/** The hybrid marker, either the multiplication sign or a bare lowercase x. */
const HYBRID = /^(?:×|x)$/
/** Infraspecific rank abbreviations that may precede a further epithet. */
const RANK = /^(?:var|subsp|ssp|f|cv)\.$/
/**
 * An author citation follows the name and is not part of it — "(L.) Wettst.",
 * "Wall. ex Nees". Once one starts, the rest of the string is not validated.
 */
const AUTHOR_START = /^[("A-Z]/

export const SCIENTIFIC_NAME_ISSUES = {
  EMPTY: 'empty',
  GENUS_NOT_CAPITALIZED: 'genus-not-capitalized',
  EPITHET_NOT_LOWERCASE: 'species-epithet-not-lowercase',
  ALL_CAPS: 'all-caps',
  TRAILING_PUNCTUATION: 'trailing-punctuation',
  DOUBLE_SPACED: 'irregular-whitespace',
}

const text = (value) => String(value ?? '').trim()

/**
 * Check one botanical name.
 *
 * @param {unknown} value
 * @returns {{ valid: boolean, issues: string[], normalized: string }}
 */
export function validateScientificName(value) {
  const raw = String(value ?? '')
  const name = text(raw)
  const issues = []

  if (!name) return { valid: false, issues: [SCIENTIFIC_NAME_ISSUES.EMPTY], normalized: '' }

  if (raw !== name || /\s{2,}/.test(raw)) issues.push(SCIENTIFIC_NAME_ISSUES.DOUBLE_SPACED)
  // A trailing comma or semicolon is always wrong. A trailing period usually
  // is not — author citations and rank markers end in one ("Wettst.", "L.",
  // "var."). Only a lowercase word with a period stuck on it is a real defect.
  if (/[,;:]$/.test(name) || /(?:^|\s)[a-z][a-z-]*\.$/.test(name)) {
    issues.push(SCIENTIFIC_NAME_ISSUES.TRAILING_PUNCTUATION)
  }
  // "WITHANIA SOMNIFERA" carries no rank information and reads as shouting.
  if (name === name.toUpperCase() && /[A-Z]{4,}/.test(name)) {
    issues.push(SCIENTIFIC_NAME_ISSUES.ALL_CAPS)
    return { valid: false, issues, normalized: name.replace(/\s+/g, ' ') }
  }

  const tokens = name.replace(/\s+/g, ' ').split(' ')
  const [genus, ...rest] = tokens

  if (!GENUS.test(genus)) issues.push(SCIENTIFIC_NAME_ISSUES.GENUS_NOT_CAPITALIZED)

  // Walk the tokens after the genus until an author citation begins.
  let expectEpithet = true
  let seenEpithet = false
  for (const token of rest) {
    if (HYBRID.test(token)) continue
    if (RANK.test(token)) {
      expectEpithet = true
      continue
    }
    // An author citation ends the name proper — but only ever follows a valid
    // epithet. Checking it first would read the capitalised word in
    // "Withania Somnifera" as an author and pass the typo.
    if (seenEpithet && AUTHOR_START.test(token)) break
    if (!expectEpithet) break
    if (!EPITHET.test(token)) {
      issues.push(SCIENTIFIC_NAME_ISSUES.EPITHET_NOT_LOWERCASE)
      break
    }
    seenEpithet = true
    expectEpithet = false
  }

  return { valid: issues.length === 0, issues, normalized: name.replace(/\s+/g, ' ') }
}
