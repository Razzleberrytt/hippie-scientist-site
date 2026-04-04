import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

type Severity = 'structural-hard' | 'enrichment-soft'
type DatasetType = 'herb-list' | 'herb-detail' | 'compound'
type HerbFieldTier = 'HARD_REQUIRED' | 'RECOMMENDED' | 'RESEARCH_BACKLOG'

type AuditIssue = {
  severity: Severity
  code: string
  dataset: DatasetType
  recordId: string
  field?: string
  message: string
  details?: Record<string, unknown>
  tier?: HerbFieldTier
}

type SourceRecord = {
  title?: unknown
  url?: unknown
  note?: unknown
}

type GenericRecord = Record<string, unknown>

type LoadedDetailRecord = {
  filename: string
  filepath: string
  data: GenericRecord
}

type TriageEvidence = {
  recoverability?: {
    totalMissingRequired: number
    genuinelyMissing: number
    recoverable: number
  }
  completeness?: {
    topMissingByWeightedImpact: Array<{ field: string; missingCount: number; genuinelyAbsentCount: number }>
  }
}

const ROOT_DIR = process.cwd()
const DATA_DIR = path.join(ROOT_DIR, 'public', 'data')
const HERBS_PATH = path.join(DATA_DIR, 'herbs.json')
const HERB_DETAILS_DIR = path.join(DATA_DIR, 'herbs-detail')
const COMPOUNDS_PATH = path.join(DATA_DIR, 'compounds.json')
const REPORT_DIR = path.join(ROOT_DIR, 'reports')
const JSON_REPORT_PATH = path.join(REPORT_DIR, 'data-audit-report.json')
const MARKDOWN_REPORT_PATH = path.join(REPORT_DIR, 'data-audit-report.md')
const COMPLETENESS_TRIAGE_PATH = path.join(REPORT_DIR, 'herb-completeness-triage.json')
const RECOVERABILITY_TRIAGE_PATH = path.join(REPORT_DIR, 'missing-field-recoverability-triage.json')

const PLACEHOLDER_VALUES = new Set(['', 'n/a', 'na', 'null', 'none', 'unknown', 'tbd', 'todo'])
const CORRUPT_SLUG_VALUES = new Set(['nan', 'null', 'undefined', 'object-object'])

const HERB_SHARED_STRING_FIELDS = [
  'name',
  'latin',
  'class',
  'intensity',
  'mechanism',
  'description',
  'dosage',
  'duration',
  'legalStatus',
  'preparation',
  'region',
  'traditionalUse',
]

const HERB_SHARED_ARRAY_FIELDS = [
  'activeCompounds',
  'effects',
  'contraindications',
  'interactions',
  'therapeuticUses',
  'sideEffects',
]

const LEGACY_HERB_REQUIRED_FIELDS = [
  'slug',
  'name',
  'latin',
  'class',
  'description',
  'effects',
  'activeCompounds',
  'contraindications',
  'sources',
  'lastUpdated',
] as const

const HERB_FIELD_TIERS: Record<HerbFieldTier, readonly string[]> = {
  HARD_REQUIRED: ['slug', 'name', 'latin', 'description', 'effects', 'lastUpdated'],
  RECOMMENDED: ['contraindications', 'sources'],
  RESEARCH_BACKLOG: ['class', 'activeCompounds'],
}

const COMPOUND_REQUIRED_FIELDS = [
  'slug',
  'name',
  'category',
  'description',
  'effects',
  'contraindications',
  'herbs',
  'sources',
  'lastUpdated',
]

const HERB_STRING_FIELDS = new Set([
  ...HERB_SHARED_STRING_FIELDS,
  'slug',
  'safetyNotes',
  'identity',
  'categoryUseContext',
  'evidenceLevel',
  'lastUpdated',
])

const HERB_ARRAY_FIELDS = new Set([
  ...HERB_SHARED_ARRAY_FIELDS,
  'sources',
  'relatedEntities',
  'relatedCompounds',
])

const COMPOUND_STRING_FIELDS = new Set([
  'slug',
  'name',
  'category',
  'description',
  'dosage',
  'duration',
  'region',
  'preparation',
  'legalStatus',
  'lastUpdated',
])

const COMPOUND_ARRAY_FIELDS = new Set([
  'herbs',
  'effects',
  'contraindications',
  'interactions',
  'therapeuticUses',
  'activeCompounds',
  'sideEffects',
  'sources',
])

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPlaceholderString(value: string): boolean {
  const normalized = value.trim().toLowerCase()
  return PLACEHOLDER_VALUES.has(normalized)
}

function isMissingValue(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim().length === 0 || isPlaceholderString(value)
  if (Array.isArray(value)) return value.length === 0
  return false
}

function normalizeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function normalizeDisplayText(value: unknown): string {
  return String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase()
}

function normalizeArrayValue(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map(item => normalizeDisplayText(item))
    .filter(Boolean)
    .sort()
}

function getHerbListSlug(record: GenericRecord, index: number): string {
  if (typeof record.slug === 'string' && record.slug.trim()) {
    return normalizeText(record.slug)
  }
  if (typeof record.name === 'string' && record.name.trim()) {
    return normalizeText(record.name)
  }
  if (typeof record.latin === 'string' && record.latin.trim()) {
    return normalizeText(record.latin)
  }
  return `row-${index}`
}

function getRecordSlug(record: GenericRecord, fallback: string): string {
  if (typeof record.slug !== 'string') return fallback
  return normalizeText(record.slug)
}

function validateSlugValue(
  value: unknown,
  dataset: DatasetType,
  recordId: string,
  field = 'slug',
): AuditIssue[] {
  if (typeof value !== 'string') return []
  const raw = value.trim()
  if (!raw) {
    return [issue('structural-hard', 'invalid-slug', dataset, recordId, "Field 'slug' must not be empty.", { field })]
  }

  const normalized = normalizeText(raw)
  if (!normalized) {
    return [
      issue('structural-hard', 'invalid-slug', dataset, recordId, "Field 'slug' is degenerate after normalization.", {
        field,
        details: { value },
      }),
    ]
  }
  if (CORRUPT_SLUG_VALUES.has(normalized)) {
    return [
      issue(
        'structural-hard',
        'invalid-slug',
        dataset,
        recordId,
        "Field 'slug' contains a known corrupt artifact value.",
        { field, details: { value } },
      ),
    ]
  }
  if (normalized.length < 3) {
    return [
      issue(
        'structural-hard',
        'invalid-slug',
        dataset,
        recordId,
        "Field 'slug' is too short to be a stable canonical slug.",
        { field, details: { value } },
      ),
    ]
  }
  if (/[()[\]{}]/.test(raw) || /\s/.test(raw)) {
    return [
      issue(
        'structural-hard',
        'invalid-slug',
        dataset,
        recordId,
        "Field 'slug' contains disallowed brackets or whitespace.",
        { field, details: { value } },
      ),
    ]
  }
  if (!/^[a-z0-9-]+$/.test(raw)) {
    return [
      issue(
        'structural-hard',
        'invalid-slug',
        dataset,
        recordId,
        "Field 'slug' must use lowercase letters, numbers, and hyphens only.",
        { field, details: { value } },
      ),
    ]
  }
  return []
}

async function readJsonFile(filePath: string): Promise<unknown> {
  return JSON.parse(await readFile(filePath, 'utf8'))
}

async function loadTriageEvidence(): Promise<TriageEvidence> {
  const evidence: TriageEvidence = {}

  try {
    const recoverability = (await readJsonFile(RECOVERABILITY_TRIAGE_PATH)) as {
      totals?: { remainingMissingRequiredFieldCount?: number; genuinelyMissingCount?: number; recoverableCount?: number }
    }
    evidence.recoverability = {
      totalMissingRequired: recoverability.totals?.remainingMissingRequiredFieldCount ?? 0,
      genuinelyMissing: recoverability.totals?.genuinelyMissingCount ?? 0,
      recoverable: recoverability.totals?.recoverableCount ?? 0,
    }
  } catch {
    // Optional evidence file; keep report generation resilient.
  }

  try {
    const completeness = (await readJsonFile(COMPLETENESS_TRIAGE_PATH)) as {
      topMissingByWeightedImpact?: Array<{ field?: string; missingCount?: number; genuinelyAbsentMissing?: number }>
    }
    evidence.completeness = {
      topMissingByWeightedImpact: (completeness.topMissingByWeightedImpact ?? [])
        .slice(0, 5)
        .map(item => ({
          field: item.field ?? 'unknown',
          missingCount: item.missingCount ?? 0,
          genuinelyAbsentCount: item.genuinelyAbsentMissing ?? 0,
        })),
    }
  } catch {
    // Optional evidence file; keep report generation resilient.
  }

  return evidence
}

function issue(
  severity: Severity,
  code: string,
  dataset: DatasetType,
  recordId: string,
  message: string,
  extras: Partial<Pick<AuditIssue, 'field' | 'details' | 'tier'>> = {},
): AuditIssue {
  return {
    severity,
    code,
    dataset,
    recordId,
    message,
    ...extras,
  }
}

function validateTieredHerbFields(
  record: GenericRecord,
  dataset: DatasetType,
  recordId: string,
  tierFields: Record<HerbFieldTier, readonly string[]>,
): AuditIssue[] {
  return (Object.entries(tierFields) as Array<[HerbFieldTier, readonly string[]]>).flatMap(([tier, fields]) =>
    fields.flatMap(field => {
      const value = record[field]
      if (!isMissingValue(value)) return []
      const severity: Severity = tier === 'HARD_REQUIRED' ? 'structural-hard' : 'enrichment-soft'
      const codeByTier: Record<HerbFieldTier, string> = {
        HARD_REQUIRED: 'missing-hard-required-field',
        RECOMMENDED: 'missing-recommended-field',
        RESEARCH_BACKLOG: 'missing-research-backlog-field',
      }
      return [
        issue(severity, codeByTier[tier], dataset, recordId, `Missing ${tier.toLowerCase()} field '${field}'.`, {
          field,
          tier,
        }),
      ]
    }),
  )
}

function validateRequiredFields(
  record: GenericRecord,
  dataset: DatasetType,
  recordId: string,
  requiredFields: readonly string[],
): AuditIssue[] {
  return requiredFields.flatMap(field => {
    const value = record[field]
    if (!isMissingValue(value)) return []
    return [
      issue('structural-hard', 'missing-required-field', dataset, recordId, `Missing required field '${field}'.`, {
        field,
      }),
    ]
  })
}

function validateStringField(
  value: unknown,
  dataset: DatasetType,
  recordId: string,
  field: string,
  required = false,
): AuditIssue[] {
  if (value === undefined) return []
  if (value === null) {
    return [
      issue(
        'structural-hard',
        'invalid-field-type',
        dataset,
        recordId,
        `Field '${field}' must be a string, received null.`,
        {
          field,
          details: { expected: 'string', actual: 'null' },
        },
      ),
    ]
  }
  if (typeof value !== 'string') {
    return [
      issue('structural-hard', 'invalid-field-type', dataset, recordId, `Field '${field}' must be a string.`, {
        field,
        details: { expected: 'string', actual: Array.isArray(value) ? 'array' : typeof value },
      }),
    ]
  }
  if (required && isPlaceholderString(value)) {
    return [
      issue(
        'structural-hard',
        'placeholder-value',
        dataset,
        recordId,
        `Field '${field}' contains a placeholder value.`,
        {
          field,
        },
      ),
    ]
  }
  return []
}

function validateStringArrayField(
  value: unknown,
  dataset: DatasetType,
  recordId: string,
  field: string,
  required = false,
): AuditIssue[] {
  if (value === undefined) return []
  if (!Array.isArray(value)) {
    const code = field === 'effects' ? 'invalid-effects-shape' : 'invalid-field-type'
    return [
      issue('structural-hard', code, dataset, recordId, `Field '${field}' must be an array of strings.`, {
        field,
        details: { expected: 'string[]', actual: value === null ? 'null' : typeof value },
      }),
    ]
  }

  const findings: AuditIssue[] = []
  if (required && value.length === 0) {
    findings.push(
      issue('structural-hard', 'missing-required-field', dataset, recordId, `Field '${field}' must not be empty.`, {
        field,
      }),
    )
  }

  value.forEach((entry, index) => {
    if (typeof entry !== 'string') {
      findings.push(
        issue(
          'structural-hard',
          'invalid-field-type',
          dataset,
          recordId,
          `Field '${field}' entry ${index} must be a string.`,
          {
            field,
            details: { index, expected: 'string', actual: entry === null ? 'null' : typeof entry },
          },
        ),
      )
      return
    }
    if (entry.trim().length === 0 || isPlaceholderString(entry)) {
      findings.push(
        issue(
          'structural-hard',
          field === 'effects' ? 'invalid-effects-shape' : 'placeholder-value',
          dataset,
          recordId,
          `Field '${field}' entry ${index} is empty or placeholder content.`,
          { field, details: { index } },
        ),
      )
    }
  })

  return findings
}

function validateSourcesField(
  value: unknown,
  dataset: DatasetType,
  recordId: string,
  options: { required?: boolean; severity?: Severity; code?: string; tier?: HerbFieldTier } = {},
): AuditIssue[] {
  const required = options.required ?? false
  const severity = options.severity ?? 'structural-hard'
  const code = options.code ?? 'missing-required-field'
  const findings: AuditIssue[] = []
  if (value === undefined) {
    if (!required) return findings
    findings.push(
      issue(severity, code, dataset, recordId, "Field 'sources' must not be empty.", {
        field: 'sources',
        tier: options.tier,
      }),
    )
    return findings
  }
  if (!Array.isArray(value)) {
    findings.push(
      issue(
        'structural-hard',
        'invalid-field-type',
        dataset,
        recordId,
        "Field 'sources' must be an array of source objects.",
        {
          field: 'sources',
          details: { expected: 'Source[]', actual: value === null ? 'null' : typeof value },
        },
      ),
    )
    return findings
  }

  if (required && value.length === 0) {
    findings.push(
      issue(severity, code, dataset, recordId, "Field 'sources' must not be empty.", {
        field: 'sources',
        tier: options.tier,
      }),
    )
  }

  value.forEach((entry, index) => {
    if (!isObject(entry)) {
      findings.push(
        issue(
          'structural-hard',
          'invalid-field-type',
          dataset,
          recordId,
          `Source entry ${index} must be an object.`,
          {
            field: 'sources',
            details: { index, expected: 'object', actual: entry === null ? 'null' : typeof entry },
          },
        ),
      )
      return
    }

    const source = entry as SourceRecord
    if (typeof source.title !== 'string' || isMissingValue(source.title)) {
      findings.push(
        issue(severity, code, dataset, recordId, `Source entry ${index} is missing a title.`, {
          field: 'sources',
          details: { index, field: 'sources.title' },
          tier: options.tier,
        }),
      )
    }
    if (typeof source.url !== 'string' || isMissingValue(source.url)) {
      findings.push(
        issue(severity, code, dataset, recordId, `Source entry ${index} is missing a url.`, {
          field: 'sources',
          details: { index, field: 'sources.url' },
          tier: options.tier,
        }),
      )
    }
  })

  return findings
}

function collectDuplicateIssues(
  records: Array<{ dataset: DatasetType; recordId: string; key: string }>,
  code: string,
  messagePrefix: string,
): AuditIssue[] {
  const groups = new Map<string, Array<{ dataset: DatasetType; recordId: string }>>()
  for (const record of records) {
    if (!record.key) continue
    const group = groups.get(record.key) ?? []
    group.push({ dataset: record.dataset, recordId: record.recordId })
    groups.set(record.key, group)
  }

  const findings: AuditIssue[] = []
  for (const [key, group] of groups.entries()) {
    if (group.length < 2) continue
    for (const item of group) {
      findings.push(
        issue(
          'structural-hard',
          code,
          item.dataset,
          item.recordId,
          `${messagePrefix} '${key}' appears multiple times.`,
          {
            details: { duplicates: group.map(entry => entry.recordId) },
          },
        ),
      )
    }
  }
  return findings
}

function validateHerbRecordShape(
  record: GenericRecord,
  dataset: DatasetType,
  recordId: string,
): AuditIssue[] {
  const findings = validateTieredHerbFields(record, dataset, recordId, HERB_FIELD_TIERS)
  const hardRequiredSet = new Set(HERB_FIELD_TIERS.HARD_REQUIRED)
  const recommendedSet = new Set(HERB_FIELD_TIERS.RECOMMENDED)

  for (const field of HERB_STRING_FIELDS) {
    findings.push(...validateStringField(record[field], dataset, recordId, field, hardRequiredSet.has(field)))
  }
  for (const field of HERB_ARRAY_FIELDS) {
    if (field === 'sources') {
      findings.push(
        ...validateSourcesField(record[field], dataset, recordId, {
          required: recommendedSet.has(field),
          severity: 'enrichment-soft',
          code: 'missing-recommended-field',
          tier: 'RECOMMENDED',
        }),
      )
    } else {
      findings.push(...validateStringArrayField(record[field], dataset, recordId, field, hardRequiredSet.has(field)))
    }
  }

  return findings
}

function validateCompoundRecordShape(record: GenericRecord, recordId: string): AuditIssue[] {
  const findings = validateRequiredFields(record, 'compound', recordId, COMPOUND_REQUIRED_FIELDS)
  const requiredSet = new Set(COMPOUND_REQUIRED_FIELDS)

  for (const field of COMPOUND_STRING_FIELDS) {
    findings.push(...validateStringField(record[field], 'compound', recordId, field, requiredSet.has(field)))
  }
  for (const field of COMPOUND_ARRAY_FIELDS) {
    if (field === 'sources') {
      findings.push(
        ...validateSourcesField(record[field], 'compound', recordId, { required: requiredSet.has(field) }),
      )
    } else {
      findings.push(...validateStringArrayField(record[field], 'compound', recordId, field, requiredSet.has(field)))
    }
  }

  return findings
}

function validateDatasetArrayRecords(
  records: unknown[],
  dataset: DatasetType,
  sourceName: string,
): AuditIssue[] {
  const findings: AuditIssue[] = []
  records.forEach((record, index) => {
    if (isObject(record)) return
    findings.push(
      issue(
        'structural-hard',
        'invalid-record-type',
        dataset,
        `${sourceName}[${index}]`,
        'Dataset entry must be an object record.',
        {
          details: {
            expected: 'object',
            actual: record === null ? 'null' : Array.isArray(record) ? 'array' : typeof record,
          },
        },
      ),
    )
  })
  return findings
}

function compareSharedHerbFields(listRecord: GenericRecord, detailRecord: GenericRecord, slug: string): AuditIssue[] {
  const findings: AuditIssue[] = []

  for (const field of HERB_SHARED_STRING_FIELDS) {
    const listValue = normalizeDisplayText(listRecord[field])
    const detailValue = normalizeDisplayText(detailRecord[field])
    if (listValue !== detailValue) {
      findings.push(
        issue(
          'structural-hard',
          'herb-list-detail-mismatch',
          'herb-detail',
          slug,
          `Field '${field}' does not match the herb list record.`,
          { field, details: { herbList: listRecord[field], herbDetail: detailRecord[field] } },
        ),
      )
    }
  }

  for (const field of HERB_SHARED_ARRAY_FIELDS) {
    const listValue = normalizeArrayValue(listRecord[field])
    const detailValue = normalizeArrayValue(detailRecord[field])
    if (JSON.stringify(listValue) !== JSON.stringify(detailValue)) {
      findings.push(
        issue(
          'structural-hard',
          'herb-list-detail-mismatch',
          'herb-detail',
          slug,
          `Field '${field}' does not match the herb list record.`,
          { field, details: { herbList: listRecord[field], herbDetail: detailRecord[field] } },
        ),
      )
    }
  }

  return findings
}

function buildCompoundLookup(compounds: GenericRecord[]): Set<string> {
  const lookup = new Set<string>()
  compounds.forEach(record => {
    const name = typeof record.name === 'string' ? record.name : ''
    if (!name.trim()) return
    lookup.add(normalizeText(name))
    lookup.add(normalizeText(name.replace(/β/gi, 'beta').replace(/α/gi, 'alpha')))
  })
  return lookup
}

function validateActiveCompoundReferences(
  dataset: DatasetType,
  recordId: string,
  value: unknown,
  compoundLookup: Set<string>,
): AuditIssue[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((entry, index) => {
    if (typeof entry !== 'string' || !entry.trim()) return []
    const normalized = normalizeText(entry)
    if (!normalized || compoundLookup.has(normalized)) return []

    return [
      issue(
        'structural-hard',
        'unresolved-active-compound-reference',
        dataset,
        recordId,
        `Active compound reference '${entry}' does not resolve to a compound record.`,
        { field: 'activeCompounds', details: { index, value: entry } },
      ),
    ]
  })
}

function summarizeIssues(issues: AuditIssue[]) {
  const bySeverity = { 'structural-hard': 0, 'enrichment-soft': 0 }
  const byCode = new Map<string, number>()
  const byDataset = new Map<DatasetType, number>()
  const bySeverityByCode = {
    'structural-hard': new Map<string, number>(),
    'enrichment-soft': new Map<string, number>(),
  }

  for (const current of issues) {
    bySeverity[current.severity] += 1
    byCode.set(current.code, (byCode.get(current.code) ?? 0) + 1)
    byDataset.set(current.dataset, (byDataset.get(current.dataset) ?? 0) + 1)
    bySeverityByCode[current.severity].set(current.code, (bySeverityByCode[current.severity].get(current.code) ?? 0) + 1)
  }

  return {
    bySeverity,
    byCode: Array.from(byCode.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([code, count]) => ({ code, count })),
    byDataset: Array.from(byDataset.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dataset, count]) => ({ dataset, count })),
    bySeverityByCode: {
      'structural-hard': Array.from(bySeverityByCode['structural-hard'].entries())
        .sort((a, b) => b[1] - a[1])
        .map(([code, count]) => ({ code, count })),
      'enrichment-soft': Array.from(bySeverityByCode['enrichment-soft'].entries())
        .sort((a, b) => b[1] - a[1])
        .map(([code, count]) => ({ code, count })),
    },
  }
}

function summarizeHerbTierGaps(issues: AuditIssue[]) {
  const fieldsByTier: Record<HerbFieldTier, Map<string, number>> = {
    HARD_REQUIRED: new Map(),
    RECOMMENDED: new Map(),
    RESEARCH_BACKLOG: new Map(),
  }
  const totalsByTier: Record<HerbFieldTier, number> = {
    HARD_REQUIRED: 0,
    RECOMMENDED: 0,
    RESEARCH_BACKLOG: 0,
  }

  for (const current of issues) {
    if (current.dataset !== 'herb-list' && current.dataset !== 'herb-detail') continue
    if (!current.tier || !current.field) continue
    totalsByTier[current.tier] += 1
    fieldsByTier[current.tier].set(current.field, (fieldsByTier[current.tier].get(current.field) ?? 0) + 1)
  }

  return {
    totalsByTier,
    fieldsByTier: (Object.entries(fieldsByTier) as Array<[HerbFieldTier, Map<string, number>]>).map(([tier, counts]) => ({
      tier,
      fields: Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([field, count]) => ({ field, count })),
    })),
  }
}

function summarizeGateDecision(issues: AuditIssue[]) {
  const hardStructuralErrorCount = issues.filter(issueItem => issueItem.severity === 'structural-hard').length
  const recommendedGapCount = issues.filter(issueItem => issueItem.code === 'missing-recommended-field').length
  const researchBacklogGapCount = issues.filter(issueItem => issueItem.code === 'missing-research-backlog-field').length

  return {
    hardStructuralErrorCount,
    recommendedGapCount,
    researchBacklogGapCount,
    shouldFailValidate: hardStructuralErrorCount > 0,
  }
}

function toMarkdownReport(summary: {
  generatedAt: string
  files: Record<string, number>
  totals: Record<string, number>
  issueSummary: ReturnType<typeof summarizeIssues>
  tierSummary: ReturnType<typeof summarizeHerbTierGaps>
  legacyComparison: {
    previousMissingRequiredFieldCount: number
    hardRequiredGapCount: number
    reducedBy: number
  }
  triageEvidence: TriageEvidence
  issues: AuditIssue[]
}): string {
  const topIssues = summary.issues.slice(0, 40)
  const lines: string[] = [
    '# Data Audit Report',
    '',
    `- Generated: ${summary.generatedAt}`,
    `- Herb list records: ${summary.totals.herbListRecords}`,
    `- Herb detail records: ${summary.totals.herbDetailRecords}`,
    `- Compound records: ${summary.totals.compoundRecords}`,
    `- Structural-hard issues: ${summary.issueSummary.bySeverity['structural-hard']}`,
    `- Enrichment-soft issues: ${summary.issueSummary.bySeverity['enrichment-soft']}`,
    `- Herb hard-required gaps: ${summary.tierSummary.totalsByTier.HARD_REQUIRED}`,
    `- Herb recommended gaps: ${summary.tierSummary.totalsByTier.RECOMMENDED}`,
    `- Herb research-backlog gaps: ${summary.tierSummary.totalsByTier.RESEARCH_BACKLOG}`,
    '',
    '## Dataset coverage',
    '',
    `- \`public/data/herbs.json\`: ${summary.files.herbsJsonCount} records`,
    `- \`public/data/herbs-detail/*.json\`: ${summary.files.herbDetailFileCount} files`,
    `- \`public/data/compounds.json\`: ${summary.files.compoundsJsonCount} records`,
    '',
    '## Split rationale',
    '',
    '- **STRUCTURAL_HARD** issues break minimum record integrity and fail `validate:data` (identity, slug sanity, shape/type corruption, duplicates, broken references, invalid cross-record contracts).',
    '- **ENRICHMENT_SOFT** issues indicate incomplete depth/completeness and are report-only (missing recommended/backlog enrichment fields).',
    '',
    '## Issue counts by code (all)',
    '',
    ...summary.issueSummary.byCode.map(item => `- ${item.code}: ${item.count}`),
    '',
    '## STRUCTURAL_HARD breakdown by code',
    '',
    ...summary.issueSummary.bySeverityByCode['structural-hard'].map(item => `- ${item.code}: ${item.count}`),
    '',
    '## ENRICHMENT_SOFT breakdown by code',
    '',
    ...summary.issueSummary.bySeverityByCode['enrichment-soft'].map(item => `- ${item.code}: ${item.count}`),
    '',
    '## Issue counts by dataset',
    '',
    ...summary.issueSummary.byDataset.map(item => `- ${item.dataset}: ${item.count}`),
    '',
    '## Herb missing-field tiers',
    '',
    `- HARD_REQUIRED: ${summary.tierSummary.totalsByTier.HARD_REQUIRED}`,
    `- RECOMMENDED: ${summary.tierSummary.totalsByTier.RECOMMENDED}`,
    `- RESEARCH_BACKLOG: ${summary.tierSummary.totalsByTier.RESEARCH_BACKLOG}`,
    '',
    ...summary.tierSummary.fieldsByTier.flatMap(group => [
      `### ${group.tier}`,
      ...(group.fields.length > 0 ? group.fields.map(item => `- ${item.field}: ${item.count}`) : ['- No gaps.']),
      '',
    ]),
    '## Tier rationale (from completeness + recoverability triage)',
    '',
    ...(summary.triageEvidence.recoverability
      ? [
          `- Recoverability evidence snapshot: ${summary.triageEvidence.recoverability.totalMissingRequired} prior missing-required issues, with ${summary.triageEvidence.recoverability.genuinelyMissing} genuinely missing and ${summary.triageEvidence.recoverability.recoverable} recoverable.`,
        ]
      : ['- Recoverability evidence snapshot: not found (`reports/missing-field-recoverability-triage.json`).']),
    ...(summary.triageEvidence.completeness?.topMissingByWeightedImpact?.length
      ? [
          `- Completeness evidence snapshot (top weighted missing fields): ${summary.triageEvidence.completeness.topMissingByWeightedImpact
            .map(item => `${item.field} (missing ${item.missingCount}, genuinely absent ${item.genuinelyAbsentCount})`)
            .join('; ')}.`,
        ]
      : ['- Completeness evidence snapshot: not found (`reports/herb-completeness-triage.json`).']),
    "- Moved to **HARD_REQUIRED**: `slug`, `name`, `latin`, `description`, `effects`, `lastUpdated` because they anchor identity integrity, baseline end-user usefulness, and stable rendering contracts.",
    "- Moved to **RECOMMENDED**: `contraindications`, `sources` (+ `sources.title` / `sources.url` subfield checks) because these are high user-value trust/safety fields that should stay visible without failing the full dataset.",
    "- Moved to **RESEARCH_BACKLOG**: `class`, `activeCompounds` because triage shows these are predominantly genuinely absent and not reliably recoverable from internal data.",
    '- Future cleanup phases should prioritize RECOMMENDED gaps on high-traffic/core herbs first, while tracking RESEARCH_BACKLOG as explicit editorial/research debt.',
    '- `validate:data` gates only on STRUCTURAL_HARD failures. RECOMMENDED and RESEARCH_BACKLOG gaps are reported but do not fail validation.',
    '',
    '## Before/after missing-field comparison',
    '',
    `- Previous model missing-required-field count (legacy herb required set): ${summary.legacyComparison.previousMissingRequiredFieldCount}`,
    `- Current model hard-required gap count: ${summary.legacyComparison.hardRequiredGapCount}`,
    `- Reduction in hard-fail missing-field load: ${summary.legacyComparison.reducedBy}`,
    '',
    '## Sample findings',
    '',
  ]

  const structuralBroken = new Set(
    summary.issues
      .filter(finding => finding.severity === 'structural-hard')
      .map(finding => `${finding.dataset}:${finding.recordId}`),
  )
  const enrichmentThin = new Set(
    summary.issues
      .filter(finding => finding.severity === 'enrichment-soft')
      .map(finding => `${finding.dataset}:${finding.recordId}`),
  )
  const structurallyValidButThin = Array.from(enrichmentThin).filter(key => !structuralBroken.has(key))
  lines.push(
    '',
    '## Structural status snapshot',
    '',
    `- Structurally broken records (at least one STRUCTURAL_HARD issue): ${structuralBroken.size}`,
    `- Structurally valid but enrichment-thin records (ENRICHMENT_SOFT only): ${structurallyValidButThin.length}`,
    '',
  )

  if (topIssues.length === 0) {
    lines.push('- No findings.')
  } else {
    for (const finding of topIssues) {
      const fieldSuffix = finding.field ? ` (${finding.field})` : ''
      lines.push(
        `- [${finding.severity}] ${finding.dataset} ${finding.recordId}${fieldSuffix}: ${finding.message}`,
      )
    }
  }

  return `${lines.join('\n')}\n`
}

async function loadHerbDetailRecords(): Promise<LoadedDetailRecord[]> {
  const filenames = (await readdir(HERB_DETAILS_DIR)).filter(name => name.endsWith('.json')).sort()
  const records: LoadedDetailRecord[] = []

  for (const filename of filenames) {
    const filepath = path.join(HERB_DETAILS_DIR, filename)
    const data = await readJsonFile(filepath)
    records.push({
      filename,
      filepath,
      data: isObject(data) ? data : {},
    })
  }

  return records
}

async function main() {
  const failOnError = process.argv.includes('--fail-on-error')

  const herbsData = await readJsonFile(HERBS_PATH)
  const compoundsData = await readJsonFile(COMPOUNDS_PATH)
  const herbDetailRecords = await loadHerbDetailRecords()
  const triageEvidence = await loadTriageEvidence()

  if (!Array.isArray(herbsData)) {
    throw new Error(`Expected ${HERBS_PATH} to contain an array.`)
  }
  if (!Array.isArray(compoundsData)) {
    throw new Error(`Expected ${COMPOUNDS_PATH} to contain an array.`)
  }

  const issues: AuditIssue[] = []
  issues.push(...validateDatasetArrayRecords(herbsData, 'herb-list', 'herbs.json'))
  issues.push(...validateDatasetArrayRecords(compoundsData, 'compound', 'compounds.json'))

  const herbList = herbsData.filter(isObject)
  const compounds = compoundsData.filter(isObject)

  herbList.forEach((record, index) => {
    const slug = getHerbListSlug(record, index)
    issues.push(...validateSlugValue(record.slug, 'herb-list', slug))
    issues.push(...validateHerbRecordShape(record, 'herb-list', slug))
  })

  herbDetailRecords.forEach((detail, index) => {
    const detailSlug = getRecordSlug(detail.data, `detail-${index}`)
    issues.push(...validateSlugValue(detail.data.slug, 'herb-detail', detailSlug))
    issues.push(...validateHerbRecordShape(detail.data, 'herb-detail', detailSlug))

    const expectedSlug = path.basename(detail.filename, '.json')
    if (detail.data.slug !== expectedSlug) {
      issues.push(
        issue(
          'structural-hard',
          'detail-filename-slug-mismatch',
          'herb-detail',
          detailSlug,
          'Herb detail filename does not match its slug.',
          { field: 'slug', details: { filename: detail.filename, slug: detail.data.slug } },
        ),
      )
    }
  })

  compounds.forEach((record, index) => {
    const recordId = getRecordSlug(
      record,
      typeof record.name === 'string' && record.name.trim() ? record.name : `compound-${index}`,
    )
    issues.push(...validateSlugValue(record.slug, 'compound', recordId))
    issues.push(...validateCompoundRecordShape(record, recordId))
  })

  issues.push(
    ...collectDuplicateIssues(
      herbList.map((record, index) => ({
        dataset: 'herb-list' as const,
        recordId: getHerbListSlug(record, index),
        key: getHerbListSlug(record, index),
      })),
      'duplicate-slug',
      'Slug',
    ),
  )

  issues.push(
    ...collectDuplicateIssues(
      herbDetailRecords.map((detail, index) => ({
        dataset: 'herb-detail' as const,
        recordId: typeof detail.data.slug === 'string' ? detail.data.slug : `detail-${index}`,
        key: typeof detail.data.slug === 'string' ? normalizeText(detail.data.slug) : '',
      })),
      'duplicate-slug',
      'Slug',
    ),
  )

  issues.push(
    ...collectDuplicateIssues(
      herbList.map((record, index) => ({
        dataset: 'herb-list' as const,
        recordId: getHerbListSlug(record, index),
        key: typeof record.name === 'string' ? normalizeDisplayText(record.name) : '',
      })),
      'duplicate-name',
      'Name',
    ),
  )

  issues.push(
    ...collectDuplicateIssues(
      herbDetailRecords.map((detail, index) => ({
        dataset: 'herb-detail' as const,
        recordId: typeof detail.data.slug === 'string' ? detail.data.slug : `detail-${index}`,
        key: typeof detail.data.name === 'string' ? normalizeDisplayText(detail.data.name) : '',
      })),
      'duplicate-name',
      'Name',
    ),
  )

  issues.push(
    ...collectDuplicateIssues(
      compounds.map((record, index) => ({
        dataset: 'compound' as const,
        recordId: typeof record.name === 'string' && record.name.trim() ? record.name : `compound-${index}`,
        key: typeof record.name === 'string' ? normalizeDisplayText(record.name) : '',
      })),
      'duplicate-name',
      'Name',
    ),
  )

  const compoundLookup = buildCompoundLookup(compounds)

  herbList.forEach((record, index) => {
    const recordId = getHerbListSlug(record, index)
    issues.push(...validateActiveCompoundReferences('herb-list', recordId, record.activeCompounds, compoundLookup))
  })

  herbDetailRecords.forEach((detail, index) => {
    const recordId = typeof detail.data.slug === 'string' ? detail.data.slug : `detail-${index}`
    issues.push(
      ...validateActiveCompoundReferences('herb-detail', recordId, detail.data.activeCompounds, compoundLookup),
    )
  })

  const herbListBySlug = new Map<string, GenericRecord>()
  herbList.forEach((record, index) => {
    herbListBySlug.set(getHerbListSlug(record, index), record)
  })

  herbDetailRecords.forEach(detail => {
    const slug = typeof detail.data.slug === 'string' ? detail.data.slug : ''
    if (!slug) return
    const listRecord = herbListBySlug.get(slug)
    if (!listRecord) {
      issues.push(
        issue(
          'structural-hard',
          'missing-herb-list-record',
          'herb-detail',
          slug,
          'No matching herb list record was found for this herb detail record.',
        ),
      )
      return
    }
    issues.push(...compareSharedHerbFields(listRecord, detail.data, slug))
  })

  herbList.forEach((record, index) => {
    const slug = getHerbListSlug(record, index)
    const hasDetail = herbDetailRecords.some(detail => detail.data.slug === slug)
    if (!hasDetail) {
      issues.push(
        issue(
          'structural-hard',
          'missing-herb-detail-record',
          'herb-list',
          slug,
          'No matching herb detail record was found for this herb list record.',
        ),
      )
    }
  })

  const dedupedIssues = issues.filter((current, index, all) => {
    const key = JSON.stringify([
      current.severity,
      current.code,
      current.dataset,
      current.recordId,
      current.field ?? '',
      current.message,
    ])
    return all.findIndex(item =>
      JSON.stringify([
        item.severity,
        item.code,
        item.dataset,
        item.recordId,
        item.field ?? '',
        item.message,
      ]) === key,
    ) === index
  })

  const summary = {
    generatedAt: new Date().toISOString(),
    files: {
      herbsJsonCount: herbList.length,
      herbDetailFileCount: herbDetailRecords.length,
      compoundsJsonCount: compounds.length,
    },
    totals: {
      herbListRecords: herbList.length,
      herbDetailRecords: herbDetailRecords.length,
      compoundRecords: compounds.length,
    },
    issueSummary: summarizeIssues(dedupedIssues),
    tierSummary: summarizeHerbTierGaps(dedupedIssues),
    legacyComparison: {
      previousMissingRequiredFieldCount: 0,
      hardRequiredGapCount: dedupedIssues.filter(
        issueItem => issueItem.code === 'missing-hard-required-field',
      ).length,
      reducedBy: 0,
    },
    triageEvidence,
    issues: dedupedIssues,
  }
  const gateDecision = summarizeGateDecision(dedupedIssues)

  const previousMissingRequiredFieldCount = [
    ...herbList.flatMap((record, index) =>
      validateRequiredFields(record, 'herb-list', getHerbListSlug(record, index), LEGACY_HERB_REQUIRED_FIELDS),
    ),
    ...herbDetailRecords.flatMap((detail, index) =>
      validateRequiredFields(
        detail.data,
        'herb-detail',
        typeof detail.data.slug === 'string' ? detail.data.slug : `detail-${index}`,
        LEGACY_HERB_REQUIRED_FIELDS,
      ),
    ),
  ].length

  summary.legacyComparison.previousMissingRequiredFieldCount = previousMissingRequiredFieldCount
  summary.legacyComparison.reducedBy =
    previousMissingRequiredFieldCount - summary.legacyComparison.hardRequiredGapCount

  await mkdir(REPORT_DIR, { recursive: true })
  await writeFile(JSON_REPORT_PATH, `${JSON.stringify(summary, null, 2)}\n`)
  await writeFile(MARKDOWN_REPORT_PATH, toMarkdownReport(summary))

  console.log(`JSON report: ${path.relative(ROOT_DIR, JSON_REPORT_PATH)}`)
  console.log(`Markdown report: ${path.relative(ROOT_DIR, MARKDOWN_REPORT_PATH)}`)
  console.log(`STRUCTURAL_HARD issues: ${summary.issueSummary.bySeverity['structural-hard']}`)
  console.log(`ENRICHMENT_SOFT issues: ${summary.issueSummary.bySeverity['enrichment-soft']}`)
  console.log(`Hard/structural issue count: ${gateDecision.hardStructuralErrorCount}`)
  console.log(`Recommended enrichment gaps: ${gateDecision.recommendedGapCount}`)
  console.log(`Research-backlog enrichment gaps: ${gateDecision.researchBacklogGapCount}`)
  console.log(
    `validate:data gate decision: ${
      gateDecision.shouldFailValidate
        ? 'FAIL (hard/structural validator failures detected)'
        : 'PASS (no hard/structural validator failures)'
    }`,
  )

  if (failOnError && gateDecision.shouldFailValidate) {
    process.exitCode = 1
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
