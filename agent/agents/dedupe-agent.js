export function runDedupeAgent(rows = []) {
  const seen = new Map()

  for (const row of rows) {
    const sourceKey = String(row?.pmid_or_source || '').trim()

    const key = sourceKey || JSON.stringify({
      compound_slug: row?.compound_slug,
      effect_target: row?.effect_target,
      study_type: row?.study_type,
      population: row?.population,
    })

    const existing = seen.get(key)

    if (!existing) {
      seen.set(key, row)
      continue
    }

    const existingHasSource = Boolean(existing?.pmid_or_source)
    const currentHasSource = Boolean(row?.pmid_or_source)

    if (!existingHasSource && currentHasSource) {
      seen.set(key, row)
    }
  }

  return Array.from(seen.values())
}
