export function runDedupeAgent(rows) {
  const seen = new Map()

  for (const row of rows) {
    const key = row?.pmid_or_source || JSON.stringify(row)

    if (!seen.has(key)) {
      seen.set(key, row)
    }
  }

  return Array.from(seen.values())
}
