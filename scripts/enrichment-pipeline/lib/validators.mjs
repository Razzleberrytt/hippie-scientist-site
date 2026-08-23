import {
  evidenceRank,
  fieldAppliesToEntityType,
  needsHumanReview,
  sourceClassEvidenceLevel,
} from './contract.mjs'
import { getEntity, isGap } from './canonical.mjs'
import { dedupeSources, sourceIdentity } from './source-identity.mjs'
import {
  normalizeFieldValue,
  normalizeText,
  studyTypeIsHuman,
  studyTypeIsPreclinical,
} from './normalize.mjs'

/**
 * Deterministic validation and overwrite protection.
 *
 * Four independent validators run over every normalized candidate. Each returns
 * structured findings rather than throwing, so one bad change never hides the
 * rest, and every finding names the job, entity, field, rule, offending value,
 * and the correction that would clear it.
 *
 * A candidate becomes importable only when it has zero errors AND no change
 * routed to review. That is enforced in one place — `verdictFor` — so no caller
 * can construct an importable result by assembling partial checks.
 */

export const SEVERITY = { ERROR: 'error', REVIEW: 'review', INFO: 'info' }

/** Language that asserts clinical efficacy. Not permitted on mechanistic support. */
const CLINICAL_CLAIM_PATTERNS = [
  /\b(treats?|treating|cures?|curing|heals?|prevents?|preventing|reverses?)\b/i,
  /\b(clinically\s+proven|proven\s+to|guarantee[sd]?)\b/i,
  /\b(effective\s+(?:for|against|treatment))\b/i,
  /\b(eliminates?|eradicates?)\b/i,
]

/** Absolute certainty language, never acceptable in generated content. */
const CERTAINTY_PATTERNS = [
  /\b(always|never|completely|totally|guaranteed|100%|no\s+side\s+effects)\b/i,
  /\b(safe\s+for\s+everyone|works\s+for\s+everyone)\b/i,
]

/** Preclinical findings must stay labelled as such. */
const PRECLINICAL_LABELS = /\b(in\s+vitro|animal|rodent|mice|murine|rat|cell|preclinical|mechanistic)\b/i

function finding(severity, rule, message, extra = {}) {
  return { severity, rule, message, ...extra }
}

/* ------------------------------------------------------------------ *
 * 1. Contract / schema validation
 * ------------------------------------------------------------------ */

export function validateAgainstContract(candidate, contract) {
  const findings = []

  for (const change of candidate.changes) {
    const field = contract.fields.get(change.field)
    const at = { field: change.field, slug: candidate.entity.slug }

    if (!field) {
      findings.push(
        finding(SEVERITY.ERROR, 'unknown-field', `"${change.field}" is not in the enrichment contract`, {
          ...at,
          fix: 'Remove the change, or add the field to the contract with an explicit policy and rationale.',
        }),
      )
      continue
    }

    if (field.enrichment === 'prohibited' || field.enrichment === 'derived') {
      findings.push(
        finding(
          SEVERITY.ERROR,
          'locked-field',
          `"${change.field}" is ${field.enrichment} and can never be written by enrichment: ${field.rationale}`,
          { ...at, fix: 'Drop this change. Governance and derived columns are changed by humans or by the build.' },
        ),
      )
      continue
    }

    if (!fieldAppliesToEntityType(field, candidate.entity.type)) {
      findings.push(
        finding(
          SEVERITY.ERROR,
          'entity-type-mismatch',
          `"${change.field}" does not apply to entity_type "${candidate.entity.type}" ` +
            `(allowed: ${field.applies_to_entity_types.join(', ')})`,
          at,
        ),
      )
      continue
    }

    if (change.operation === 'no-op') continue

    const normalized = normalizeFieldValue(change.proposed_value, field.normalizer)
    if (normalized !== change.proposed_value) {
      findings.push(
        finding(SEVERITY.ERROR, 'not-normalized', `"${change.field}" was not normalized before validation`, {
          ...at,
          value: change.proposed_value,
          fix: `Run normalization (${field.normalizer}) first; expected "${normalized}".`,
        }),
      )
    }

    if (normalized.length > field.max_length) {
      findings.push(
        finding(
          SEVERITY.ERROR,
          'max-length',
          `"${change.field}" is ${normalized.length} characters, limit is ${field.max_length}`,
          { ...at, fix: `Shorten the value to ${field.max_length} characters or fewer.` },
        ),
      )
    }

    if (field.allowed_values && !field.allowed_values.includes(normalized)) {
      findings.push(
        finding(SEVERITY.ERROR, 'not-in-vocabulary', `"${normalized}" is not an allowed value for ${change.field}`, {
          ...at,
          fix: `Use one of: ${field.allowed_values.join(', ')}`,
        }),
      )
    }

    if (!contract.confidenceLevels.includes(change.confidence)) {
      findings.push(
        finding(
          SEVERITY.ERROR,
          'confidence',
          `confidence "${change.confidence}" is not one of: ${contract.confidenceLevels.join(', ')}`,
          at,
        ),
      )
    }

    const sources = change.source_ids
      .map((id) => candidate.sources.find((s) => s.id === id))
      .filter(Boolean)

    if (sources.length < field.min_sources) {
      findings.push(
        finding(
          SEVERITY.ERROR,
          'insufficient-sources',
          `"${change.field}" requires at least ${field.min_sources} source(s), got ${sources.length}`,
          at,
        ),
      )
    }

    for (const source of sources) {
      if (!field.accepted_source_classes.includes(source.class)) {
        findings.push(
          finding(
            SEVERITY.ERROR,
            'source-class-not-accepted',
            `source "${source.id}" has class "${source.class}", which "${change.field}" does not accept`,
            {
              ...at,
              fix: `Accepted classes: ${field.accepted_source_classes.join(', ')}`,
            },
          ),
        )
      }
    }

    const best = sources.reduce((max, source) => {
      const level = sourceClassEvidenceLevel(contract, source.class)
      return Math.max(max, evidenceRank(contract, level))
    }, -1)
    const floor = evidenceRank(contract, field.min_evidence_level)
    if (best < floor) {
      findings.push(
        finding(
          SEVERITY.ERROR,
          'evidence-floor',
          `"${change.field}" needs evidence level "${field.min_evidence_level}" or better; ` +
            `best supplied source reaches rank ${best}`,
          at,
        ),
      )
    }
  }

  return findings
}

/* ------------------------------------------------------------------ *
 * 2. Scientific integrity
 * ------------------------------------------------------------------ */

export function validateScientificIntegrity(candidate, contract) {
  const findings = []

  for (const change of candidate.changes) {
    if (change.operation === 'no-op') continue
    const at = { field: change.field, slug: candidate.entity.slug }
    const value = String(change.proposed_value ?? '')
    const sources = change.source_ids
      .map((id) => candidate.sources.find((s) => s.id === id))
      .filter(Boolean)

    for (const pattern of CERTAINTY_PATTERNS) {
      if (pattern.test(value)) {
        findings.push(
          finding(SEVERITY.ERROR, 'certainty-language', `absolute certainty language in "${change.field}"`, {
            ...at,
            value,
            fix: 'Rewrite without absolute claims; describe what the studies observed.',
          }),
        )
        break
      }
    }

    const assertsClinicalEffect = CLINICAL_CLAIM_PATTERNS.some((p) => p.test(value))
    const hasHumanSource = sources.some((s) => {
      const level = sourceClassEvidenceLevel(contract, s.class)
      return evidenceRank(contract, level) >= evidenceRank(contract, 'human-observational')
    })
    const onlyPreclinical =
      sources.length > 0 &&
      sources.every((s) => studyTypeIsPreclinical(s.study_type) || s.class === 'preclinical-mechanistic-study')

    if (assertsClinicalEffect && !hasHumanSource) {
      findings.push(
        finding(
          SEVERITY.ERROR,
          'clinical-claim-without-human-evidence',
          `"${change.field}" asserts a clinical effect but no cited source reaches human evidence`,
          { ...at, value, fix: 'Cite a human study, or rewrite the value as a mechanistic observation.' },
        ),
      )
    }

    if (onlyPreclinical && !PRECLINICAL_LABELS.test(value) && assertsClinicalEffect) {
      findings.push(
        finding(
          SEVERITY.ERROR,
          'unlabelled-preclinical',
          `"${change.field}" is supported only by preclinical sources but is not labelled as preclinical`,
          { ...at, value, fix: 'Label the finding (in vitro / animal / mechanistic) or cite human evidence.' },
        ),
      )
    }

    // A source whose own study type is human must not be described as animal
    // work, and vice versa — mislabelling is how evidence gets laundered.
    for (const source of sources) {
      if (!source.study_type) continue
      const claimsPreclinical = PRECLINICAL_LABELS.test(value)
      if (claimsPreclinical && studyTypeIsHuman(source.study_type) && sources.length === 1) {
        findings.push(
          finding(
            SEVERITY.REVIEW,
            'evidence-label-mismatch',
            `"${change.field}" reads as preclinical but its only source is a ${source.study_type}`,
            { ...at, fix: 'Confirm the labelling matches the cited study design.' },
          ),
        )
      }
    }

    if (change.contradicts_existing_evidence) {
      findings.push(
        finding(
          SEVERITY.REVIEW,
          'contradictory-evidence',
          `"${change.field}" contradicts evidence already recorded for this entity`,
          { ...at, fix: 'A human must reconcile the conflicting findings before import.' },
        ),
      )
    }
    if (change.negative_or_null_finding) {
      findings.push(
        finding(
          SEVERITY.INFO,
          'negative-finding-retained',
          `"${change.field}" records a negative or null finding; retained deliberately`,
          at,
        ),
      )
    }
  }

  return findings
}

/* ------------------------------------------------------------------ *
 * 3. Citation integrity
 * ------------------------------------------------------------------ */

export function validateCitations(candidate, contract) {
  const findings = []
  const { duplicatesRemoved, merges, unidentified } = dedupeSources(candidate.sources)

  for (const source of unidentified) {
    findings.push(
      finding(
        SEVERITY.ERROR,
        'unidentified-source',
        `source "${source.id}" has no resolvable identity (DOI, PMID, PMCID, URL, or title+year+author)`,
        {
          slug: candidate.entity.slug,
          fix: 'Add a DOI or PMID, or supply title, year, and first author together.',
        },
      ),
    )
  }

  for (const merge of merges) {
    findings.push(
      finding(SEVERITY.ERROR, 'duplicate-source', `sources "${merge.kept}" and "${merge.dropped}" are the same source`, {
        slug: candidate.entity.slug,
        fix: 'Keep one entry and point every change at it.',
      }),
    )
  }

  for (const source of candidate.sources) {
    const klass = contract.sourceClasses[source.class]
    if (!klass) {
      findings.push(
        finding(SEVERITY.ERROR, 'unknown-source-class', `source "${source.id}" has unknown class "${source.class}"`, {
          slug: candidate.entity.slug,
          fix: `Known classes: ${Object.keys(contract.sourceClasses).join(', ')}`,
        }),
      )
      continue
    }

    const identity = sourceIdentity(source)
    if (klass.identifier_required && !['doi', 'pmid', 'pmcid'].includes(identity.kind)) {
      findings.push(
        finding(
          SEVERITY.ERROR,
          'identifier-required',
          `class "${source.class}" requires a DOI, PMID, or PMCID; source "${source.id}" has ${identity.kind}`,
          { slug: candidate.entity.slug },
        ),
      )
    }

    if (klass.authority_hosts && identity.kind === 'url') {
      const host = safeHost(source.url)
      const allowed = klass.authority_hosts.some(
        (h) => host === h.replace(/^www\./, '') || host.endsWith(`.${h.replace(/^www\./, '')}`),
      )
      if (!allowed) {
        findings.push(
          finding(
            SEVERITY.ERROR,
            'non-authority-host',
            `source "${source.id}" cites ${host || '(unparseable url)'}, which is not an accepted authority for class "${source.class}"`,
            { slug: candidate.entity.slug, fix: `Accepted hosts: ${klass.authority_hosts.join(', ')}` },
          ),
        )
      }
    }
  }

  if (duplicatesRemoved) {
    findings.push(
      finding(SEVERITY.INFO, 'duplicates-detected', `${duplicatesRemoved} duplicate source record(s) detected`, {
        slug: candidate.entity.slug,
      }),
    )
  }

  return findings
}

function safeHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return ''
  }
}

/* ------------------------------------------------------------------ *
 * 4. Production integrity + overwrite protection
 * ------------------------------------------------------------------ */

export function validateAgainstProduction(candidate, contract, canonical) {
  const findings = []
  const entity = getEntity(canonical, candidate.entity.slug)

  if (!entity) {
    findings.push(
      finding(SEVERITY.ERROR, 'unknown-entity', `slug "${candidate.entity.slug}" is not in ${canonical.entitySheet}`, {
        slug: candidate.entity.slug,
        fix: 'The pipeline never creates entities. Add the entity to the workbook by hand first.',
      }),
    )
    return findings
  }

  if (canonical.duplicateSlugs.some((d) => d.slug === candidate.entity.slug)) {
    findings.push(
      finding(SEVERITY.ERROR, 'duplicate-slug', `slug "${candidate.entity.slug}" is duplicated in the workbook`, {
        slug: candidate.entity.slug,
        fix: 'Resolve the duplicate row before importing anything for this entity.',
      }),
    )
  }

  const actualType = String(entity.row.entity_type ?? '').trim().toLowerCase()
  if (actualType !== candidate.entity.type) {
    findings.push(
      finding(
        SEVERITY.ERROR,
        'entity-type-drift',
        `candidate says entity_type "${candidate.entity.type}" but the workbook says "${actualType}"`,
        { slug: candidate.entity.slug, fix: 'Rescan; the queue is stale.' },
      ),
    )
  }

  for (const change of candidate.changes) {
    if (change.operation === 'no-op') continue
    const field = contract.fields.get(change.field)
    if (!field) continue
    const at = { field: change.field, slug: candidate.entity.slug }

    if (!Object.prototype.hasOwnProperty.call(entity.row, change.field)) {
      findings.push(
        finding(SEVERITY.ERROR, 'column-missing', `column "${change.field}" does not exist in ${canonical.entitySheet}`, at),
      )
      continue
    }

    // A value already held by a different entity means two profiles would claim
    // the same thing. Sometimes that is correct — `holy-basil-seed` and
    // `holy-basil-purple` share a source species, as do `milk-oats` and
    // `oatstraw` — and sometimes it means the two entities are duplicates, as
    // `lions-mane` and `hericium-erinaceus` are. Only a human can tell, so this
    // routes to review rather than failing.
    if (field.shared_value_needs_review && change.operation === 'set') {
      const proposed = normalizeText(change.proposed_value).toLowerCase()
      for (const [otherSlug, other] of canonical.bySlug) {
        if (otherSlug === candidate.entity.slug) continue
        if (normalizeText(other.row[change.field]).toLowerCase() !== proposed) continue
        findings.push(
          finding(
            SEVERITY.REVIEW,
            'shared-value',
            `"${change.proposed_value}" is already the ${change.field} of entity "${otherSlug}"`,
            {
              ...at,
              fix:
                `Confirm whether "${candidate.entity.slug}" and "${otherSlug}" are genuinely different entities ` +
                'that share a source organism (plant parts, preparations), or duplicates that should be merged.',
            },
          ),
        )
        break
      }
    }

    const canonicalValue = normalizeText(entity.row[change.field])
    const observed = normalizeText(change.current_value)
    if (canonicalValue !== observed) {
      findings.push(
        finding(
          SEVERITY.ERROR,
          'stale-candidate',
          `"${change.field}" changed in the workbook since this candidate was produced`,
          {
            ...at,
            expected: observed,
            actual: canonicalValue,
            fix: 'Rescan and re-run the job against the current value.',
          },
        ),
      )
    }
  }

  return findings
}

/**
 * Overwrite decisions.
 *
 * Returns one decision per change: `apply`, `no-op`, or `review`. A populated
 * canonical cell is protected by default — the only paths to `apply` over a
 * populated cell are an exactly equivalent value (which becomes a no-op) or an
 * `only-if-higher-confidence` field where the candidate strictly beats what is
 * already there. Everything else routes to a human.
 */
export function decideOverwrites(candidate, contract, canonical) {
  const entity = getEntity(canonical, candidate.entity.slug)
  const decisions = []

  for (const change of candidate.changes) {
    const field = contract.fields.get(change.field)
    const base = { field: change.field, slug: candidate.entity.slug }

    if (change.operation === 'no-op') {
      decisions.push({ ...base, decision: 'no-op', reason: 'worker found nothing to propose' })
      continue
    }
    if (!field || !entity) {
      decisions.push({ ...base, decision: 'review', reason: 'field or entity not resolvable' })
      continue
    }

    const canonicalValue = normalizeText(entity.row[change.field])
    const proposed = normalizeFieldValue(change.proposed_value, field.normalizer)
    const occupied = !isGap(canonicalValue)

    if (occupied && equivalent(canonicalValue, proposed, field)) {
      decisions.push({
        ...base,
        decision: 'no-op',
        reason: 'canonical value is already equivalent',
        canonical_value: canonicalValue,
        proposed_value: proposed,
      })
      continue
    }

    switch (field.overwrite_policy) {
      case 'never':
        decisions.push({ ...base, decision: 'review', reason: `overwrite_policy is never: ${field.rationale}` })
        break

      case 'manual-review':
        decisions.push({
          ...base,
          decision: 'review',
          reason: 'field is manual-review; a human accepts every value',
          canonical_value: canonicalValue,
          proposed_value: proposed,
        })
        break

      case 'only-if-empty':
        if (occupied) {
          decisions.push({
            ...base,
            decision: 'review',
            reason: 'canonical cell is already populated and this field is fill-only',
            canonical_value: canonicalValue,
            proposed_value: proposed,
          })
        } else if (needsHumanReview(field)) {
          decisions.push({
            ...base,
            decision: 'review',
            reason: 'field always requires human acceptance',
            proposed_value: proposed,
          })
        } else {
          decisions.push({ ...base, decision: 'apply', reason: 'empty cell filled', proposed_value: proposed })
        }
        break

      case 'only-if-higher-confidence': {
        if (!occupied) {
          decisions.push({ ...base, decision: 'apply', reason: 'empty cell filled', proposed_value: proposed })
          break
        }
        const stronger =
          change.confidence === 'high' &&
          evidenceRank(contract, change.evidence_level) >
            evidenceRank(contract, change.existing_evidence_level || 'none')
        decisions.push({
          ...base,
          decision: stronger && !needsHumanReview(field) ? 'apply' : 'review',
          reason: stronger
            ? 'candidate carries strictly stronger evidence'
            : 'replacement of a populated cell requires review',
          canonical_value: canonicalValue,
          proposed_value: proposed,
        })
        break
      }

      default:
        decisions.push({ ...base, decision: 'review', reason: `unrecognised overwrite policy` })
    }
  }

  return decisions
}

function equivalent(a, b, field) {
  if (a === b) return true
  if (field.normalizer === 'semicolonList') {
    const key = (v) =>
      v
        .split(';')
        .map((p) => p.trim().toLowerCase())
        .filter(Boolean)
        .sort()
        .join('|')
    return key(a) === key(b)
  }
  return a.toLowerCase() === b.toLowerCase()
}

/* ------------------------------------------------------------------ *
 * Verdict
 * ------------------------------------------------------------------ */

/**
 * The single place a candidate can be declared importable. Every validator must
 * have run, there must be no errors, and at least one change must be applicable.
 */
export function verdictFor({ findings, decisions }) {
  const errors = findings.filter((f) => f.severity === SEVERITY.ERROR)
  const reviews = findings.filter((f) => f.severity === SEVERITY.REVIEW)
  const applyDecisions = decisions.filter((d) => d.decision === 'apply')
  const reviewDecisions = decisions.filter((d) => d.decision === 'review')
  const noops = decisions.filter((d) => d.decision === 'no-op')

  let status
  if (errors.length) status = 'rejected'
  else if (reviewDecisions.length || reviews.length) status = 'needs_review'
  else if (applyDecisions.length) status = 'validated'
  else status = 'no_op'

  return {
    status,
    importable: status === 'validated',
    counts: {
      errors: errors.length,
      reviews: reviews.length + reviewDecisions.length,
      apply: applyDecisions.length,
      no_op: noops.length,
    },
    errors,
    review_findings: reviews,
    apply_decisions: applyDecisions,
    review_decisions: reviewDecisions,
    no_op_decisions: noops,
  }
}

/** Run every validator over one candidate. */
export function validateCandidate(candidate, { contract, canonical }) {
  const findings = [
    ...validateAgainstContract(candidate, contract),
    ...validateScientificIntegrity(candidate, contract),
    ...validateCitations(candidate, contract),
    ...validateAgainstProduction(candidate, contract, canonical),
  ]
  const decisions = decideOverwrites(candidate, contract, canonical)
  return { candidate, findings, decisions, verdict: verdictFor({ findings, decisions }) }
}
