function scoreOf(item) {
  const score = Number(item?.roi?.score ?? 0)
  return Number.isFinite(score) ? score : 0
}

function workpackIdOf(item) {
  return typeof item?.workpackId === 'string' ? item.workpackId : ''
}

function orderedUnique(ranked = []) {
  if (!Array.isArray(ranked)) return []
  const ordered = ranked
    .map((item, index) => ({ item, index }))
    .sort((a, b) => scoreOf(b.item) - scoreOf(a.item)
      || workpackIdOf(a.item).localeCompare(workpackIdOf(b.item))
      || a.index - b.index)

  const seen = new Set()
  const unique = []
  for (const { item, index } of ordered) {
    const id = workpackIdOf(item)
    const key = id || `__missing_workpack_id_${index}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(item)
  }
  return unique
}

function boundedPercent(value, fallback) {
  const numeric = Number(value ?? fallback)
  if (!Number.isFinite(numeric)) return fallback
  return Math.max(0, Math.min(100, numeric))
}

export function portfolioSelect(
  ranked = [],
  limit = 0,
  policy = {},
  { citationEnabled = true } = {},
) {
  const ordered = orderedUnique(ranked)
  const numericLimit = Number(limit)
  const effectiveLimit = Number.isFinite(numericLimit) ? Math.floor(numericLimit) : 0

  if (effectiveLimit <= 0) return ordered
  if (!citationEnabled) return ordered.slice(0, effectiveLimit)
  if (ordered.length <= effectiveLimit) return ordered

  const citationTargetPct = boundedPercent(policy.citationAdjacentTargetPct, 65)
  const explorationFloorPct = boundedPercent(policy.explorationFloorPct, 35)
  const cited = ordered.filter(item => Number(item.aiCitationPriority ?? 0) > 0)
  const exploration = ordered.filter(item => Number(item.aiCitationPriority ?? 0) <= 0)

  const minExploration = Math.min(
    exploration.length,
    Math.ceil(effectiveLimit * explorationFloorPct / 100),
  )
  const maxCitationByTarget = Math.floor(effectiveLimit * citationTargetPct / 100)
  const citationCount = Math.min(
    cited.length,
    Math.max(0, Math.min(maxCitationByTarget, effectiveLimit - minExploration)),
  )

  const selected = [
    ...cited.slice(0, citationCount),
    ...exploration.slice(0, minExploration),
  ]
  const selectedIds = new Set(selected.map(item => workpackIdOf(item)).filter(Boolean))

  for (const item of ordered) {
    if (selected.length >= effectiveLimit) break
    const id = workpackIdOf(item)
    if (id && selectedIds.has(id)) continue
    selected.push(item)
    if (id) selectedIds.add(id)
  }

  return orderedUnique(selected).slice(0, effectiveLimit)
}
