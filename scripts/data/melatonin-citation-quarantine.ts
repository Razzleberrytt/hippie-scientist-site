/**
 * Negative citation-identity quarantine for one documented contaminated profile.
 * These PMIDs are unrelated to melatonin: spondyloarthropathy fatigue,
 * maxillofacial wound ballistics, and trypanosomatid oxidase. This is not a
 * global PMID blacklist or a medical-efficacy adjudication.
 *
 * Keep the hold until a source-level, outcome-specific editorial review
 * is independently approved. A data rebuild must not restore these records.
 */
export const MELATONIN_MISATTRIBUTED_PMIDS = new Set(['20091037', '25128263', '12467979'])
export const MELATONIN_IDENTITY_HOLD = 'melatonin-source-identity-quarantine'
export const MELATONIN_UNASSESSED_TIER = 'Evidence strength awaiting source-identity review'
export const MELATONIN_UNASSESSED_RATIONALE = 'Source relevance and study independence are under review. Automated publication counts do not establish an overall clinical grade or consistency across different sleep outcomes.'

type RecordRow = Record<string, unknown>

export function isMelatoninCitationHold(slug: string): boolean {
  return slug === 'melatonin'
}

export function isMisattributedMelatoninCitation(row: RecordRow, slug: string): boolean {
  if (!isMelatoninCitationHold(slug)) return false
  const direct = String(row.pmid ?? row.pubmedId ?? '').trim()
  if (MELATONIN_MISATTRIBUTED_PMIDS.has(direct)) return true
  const url = String(row.source_url ?? row.url ?? '')
  const match = url.match(/(?:pubmed\.ncbi\.nlm\.nih\.gov\/|ncbi\.nlm\.nih\.gov\/pubmed\/)(\d{5,10})/i)
  return match ? MELATONIN_MISATTRIBUTED_PMIDS.has(match[1]) : false
}

/** Drop *only* the independently identified bad citations and their orphaned
 * profile claim edges; leave legitimate melatonin trials, reviews and
 * pediatric ingestion safety reports untouched.
 */
export function quarantineMelatoninDetail<T extends RecordRow>(detail: T): T {
  if (!isMelatoninCitationHold(String(detail.slug ?? ''))) return detail
  const sourceRows = Array.isArray(detail.sources) ? detail.sources as RecordRow[] : null
  if (!sourceRows) return detail
  const rejectedIds = new Set(sourceRows
    .filter(row => isMisattributedMelatoninCitation(row, 'melatonin'))
    .map(row => String(row.id ?? '')))
  const sources = sourceRows.filter(row => !isMisattributedMelatoninCitation(row, 'melatonin'))
  const claims = Array.isArray(detail.claimMap)
    ? (detail.claimMap as RecordRow[]).flatMap(row => {
        if (!Array.isArray(row.sourceRefIds)) return [row]
        const refs = (row.sourceRefIds as unknown[]).filter(id => !rejectedIds.has(String(id)))
        return refs.length ? [{ ...row, sourceRefIds: refs }] : []
      })
    : null
  const evidence = detail.evidence && typeof detail.evidence === 'object' && !Array.isArray(detail.evidence)
    ? detail.evidence as RecordRow : null
  const cleanedEvidence = evidence ? {
    ...evidence,
    sourceIds: Array.isArray(evidence.sourceIds)
      ? (evidence.sourceIds as unknown[]).filter(id => !rejectedIds.has(String(id)))
      : evidence.sourceIds,
    sourceCount: Array.isArray(evidence.sourceIds)
      ? (evidence.sourceIds as unknown[]).filter(id => !rejectedIds.has(String(id))).length
      : evidence.sourceCount,
    ...(claims ? { claimIds: claims.map(row => row.id), claimCount: claims.length } : {}),
  } : null
  return {
    ...detail,
    sources,
    ...(claims ? { claimMap: claims } : {}),
    ...(cleanedEvidence ? { evidence: cleanedEvidence } : {}),
  } as T
}
