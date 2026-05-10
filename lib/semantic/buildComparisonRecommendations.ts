type RuntimeRecord = Record<string, any>

function asList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v ?? '').trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
  }

  return []
}

function unique(values: string[]) {
  return [...new Set(values)]
}

function buildSignals(record: RuntimeRecord) {
  return unique([
    ...asList(record?.primary_effects),
    ...asList(record?.mechanisms),
    ...asList(record?.pathways),
  ])
}

export function buildComparisonRecommendations(record: RuntimeRecord) {
  const signals = buildSignals(record)

  return signals.slice(0, 6).map((signal) => ({
    href: `/compare/${record?.slug}-vs-${signal
      .toLowerCase()
      .replace(/\s+/g, '-')}`,
    title: `${record?.name || record?.slug} vs ${signal}`,
    rationale: `Semantic comparison generated through overlap in ${signal}.`,
    overlap: [signal],
  }))
}
