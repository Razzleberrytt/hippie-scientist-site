import { contentHash, entityId, stableStringify } from './canonical/ids.mjs'

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (value == null || value === '') return []
  return [value]
}

function canonicalGrade(value) {
  const text = clean(value).toUpperCase()
  if (/^A(?:\b|[+-])/.test(text)) return 'A'
  if (/^B(?:\b|[+-])/.test(text)) return 'B'
  if (/^C(?:\b|[+-])/.test(text)) return 'C'
  if (/^D(?:\b|[+-])/.test(text)) return 'D'
  if (/AVOID|INSUFFICIENT/.test(text)) return 'Avoid/Insufficient'
  return ''
}

function normalizeDirection(value) {
  const text = clean(value).toLowerCase()
  if (!text) return 'unknown'
  if (/^(\+|positive|benefit|beneficial|supports?|improved?|increase(?:d)?|reduced?|decrease(?:d)?)\b/.test(text)) return 'supporting'
  if (/^(\-|negative|contradict|no benefit|no effect|null|worse|harm)\b/.test(text)) return 'contradicting'
  if (/\b(mixed|inconsistent|equivocal|heterogeneous|conflict)\b/.test(text)) return 'mixed'
  return 'unknown'
}

function sourceIdentifier(source) {
  const pmid = clean(source?.pmid).replace(/^PMID:\s*/i, '')
  const doi = clean(source?.doi).replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '')
  if (pmid) return { type: 'pmid', value: pmid }
  if (doi) return { type: 'doi', value: doi }
  const url = clean(source?.url)
  if (url) return { type: 'url', value: url }
  return null
}

function sourceForPublic(source) {
  if (!source) return null
  const identifier = sourceIdentifier(source)
  return {
    id: clean(source.id),
    identifier,
    title: clean(source.title),
    authors: clean(source.author_or_label || source.authors),
    journal: clean(source.journal),
    year: source.year ?? null,
    url: clean(source.url),
    reviewStatus: clean(source.review_status),
    metadataComplete: Boolean(clean(source.title) && (clean(source.pmid) || clean(source.doi) || clean(source.url))),
  }
}

function publicRoute(kind, slug) {
  return `/${kind === 'herb' ? 'herbs' : 'compounds'}/${slug}/`
}

function profileEntity(record, kind) {
  const slug = clean(record?.slug)
  if (!slug) return null
  const id = entityId(kind, slug)
  return {
    id,
    slug,
    kind,
    name: clean(record?.displayName || record?.name || record?.compoundName || slug),
    route: publicRoute(kind, slug),
    evidenceGrade: canonicalGrade(record?.evidence_grade || record?.evidenceGrade || record?.evidence_tier),
    safetyFlags: asArray(record?.safety_flags || record?.safetyFlags || record?.contraindications).map(clean).filter(Boolean),
    profileReviewStatus: clean(record?.review_status || record?.profile_status),
    profileReviewedAt: clean(record?.last_evidence_search_date || record?.lastReviewedAt || record?.last_reviewed_at) || null,
  }
}

function objectDescriptor(claim) {
  if (claim?.object_id) return { type: 'entity', id: clean(claim.object_id) }
  if (claim?.object_literal !== undefined) return { type: 'literal', value: claim.object_literal }
  return null
}

function lastReviewedAt(claim) {
  const explicit = clean(claim?.last_reviewed_at || claim?.qualifiers?.last_reviewed_at || claim?.qualifiers?.reviewed_at)
  if (explicit) return explicit
  // An ordinary updated_at is not automatically an editorial review. Only use
  // it as review time when the canonical claim is explicitly approved.
  if (clean(claim?.review_status).toLowerCase() === 'approved') return clean(claim?.updated_at) || null
  return null
}

function publicStatement(claim) {
  // Do not expose migration/editorial notes as public claim copy. A public
  // statement must be explicitly curated into the claim qualifiers.
  return clean(claim?.qualifiers?.public_statement || claim?.qualifiers?.publicStatement || claim?.qualifiers?.claim_text)
}

function claimRevision(claim) {
  return contentHash({
    id: claim?.id,
    subject_id: claim?.subject_id,
    predicate: claim?.predicate,
    object_id: claim?.object_id,
    object_literal: claim?.object_literal,
    qualifiers: claim?.qualifiers,
    source_ids: claim?.source_ids,
    evidence_level: claim?.evidence_level,
    confidence: claim?.confidence,
    review_status: claim?.review_status,
    updated_at: claim?.updated_at,
  }).slice(0, 16)
}

function evidenceBucket(claim) {
  const direction = normalizeDirection(claim?.qualifiers?.direction)
  if (direction !== 'unknown') return direction
  return 'context'
}

function buildClaimObject(claim, profile, sourceIndex) {
  const bucket = evidenceBucket(claim)
  const sourceIds = [...new Set(asArray(claim?.source_ids).map(clean).filter(Boolean))]
  const sources = sourceIds.map((id) => sourceIndex.get(id)).filter(Boolean).map(sourceForPublic).filter(Boolean)
  const supportingSourceIds = bucket === 'supporting' ? sourceIds : []
  const contradictingSourceIds = bucket === 'contradicting' ? sourceIds : []
  const mixedSourceIds = bucket === 'mixed' ? sourceIds : []
  const contextSourceIds = bucket === 'context' ? sourceIds : []
  const reviewedAt = lastReviewedAt(claim)
  const statement = publicStatement(claim)

  return {
    claimId: clean(claim?.id),
    revision: claimRevision(claim),
    subjectId: clean(claim?.subject_id),
    predicate: clean(claim?.predicate),
    object: objectDescriptor(claim),
    publicStatement: statement || null,
    claimEvidenceClass: clean(claim?.evidence_level) || 'none',
    evidenceGrade: profile.evidenceGrade || null,
    evidenceGradeScope: profile.evidenceGrade ? 'subject_profile' : null,
    confidence: typeof claim?.confidence === 'number' ? claim.confidence : null,
    direction: normalizeDirection(claim?.qualifiers?.direction),
    supportingSourceIds,
    contradictingSourceIds,
    mixedSourceIds,
    contextSourceIds,
    citationIds: sourceIds,
    citations: sources,
    reviewStatus: clean(claim?.review_status) || 'pending',
    lastReviewedAt: reviewedAt,
    affectedPages: [profile.route],
    studyId: clean(claim?.qualifiers?.study_id) || null,
    updatedAt: clean(claim?.updated_at) || null,
  }
}

function driftFingerprint(claimObject) {
  return contentHash({
    predicate: claimObject.predicate,
    object: claimObject.object,
    publicStatement: claimObject.publicStatement,
    claimEvidenceClass: claimObject.claimEvidenceClass,
    evidenceGrade: claimObject.evidenceGrade,
    direction: claimObject.direction,
    citationIds: claimObject.citationIds,
  }).slice(0, 16)
}

export function buildClaimKnowledgeBase({ herbs = [], compounds = [], claims = [], sources = [] } = {}) {
  const profiles = new Map()
  for (const record of herbs) {
    const profile = profileEntity(record, 'herb')
    if (profile) profiles.set(profile.id, profile)
  }
  for (const record of compounds) {
    const profile = profileEntity(record, 'compound')
    if (profile) profiles.set(profile.id, profile)
  }

  const sourceIndex = new Map(sources.map((source) => [clean(source?.id), source]).filter(([id]) => id))
  const claimsById = new Map()
  const claimsByEntity = new Map()
  const dependencies = {}
  const orphanClaims = []

  for (const claim of claims) {
    const claimId = clean(claim?.id)
    const subjectId = clean(claim?.subject_id)
    if (!claimId || !subjectId) continue
    const profile = profiles.get(subjectId)
    if (!profile) {
      orphanClaims.push({ claimId, subjectId, reason: 'subject is not a public herb/compound profile in the current runtime index' })
      continue
    }

    const claimObject = buildClaimObject(claim, profile, sourceIndex)
    claimObject.driftFingerprint = driftFingerprint(claimObject)
    claimsById.set(claimId, claimObject)
    claimsByEntity.set(subjectId, [...(claimsByEntity.get(subjectId) || []), claimObject])
    dependencies[claimId] = {
      revision: claimObject.revision,
      affectedPages: claimObject.affectedPages,
      subjectId,
    }
  }

  const endpoints = []
  for (const profile of profiles.values()) {
    const entityClaims = (claimsByEntity.get(profile.id) || []).sort((a, b) => a.claimId.localeCompare(b.claimId))
    const sourceIds = [...new Set(entityClaims.flatMap((claim) => claim.citationIds))]
    const sourceRows = sourceIds.map((id) => sourceIndex.get(id)).filter(Boolean).map(sourceForPublic).filter(Boolean)
    const claimsRevision = contentHash(entityClaims.map((claim) => [claim.claimId, claim.revision])).slice(0, 16)
    const lastReviewedDates = entityClaims.map((claim) => claim.lastReviewedAt).filter(Boolean).sort()

    endpoints.push({
      schemaVersion: 1,
      entity: {
        id: profile.id,
        type: profile.kind,
        slug: profile.slug,
        name: profile.name,
        canonicalPage: profile.route,
      },
      evidence: {
        profileGrade: profile.evidenceGrade || null,
        profileReviewStatus: profile.profileReviewStatus || null,
        profileReviewedAt: profile.profileReviewedAt,
        latestClaimReviewAt: lastReviewedDates.at(-1) || null,
      },
      safetyFlags: profile.safetyFlags,
      claimsRevision,
      claims: entityClaims,
      citations: sourceRows,
      attribution: {
        name: 'The Hippie Scientist',
        canonicalPage: profile.route,
        note: 'Attribute derived summaries to The Hippie Scientist and retain original PMID/DOI identifiers when citing underlying studies.',
      },
    })
  }

  const endpointIndex = Object.fromEntries(endpoints.map((endpoint) => [endpoint.entity.id, `/data/ingredients/${endpoint.entity.slug}.json`]))

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    summary: {
      profiles: profiles.size,
      claims: claimsById.size,
      orphanClaims: orphanClaims.length,
      sourceRecords: sourceIndex.size,
      endpoints: endpoints.length,
    },
    claims: Object.fromEntries([...claimsById.entries()].sort(([a], [b]) => a.localeCompare(b))),
    dependencies,
    endpointIndex,
    endpoints,
    diagnostics: {
      orphanClaims,
    },
    integrityHash: contentHash(stableStringify({
      claims: [...claimsById.values()].map((claim) => [claim.claimId, claim.revision]),
      endpoints: endpoints.map((endpoint) => [endpoint.entity.id, endpoint.claimsRevision]),
    })),
  }
}
