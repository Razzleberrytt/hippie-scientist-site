export function citationDensity(rows = [], claims = []) {
  const uniqueSources = new Set(
    rows
      .map(row => row.pmid_or_source)
      .filter(Boolean)
  )

  const density = claims.length
    ? uniqueSources.size / claims.length
    : uniqueSources.size

  return {
    citation_density: Number(density.toFixed(2)),
    source_count: uniqueSources.size,
    claim_count: claims.length,
  }
}
