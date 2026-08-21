import { buildStableEntityId } from '../../config/evidence-graph/identity-rules.mjs'
import { contentHash, entityId, stableStringify } from './canonical/ids.mjs'

function clean(value) {
  return String(value ?? '').trim()
}

function buildIdentityMap({ herbs = [], compounds = [] } = {}) {
  const map = new Map()
  const add = (record, kind) => {
    const slug = clean(record?.slug)
    if (!slug) return
    map.set(entityId(kind, slug), buildStableEntityId(kind, slug))
  }
  herbs.forEach((record) => add(record, 'herb'))
  compounds.forEach((record) => add(record, 'compound'))
  return map
}

function remap(value, map) {
  return map.get(value) || value
}

function remapClaim(claim, map) {
  const legacyCanonicalSubjectId = claim.subjectId
  const subjectId = remap(legacyCanonicalSubjectId, map)
  return {
    ...claim,
    subjectId,
    ...(subjectId !== legacyCanonicalSubjectId ? { legacyCanonicalSubjectId } : {}),
  }
}

/**
 * Canonical claims still reference legacy deterministic `ent_*` subject IDs.
 * Public structured endpoints use the newer evidence-graph identity contract
 * (`herb:<slug>` / `compound:<slug>`), while preserving legacy IDs only for
 * provenance and backwards-compatible claim-store joins.
 */
export function remapClaimKnowledgeToStableSubstanceIds(knowledge, runtime = {}) {
  const map = buildIdentityMap(runtime)
  if (!map.size) return knowledge

  const claims = Object.fromEntries(
    Object.entries(knowledge.claims || {}).map(([claimId, claim]) => [claimId, remapClaim(claim, map)]),
  )

  const dependencies = Object.fromEntries(
    Object.entries(knowledge.dependencies || {}).map(([claimId, dependency]) => {
      const legacyCanonicalSubjectId = dependency.subjectId
      const subjectId = remap(legacyCanonicalSubjectId, map)
      return [claimId, {
        ...dependency,
        subjectId,
        ...(subjectId !== legacyCanonicalSubjectId ? { legacyCanonicalSubjectId } : {}),
      }]
    }),
  )

  const endpoints = (knowledge.endpoints || []).map((endpoint) => {
    const legacyCanonicalId = endpoint.entity.id
    const stableId = remap(legacyCanonicalId, map)
    const endpointClaims = (endpoint.claims || []).map((claim) => remapClaim(claim, map))
    return {
      ...endpoint,
      entity: {
        ...endpoint.entity,
        id: stableId,
        ...(stableId !== legacyCanonicalId ? { legacyCanonicalId } : {}),
      },
      claims: endpointClaims,
    }
  })

  const endpointIndex = Object.fromEntries(
    endpoints.map((endpoint) => [endpoint.entity.id, `/data/ingredients/${endpoint.entity.slug}.json`]),
  )

  const integrityHash = contentHash(stableStringify({
    claims: Object.values(claims).map((claim) => [claim.claimId, claim.revision, claim.subjectId]),
    endpoints: endpoints.map((endpoint) => [endpoint.entity.id, endpoint.claimsRevision]),
  }))

  return {
    ...knowledge,
    identityContract: {
      publicSubstanceIds: '<entityType>:<canonical-slug>',
      legacyClaimJoinIds: 'ent_<type>_<hash>',
      note: 'Legacy ent_* IDs are retained only as provenance/claim-store compatibility identifiers.',
    },
    claims,
    dependencies,
    endpointIndex,
    endpoints,
    integrityHash,
  }
}
