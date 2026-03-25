import type { InteractionCatalogItem } from '@/components/interactions/InteractionSearch'
import type { InteractionReport } from '@/types/interactions'

const SHARE_PARAM = 'r'
export const SAVED_REPORTS_KEY = 'hs_interaction_reports'
const MAX_SAVED_REPORTS = 10

export type SavedInteractionReport = {
  id: number
  items: string[]
  createdAt: string
}

type SharedStackState = {
  items: string[]
  intent?: string
  name?: string
}

function encodeBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function decodeBase64Url(value: string): string | null {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  try {
    return atob(padded)
  } catch {
    return null
  }
}

function toShareToken(item: InteractionCatalogItem, catalog: InteractionCatalogItem[]): string {
  const slug = item.id.split(':')[1] || item.id
  const collisions = catalog.filter(entry => entry.id.endsWith(`:${slug}`))
  return collisions.length > 1 ? item.id : slug
}

export function buildShareItemsValue(
  selectedItems: InteractionCatalogItem[],
  catalog: InteractionCatalogItem[]
): string {
  const raw = selectedItems.map(item => toShareToken(item, catalog)).join(',')
  return raw ? encodeBase64Url(raw) : ''
}

export function buildShareUrl(
  selectedItems: InteractionCatalogItem[],
  catalog: InteractionCatalogItem[]
): string {
  const queryValue = buildShareItemsValue(selectedItems, catalog)
  const base = `${window.location.origin}${window.location.pathname}${window.location.hash.split('?')[0]}`
  if (!queryValue) return base
  return `${base}?${SHARE_PARAM}=${queryValue}`
}

export function parseItemsFromSearch(search: string, catalog: InteractionCatalogItem[]) {
  const params = new URLSearchParams(search)
  const compact = params.get(SHARE_PARAM)
  const legacy = params.get('items')
  const raw = compact ? decodeBase64Url(compact) : legacy
  if (!raw) return { items: [] as InteractionCatalogItem[], invalidTokens: [] as string[] }

  const tokens = raw
    .split(',')
    .map(token => token.trim())
    .filter(Boolean)

  const items: InteractionCatalogItem[] = []
  const invalidTokens: string[] = []

  tokens.slice(0, 3).forEach(token => {
    const normalizedToken = token.toLowerCase()
    const exactIdMatch = catalog.find(entry => entry.id.toLowerCase() === normalizedToken)
    if (exactIdMatch) {
      if (!items.some(item => item.id === exactIdMatch.id)) items.push(exactIdMatch)
      return
    }

    const slugMatches = catalog.filter(entry =>
      entry.id.toLowerCase().endsWith(`:${normalizedToken}`)
    )
    if (slugMatches.length === 1) {
      if (!items.some(item => item.id === slugMatches[0].id)) items.push(slugMatches[0])
      return
    }

    invalidTokens.push(token)
  })

  return { items, invalidTokens }
}

export function buildStackShareToken(state: SharedStackState): string {
  const payload = {
    i: state.items.slice(0, 3),
    t: state.intent?.trim() || '',
    n: state.name?.trim().slice(0, 64) || '',
  }
  return encodeBase64Url(JSON.stringify(payload))
}

export function parseStackShareToken(token: string | null): SharedStackState | null {
  if (!token) return null
  const decoded = decodeBase64Url(token)
  if (!decoded) return null
  try {
    const parsed = JSON.parse(decoded) as { i?: unknown; t?: unknown; n?: unknown }
    if (!Array.isArray(parsed.i)) return null
    return {
      items: parsed.i
        .map(item => String(item).trim())
        .filter(Boolean)
        .slice(0, 3),
      intent: typeof parsed.t === 'string' ? parsed.t.trim() : undefined,
      name: typeof parsed.n === 'string' ? parsed.n.trim() : undefined,
    }
  } catch {
    return null
  }
}

function safeParseSavedReports(raw: string | null): SavedInteractionReport[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (entry): entry is SavedInteractionReport =>
        Boolean(entry) &&
        typeof entry.id === 'number' &&
        Array.isArray(entry.items) &&
        typeof entry.createdAt === 'string'
    )
  } catch {
    return []
  }
}

export function getSavedReports(): SavedInteractionReport[] {
  return safeParseSavedReports(window.localStorage.getItem(SAVED_REPORTS_KEY)).sort(
    (a, b) => b.id - a.id
  )
}

export function saveReport(items: InteractionCatalogItem[]): SavedInteractionReport[] {
  const next: SavedInteractionReport = {
    id: Date.now(),
    items: items.map(item => item.id),
    createdAt: new Date().toISOString(),
  }

  const existing = getSavedReports()
  const deduped = existing.filter(
    entry =>
      entry.items.length !== next.items.length ||
      entry.items.some((item, index) => item !== next.items[index])
  )
  const updated = [next, ...deduped].slice(0, MAX_SAVED_REPORTS)
  window.localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(updated))
  return updated
}

export function buildShareCardText(report: InteractionReport): string {
  const topFinding = report.findings.find(finding => finding.title !== 'Sparse data warning')
  const whyThisMatters =
    topFinding?.explanation?.trim() || topFinding?.summary?.trim() || report.summary.trim()

  return [
    report.items.join(' + '),
    '',
    `Verdict: ${
      report.overallSeverity === 'high'
        ? 'Potentially risky combination'
        : report.overallSeverity === 'moderate'
          ? 'Use caution'
          : 'Low risk combination'
    }`,
    `Confidence: ${report.overallConfidence[0].toUpperCase()}${report.overallConfidence.slice(1)}`,
    `Signals: ${report.findings.filter(finding => finding.title !== 'Sparse data warning').length}`,
    '',
    'Why this matters:',
    whyThisMatters,
    '',
    'Run your own combination → thehippiescientist.net',
  ].join('\n')
}

export function buildReportSummary(report: InteractionReport): string {
  const itemLine = report.items.join(' + ')
  const keySignalLines = report.keySignals.length
    ? report.keySignals.map(signal => `- ${signal}`)
    : ['- No key interaction signals were generated.']
  const summaryLines = report.findings.length
    ? report.findings.map(finding => {
        const confidenceDetail =
          finding.basis === 'structured'
            ? 'structured data'
            : finding.basis === 'mixed'
              ? 'structured + inferred signals'
              : 'inferred signals'
        const watchFor = finding.whatToWatchFor?.[0]
          ? ` Watch for: ${finding.whatToWatchFor[0]}`
          : ''
        const saferOption = finding.saferAlternatives?.[0]
          ? ` Safer alternative: ${finding.saferAlternatives[0]}`
          : ''
        return `- ${finding.title}: ${finding.summary} ${finding.explanation} What this means: ${finding.whatThisMeans}.${watchFor}${saferOption} (Severity: ${finding.severity}; Confidence: ${finding.confidence} [${finding.confidenceScore}/100] - ${confidenceDetail})`
      })
    : ['- No strong structured interaction signals were detected in the current dataset.']

  return [
    itemLine,
    '',
    'Summary:',
    report.summary,
    '',
    'Key interaction signals:',
    ...keySignalLines,
    '',
    'Detailed signals:',
    ...summaryLines,
    '',
    `Overall severity: ${report.overallSeverity}`,
    `Overall confidence: ${report.overallConfidence} (${report.overallConfidenceScore}/100)`,
    '',
    'Note:',
    'This tool is for harm reduction and educational purposes only.',
  ].join('\n')
}
