type EvidenceTier = 'strong' | 'moderate' | 'limited' | 'preliminary' | 'traditional' | 'mixed' | 'insufficient' | 'review'

type EvidenceColor = 'emerald' | 'blue' | 'amber' | 'sand' | 'violet' | 'slate'

function readPath(record: any, path: string[]): unknown {
  return path.reduce(
    (value, key) => (value && typeof value === 'object' ? (value as any)[key] : undefined),
    record,
  )
}

function text(value: unknown): string {
  if (value == null) return ''
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(' ')
  if (typeof value === 'object')
    return Object.values(value as Record<string, unknown>)
      .map(text)
      .filter(Boolean)
      .join(' ')
  return String(value).trim()
}

function list(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string')
    return value
      .split(/[|;,]/)
      .map(item => item.trim())
      .filter(Boolean)
  return value ? [value] : []
}

function evidenceText(record: any): string {
  return [
    readPath(record, ['safety', 'confidence']),
    readPath(record, ['safety', 'evidenceTier']),
    record?.evidenceTier,
    record?.evidence_tier,
    record?.evidence_grade,
    record?.evidenceLevel,
    record?.confidenceTier,
    record?.profile_status,
    record?.review_status,
    record?.summary_quality,
    record?.source_status,
  ]
    .map(text)
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function hasHumanEvidence(record: any): boolean {
  const evidence = evidenceText(record)

  if (/\b(no|none|theoretical|traditional|preclinical|in\s*vitro|animal)\b/.test(evidence)) {
    return false
  }

  if (
    /\b(human|clinical|trial|rct|randomi[sz]ed|meta|systematic|strong|high|moderate|grade\s*[ab]|tier\s*[ab])\b/.test(
      evidence,
    )
  ) {
    return true
  }

  const sourceCount = Number(record?.sourceCount ?? record?.source_count ?? record?.sources_count)
  return (
    Number.isFinite(sourceCount) && sourceCount >= 5 && !/\b(low|limited|partial)\b/.test(evidence)
  )
}

export function hasMechanismEvidence(record: any): boolean {
  return [record?.mechanisms, record?.primary_effects, record?.effects, record?.pathways].some(
    value => list(value).map(text).some(Boolean),
  )
}

export function isPreliminaryResearch(record: any): boolean {
  const evidence = evidenceText(record)

  return /\b(preliminary|emerging|limited|low|weak|partial|draft|none|preclinical|animal|in\s*vitro|theoretical|grade\s*[cd]|tier\s*[cd])\b/.test(
    evidence,
  )
}

export function getEvidenceTier(record: any): EvidenceTier {
  const evidence = evidenceText(record)

  if (/\b(needs? review|unknown|tbd|draft|placeholder|profile pending)\b/.test(evidence)) return 'review'
  if (/\b(none|no evidence|insufficient|minimal|not established)\b/.test(evidence)) return 'insufficient'
  if (/\b(mixed|conflict|inconsistent|equivocal)\b/.test(evidence)) return 'mixed'
  if (/\b(strong|high|robust|grade\s*a|tier\s*a)\b/.test(evidence)) return 'strong'
  if (/\b(moderate|medium|grade\s*b|tier\s*b)\b/.test(evidence)) return 'moderate'
  if (/\b(traditional|ethnobotanical|historical)\b/.test(evidence)) return 'traditional'
  if (/\b(emerging|early)\b/.test(evidence)) return 'preliminary'
  if (isPreliminaryResearch(record)) return 'preliminary'
  if (hasHumanEvidence(record)) return 'moderate'
  if (hasMechanismEvidence(record)) return 'limited'

  return 'limited'
}

export function getEvidenceLabel(record: any): string {
  const labels: Record<EvidenceTier, string> = {
    strong: 'Strong evidence',
    moderate: 'Moderate evidence',
    limited: 'Limited evidence',
    preliminary: 'Preliminary evidence',
    traditional: 'Traditional use',
    mixed: 'Mixed evidence',
    insufficient: 'Insufficient evidence',
    review: 'Needs review',
  }

  return labels[getEvidenceTier(record)]
}

export function getEvidenceColor(record: any): EvidenceColor {
  const colors: Record<EvidenceTier, EvidenceColor> = {
    strong: 'emerald',
    moderate: 'blue',
    limited: 'slate',
    preliminary: 'amber',
    traditional: 'sand',
    mixed: 'violet',
    insufficient: 'slate',
    review: 'slate',
  }

  return colors[getEvidenceTier(record)]
}

export function hasStrongSafetyProfile(record: any): boolean {
  const safety = [
    record?.safety,
    record?.safetyNotes,
    record?.safety_notes,
    record?.contraindications,
    record?.interactions,
  ]
    .map(text)
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  const confidence = text(
    readPath(record, ['safety', 'confidence']) || record?.confidenceTier,
  ).toLowerCase()

  if (
    /\b(avoid|contraindicat|caution|interaction|pregnan|liver|kidney|risk|toxic)\b/.test(safety)
  ) {
    return false
  }

  return /\b(strong|high|safe|well\s*tolerated|low\s*risk)\b/.test(`${safety} ${confidence}`)
}
