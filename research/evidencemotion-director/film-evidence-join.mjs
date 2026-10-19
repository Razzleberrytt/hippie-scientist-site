/**
 * Research-only EvidenceMotion -> Claim DNA relationship-index adapter.
 * This verifies opaque canonical ID joins, NOT scientific support or release.
 * Only the upstream canonical study-identity layer may interpret PMID/DOI.
 * No runtime import, publication action, or new evidence dataset.
 */
import { createHash } from 'node:crypto';
import { parseStudyIdentity } from '../../lib/study-identity-runtime.mjs';

const HEX = /^[a-f0-9]{64}$/i;
const has = (object, key) => Object.hasOwn(object, key);
const validId = value => typeof value === 'string' && value.length > 0 && value.length <= 256 && value.trim() === value;
const arr = value => Array.isArray(value) && value.length > 0 && value.every(validId) && new Set(value).size === value.length;
const fields = new Set(['chemical_identity', 'mechanism', 'human_effect', 'safety']);
// Interpret source-provenance and metadata-resolution separately. A cited but
// uncached publication can still be an identity-only review candidate; an
// unresolved or unrecognized reference cannot. Neither status approves science.
const linkedProvenance = new Set(['primary_linked', 'secondary_linked', 'editorial_documented']);
const reviewableResolution = new Set(['resolved', 'metadata_unavailable']);
// Research-only structural check mirroring the canonical identity wire format.
// DOI-to-PMID associations remain upstream-owned: a matching shape is never
// proof that a study actually supports the film's scientific or human claim.
const typedStudyIdentityMatches = (canonicalId, pmid) => {
  const identity = parseStudyIdentity(canonicalId);
  if (identity.type === 'pmid') return pmid === identity.pmid;
  if (identity.type === 'doi')
    return pmid === null || (typeof pmid === 'string' && /^\d+$/.test(pmid));
  // Unverified source-ref/unknown roots are not established study identities.
  return false;
};
const hold = errors => ({status:'HOLD', errors:[...new Set(errors)].sort(), joins:[],
  scientificClaimsApproved:false, mediaApproved:false, mayPublish:false});

/**
 * @param {object} args
 * @param {string} args.relationshipIndexBytes - Exact original UTF-8 from existing Claim DNA Round 1C.
 * @param {string} args.expectedIndexSha256 - Externally trusted SHA, never obtained from the submitted index.
 * @param {Array} args.filmClaims - Research-only candidate mapping, not an approval list.
 */
export function inspectFilmEvidenceJoins({relationshipIndexBytes, expectedIndexSha256, filmClaims}={}) {
  if (typeof relationshipIndexBytes !== 'string' || !HEX.test(expectedIndexSha256 ?? ''))
    return hold(['PINNED_INDEX_BYTES_AND_SHA_REQUIRED']);
  const actual = createHash('sha256').update(relationshipIndexBytes, 'utf8').digest('hex');
  if (actual !== expectedIndexSha256.toLowerCase()) return hold(['SOURCE_INDEX_SHA_CHANGED']);
  let index;
  try { index = JSON.parse(relationshipIndexBytes); }
  catch { return hold(['INVALID_RELATIONSHIP_INDEX_JSON']); }
  if (!index || index.schema_version !== 'claim-dna-1c-relationships/0.1' ||
      !validId(index.batch_id) || !index.claims || typeof index.claims !== 'object' ||
      Array.isArray(index.claims) || !index.studies || typeof index.studies !== 'object' ||
      Array.isArray(index.studies) || !index.ingredients || typeof index.ingredients !== 'object' ||
      Array.isArray(index.ingredients)) return hold(['UNSUPPORTED_RELATIONSHIP_INDEX_SCHEMA']);
  if (!Array.isArray(filmClaims) || filmClaims.length === 0) return hold(['FILM_CLAIM_INVENTORY_REQUIRED']);
  const errors=[];
  const joins=[];
  const seen=new Set();
  for (const [i, claim] of filmClaims.entries()) {
    const unit=`filmClaim[${i}]`;
    if (!claim || typeof claim !== 'object' || Array.isArray(claim) ||
        !validId(claim.filmClaimId) || !validId(claim.claimId) ||
        !validId(claim.ingredient) || !fields.has(claim.claimType) || !arr(claim.canonicalStudyIds)) {
      errors.push(unit+':INVALID_FILM_CLAIM'); continue;
    }
    if (seen.has(claim.filmClaimId)) { errors.push(unit+':DUPLICATE_FILM_CLAIM_ID'); continue; }
    seen.add(claim.filmClaimId);
    // Structure records / generated illustrations cannot become a human-outcome citation.
    if (claim.sourceKind !== 'bibliographic_relationship') {
      errors.push(unit+':NON_BIBLIOGRAPHIC_VISUAL_IS_NOT_STUDY_EVIDENCE'); continue;
    }
    const c=has(index.claims, claim.claimId) ? index.claims[claim.claimId] : null;
    const ing=has(index.ingredients, claim.ingredient) ? index.ingredients[claim.ingredient] : null;
    if (!c || c.claim_id !== claim.claimId || c.ingredient !== claim.ingredient ||
        !ing || ing.profile_slug !== claim.ingredient ||
        !Array.isArray(ing.claims) || !ing.claims.includes(claim.claimId) ||
        !arr(c.studies) || !Array.isArray(ing.studies)) {
      errors.push(unit+':CLAIM_INGREDIENT_RELATIONSHIP_MISSING'); continue;
    }
    if (!linkedProvenance.has(c.provenance_status) || !reviewableResolution.has(c.resolution_status)) {
      errors.push(unit+':CLAIM_PROVENANCE_OR_RESOLUTION_NOT_REVIEWABLE'); continue;
    }
    const linked=[];
    for (const canonicalId of claim.canonicalStudyIds) {
      const s=has(index.studies, canonicalId) ? index.studies[canonicalId] : null;
      if (!c.studies.includes(canonicalId) || !ing.studies.includes(canonicalId) || !s ||
          s.canonical_id !== canonicalId || !Array.isArray(s.claims) ||
          !s.claims.includes(claim.claimId) || !Array.isArray(s.ingredients) ||
          !s.ingredients.includes(claim.ingredient) ||
          (s.pmid !== null && (typeof s.pmid !== 'string' || !/^\d+$/.test(s.pmid)))) {
        errors.push(unit+':STUDY_CROSS_LINK_MISSING_OR_INVALID'); continue;
      }
      if (!typedStudyIdentityMatches(canonicalId, s.pmid)) {
        errors.push(unit+':STUDY_CANONICAL_IDENTITY_MISMATCH'); continue;
      }
      linked.push(canonicalId);
    }
    if (linked.length === claim.canonicalStudyIds.length) joins.push({
      filmClaimId:claim.filmClaimId, claimId:claim.claimId, claimType:claim.claimType,
      canonicalStudyIds:[...linked].sort(), status:'IDENTITY_LINK_ONLY_REVIEW_REQUIRED'
    });
  }
  if (errors.length) return hold(errors);
  return {status:'IDENTITY_LINKS_READY_FOR_EDITORIAL_REVIEW', errors:[],
    indexSha256:actual, batchId:index.batch_id, joins,
    scientificClaimsApproved:false, mediaApproved:false, mayPublish:false,
    caveat:'A citation relationship is not evidence of support, effect size, directness, safety or clinical truth. Check original studies, claim context and rendered speech/pixels independently.'};
}
