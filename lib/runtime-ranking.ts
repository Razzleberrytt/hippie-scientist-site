export function scoreEvidence(value: unknown) {
  const text = String(value || '').toLowerCase()

  if (/clinical|human|strong|high/.test(text)) return 5
  if (/moderate|mixed/.test(text)) return 3
  if (/limited|early|weak/.test(text)) return 1

  return 0
}

export function scoreProfileQuality(value: unknown) {
  const text = String(value || '').toLowerCase()

  if (/complete|strong|ready|high/.test(text)) return 5
  if (/partial|moderate/.test(text)) return 3
  if (/minimal|weak/.test(text)) return 1

  return 0
}

export function scoreSignalDensity(record: any) {
  const effects = Array.isArray(record?.primary_effects)
    ? record.primary_effects.length
    : 0

  const mechanisms = Array.isArray(record?.mechanisms)
    ? record.mechanisms.length
    : 0

  return effects + mechanisms
}

export function scoreRuntimeRecord(record: any) {
  return (
    scoreEvidence(
      record?.evidence_tier ||
      record?.evidence_grade ||
      record?.evidenceLevel
    ) +
    scoreProfileQuality(
      record?.profile_status ||
      record?.summary_quality ||
      record?.safety?.confidence
    ) +
    scoreSignalDensity(record)
  )
}

export function rankRuntimeRecords<T = any>(records: T[]): T[] {
  return [...records].sort(
    (a: any, b: any) => scoreRuntimeRecord(b) - scoreRuntimeRecord(a)
  )
}
