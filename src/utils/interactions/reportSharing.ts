import type { InteractionCatalogItem } from '@/components/interactions/InteractionSearch'
import type { InteractionReport } from '@/types/interactions'

const SHARE_PARAM = 'items'
export const SAVED_REPORTS_KEY = 'hs_interaction_reports'
const MAX_SAVED_REPORTS = 10

export type SavedInteractionReport = {
  id: number
  items: string[]
  createdAt: string
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
  return selectedItems
    .map(item => toShareToken(item, catalog))
    .map(token => encodeURIComponent(token))
    .join(',')
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
  const raw = params.get(SHARE_PARAM)
  if (!raw) return { items: [] as InteractionCatalogItem[], invalidTokens: [] as string[] }

  const tokens = raw
    .split(',')
    .map(token => decodeURIComponent(token).trim())
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
        return `- ${finding.title}: ${finding.summary} ${finding.explanation} (Severity: ${finding.severity}; Confidence: ${finding.confidence} [${finding.confidenceScore}/100] - ${confidenceDetail})`
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
