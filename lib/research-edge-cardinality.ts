import { canonicalStudyIdentityMap, type ResearchClaim } from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'

export type ClaimEdgeCardinality = {
  url: string
  claimId: string
  approved: boolean
  rawSourceRefCount: number
  uniqueSourceRefCount: number
  validUniqueSourceRefCount: number
  canonicalStudyCount: number
  duplicateSourceRefCount: number
  aliasCollapsedSourceCount: number
  duplicateSourceRefs: string[]
  aliasCollapsed: boolean
  pseudoMultiSource: boolean
}

export type ResearchEdgeCardinality = {
  claims: ClaimEdgeCardinality[]
  duplicateEdgeClaims: ClaimEdgeCardinality[]
  aliasCollapsedClaims: ClaimEdgeCardinality[]
  pseudoMultiSourceClaims: ClaimEdgeCardinality[]
  summary: {
    claims: number
    approvedClaims: number
    duplicateEdgeClaims: number
    aliasCollapsedClaims: number
    pseudoMultiSourceClaims: number
    duplicateEdges: number
    aliasCollapsedSourceRows: number
  }
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function rawSourceRefs(claim: ResearchClaim): string[] {
  return Array.isArray(claim.sourceRefIds) ? claim.sourceRefIds.map(text).filter(Boolean) : []
}

export function analyzeResearchEdgeCardinality(analysis: ResearchQualityAnalysis): ResearchEdgeCardinality {
  const claims: ClaimEdgeCardinality[] = []

  for (const profile of analysis.profiles) {
    const record = profile.record
    const sources = Array.isArray(record.sources) ? record.sources : []
    const sourceIds = new Set(sources.map((source) => text(source.id)).filter(Boolean))
    const identities = canonicalStudyIdentityMap(record)
    const claimMap = Array.isArray(record.claimMap) ? record.claimMap : []

    for (const claim of claimMap) {
      const rawRefs = rawSourceRefs(claim)
      const uniqueRefs = [...new Set(rawRefs)]
      const validUniqueRefs = uniqueRefs.filter((ref) => sourceIds.has(ref))
      const canonicalStudyIds = [...new Set(validUniqueRefs.map((ref) => identities.get(ref)).filter((id): id is string => Boolean(id)))]
      const counts = new Map<string, number>()
      for (const ref of rawRefs) counts.set(ref, (counts.get(ref) ?? 0) + 1)
      const duplicateSourceRefs = [...counts.entries()].filter(([, count]) => count > 1).map(([ref]) => ref).sort()
      const duplicateSourceRefCount = Math.max(0, rawRefs.length - uniqueRefs.length)
      const aliasCollapsedSourceCount = Math.max(0, validUniqueRefs.length - canonicalStudyIds.length)
      const approved = text(claim.reviewStatus).toLowerCase() === 'approved'
      const aliasCollapsed = aliasCollapsedSourceCount > 0
      const pseudoMultiSource = validUniqueRefs.length >= 2 && canonicalStudyIds.length === 1

      claims.push({
        url: profile.url,
        claimId: text(claim.id) || 'unknown-claim',
        approved,
        rawSourceRefCount: rawRefs.length,
        uniqueSourceRefCount: uniqueRefs.length,
        validUniqueSourceRefCount: validUniqueRefs.length,
        canonicalStudyCount: canonicalStudyIds.length,
        duplicateSourceRefCount,
        aliasCollapsedSourceCount,
        duplicateSourceRefs,
        aliasCollapsed,
        pseudoMultiSource,
      })
    }
  }

  const duplicateEdgeClaims = claims.filter((claim) => claim.duplicateSourceRefCount > 0)
  const aliasCollapsedClaims = claims.filter((claim) => claim.aliasCollapsed)
  const pseudoMultiSourceClaims = claims.filter((claim) => claim.pseudoMultiSource)

  return {
    claims,
    duplicateEdgeClaims,
    aliasCollapsedClaims,
    pseudoMultiSourceClaims,
    summary: {
      claims: claims.length,
      approvedClaims: claims.filter((claim) => claim.approved).length,
      duplicateEdgeClaims: duplicateEdgeClaims.length,
      aliasCollapsedClaims: aliasCollapsedClaims.length,
      pseudoMultiSourceClaims: pseudoMultiSourceClaims.length,
      duplicateEdges: duplicateEdgeClaims.reduce((sum, claim) => sum + claim.duplicateSourceRefCount, 0),
      aliasCollapsedSourceRows: aliasCollapsedClaims.reduce((sum, claim) => sum + claim.aliasCollapsedSourceCount, 0),
    },
  }
}
