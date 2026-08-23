import { normalizeBinomialName } from './normalize.mjs'

/**
 * Synonym-resolution policy for `latin_name`.
 *
 * A taxonomic authority reports two very different things through the same
 * `SYNONYM` status, and they must not be treated alike:
 *
 *   generic transfer — the same organism, moved to a different genus. The
 *     specific epithet is unchanged. `Cordyceps sinensis` -> `Ophiocordyceps
 *     sinensis` is one organism under a newer name, so resolving is strictly
 *     better data.
 *
 *   lumping — a narrower taxon absorbed into a broader one. The specific
 *     epithet changes. `Citrus paradisi` -> `Citrus aurantium` collapses
 *     grapefruit into bitter orange, which for this site is a different
 *     supplement with different safety cautions. Resolving is actively wrong.
 *
 * The epithet test separates them mechanically, so the decision is auditable
 * rather than re-argued per entity. Two further guards apply: the accepted
 * target must be at species rank (the workbook has no subspecies precedent —
 * its one non-binomial is the hybrid `Mentha × piperita`), and it must not
 * already be another entity's `latin_name`, which would create two profiles
 * claiming the same organism.
 */

export const SYNONYM_VERDICTS = {
  RESOLVE: 'resolve',
  LUMPING: 'lumping',
  NOT_SPECIES: 'not-species-rank',
  COLLISION: 'collision',
  NOT_SYNONYM: 'not-a-synonym',
}

function epithetOf(binomial) {
  const parts = normalizeBinomialName(binomial).split(/\s+/).filter(Boolean)
  // parts[0] is the genus; the first lowercase token after it is the epithet.
  return parts.length >= 2 ? parts[1].toLowerCase() : ''
}

function genusOf(binomial) {
  return (normalizeBinomialName(binomial).split(/\s+/)[0] || '').toLowerCase()
}

/**
 * @param {object} input
 * @param {string} input.searchedName   the name that was looked up
 * @param {string} input.acceptedName   the authority's accepted canonical name
 * @param {string} input.acceptedRank   e.g. 'SPECIES', 'SUBSPECIES'
 * @param {Map<string,string>} [input.existingLatinNames] lowercase value -> slug
 * @param {string} [input.slug]         the entity being enriched, exempt from collision
 */
export function classifySynonym({
  searchedName,
  acceptedName,
  acceptedRank,
  existingLatinNames = new Map(),
  slug = '',
}) {
  const searched = normalizeBinomialName(searchedName)
  const accepted = normalizeBinomialName(acceptedName)

  if (!accepted || accepted === searched) {
    return { verdict: SYNONYM_VERDICTS.NOT_SYNONYM, resolve: false, value: '', reason: 'no distinct accepted target' }
  }

  if (String(acceptedRank || '').toUpperCase() !== 'SPECIES') {
    return {
      verdict: SYNONYM_VERDICTS.NOT_SPECIES,
      resolve: false,
      value: '',
      reason:
        `accepted target "${accepted}" is at ${acceptedRank || 'unknown'} rank, not SPECIES. ` +
        'Every latin_name in the workbook is a binomial (its one exception is the hybrid Mentha × piperita), ' +
        'so a trinomial would break the format convention.',
    }
  }

  const searchedEpithet = epithetOf(searched)
  const acceptedEpithet = epithetOf(accepted)
  if (!searchedEpithet || !acceptedEpithet) {
    return {
      verdict: SYNONYM_VERDICTS.NOT_SPECIES,
      resolve: false,
      value: '',
      reason: 'could not read a specific epithet from one of the names',
    }
  }

  if (searchedEpithet !== acceptedEpithet) {
    return {
      verdict: SYNONYM_VERDICTS.LUMPING,
      resolve: false,
      value: '',
      reason:
        `"${searched}" -> "${accepted}" changes the specific epithet (${searchedEpithet} -> ${acceptedEpithet}), ` +
        'so this is a lumping into a broader taxon, not a generic transfer of the same organism. ' +
        'Resolving it would relabel this entity as a different one.',
    }
  }

  const owner = existingLatinNames.get(accepted.toLowerCase())
  if (owner && owner !== slug) {
    return {
      verdict: SYNONYM_VERDICTS.COLLISION,
      resolve: false,
      value: '',
      reason: `accepted target "${accepted}" is already the latin_name of entity "${owner}"`,
    }
  }

  return {
    verdict: SYNONYM_VERDICTS.RESOLVE,
    resolve: true,
    value: accepted,
    reason:
      `"${searched}" -> "${accepted}" is a generic transfer: the specific epithet "${acceptedEpithet}" is ` +
      `unchanged and only the genus moved (${genusOf(searched)} -> ${genusOf(accepted)}). Same organism, current name.`,
  }
}

/** Build the collision index the policy needs, from canonical data. */
export function existingLatinNameIndex(canonical) {
  const index = new Map()
  for (const [slug, { row }] of canonical.bySlug) {
    const value = normalizeBinomialName(row.latin_name).toLowerCase()
    if (value) index.set(value, slug)
  }
  return index
}
