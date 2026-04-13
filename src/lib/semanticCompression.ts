import { cleanText, sanitizeSummaryText, splitClean } from '@/lib/sanitize'

export type CuratedData = {
  name: string
  summary: string
  whyItMatters: string
  keyEffects: string[]
  risk: string
  mechanism: string
}

type RawCuratableRecord = Record<string, unknown>

const MIN_SAFE_SUMMARY = 'Profile in progress. Data is being reviewed for clarity.'
const MIN_SAFE_RISK = 'Review contraindications and interaction context before use.'

function dedupe(items: string[], limit = 6): string[] {
  const seen = new Set<string>()
  const output: string[] = []
  for (const raw of items) {
    const value = raw.replace(/\s+/g, ' ').trim()
    if (!value) continue
    const key = value.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    output.push(value)
    if (output.length >= limit) break
  }
  return output
}

function stripBrokenPhrases(value: string): string {
  return value
    .replace(/\banti\b\s*(?=[,.;]|$)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function sanitizeLine(value: unknown): string {
  return stripBrokenPhrases(cleanText(value) || '')
}

function sanitizeEffects(value: unknown): string[] {
  return dedupe(splitClean(value).map(item => stripBrokenPhrases(item)), 4)
}

function semanticCompression(cleaned: CuratedData): CuratedData {
  return {
    name: cleaned.name,
    summary: sanitizeSummaryText(cleaned.summary, 2) || MIN_SAFE_SUMMARY,
    whyItMatters: sanitizeSummaryText(cleaned.whyItMatters, 1) || MIN_SAFE_SUMMARY,
    keyEffects: dedupe(cleaned.keyEffects.map(item => sanitizeLine(item)), 4),
    risk: sanitizeSummaryText(cleaned.risk, 1) || MIN_SAFE_RISK,
    mechanism: sanitizeSummaryText(cleaned.mechanism, 1) || 'Mechanism notes are being reviewed.',
  }
}

function buildFallback(rawData: RawCuratableRecord): CuratedData {
  const name = sanitizeLine(rawData.name ?? rawData.commonName ?? rawData.common ?? rawData.slug) || 'Unknown profile'
  const summary =
    sanitizeLine(rawData.summary ?? rawData.description) ||
    sanitizeLine(rawData.mechanism ?? rawData.mechanismOfAction) ||
    MIN_SAFE_SUMMARY

  const safetySignals = dedupe(
    [
      ...splitClean(rawData.safetyNotes),
      ...splitClean(rawData.safety),
      ...splitClean(rawData.sideEffects ?? rawData.sideeffects),
      ...splitClean(rawData.contraindications),
      ...splitClean(rawData.interactions),
    ],
    2,
  )

  return {
    name,
    summary,
    whyItMatters: sanitizeLine(rawData.whyItMatters) || summary,
    keyEffects: sanitizeEffects(rawData.primaryEffects ?? rawData.effects),
    risk: safetySignals.join(' · ') || MIN_SAFE_RISK,
    mechanism:
      sanitizeLine(rawData.mechanism ?? rawData.mechanismOfAction) || 'Mechanism notes are being reviewed.',
  }
}

export function getCuratedData(rawData: unknown): CuratedData {
  const source = rawData && typeof rawData === 'object' ? (rawData as RawCuratableRecord) : {}

  try {
    const cleaned = buildFallback(source)
    return semanticCompression(cleaned)
  } catch {
    // safety fallback: never expose unfiltered raw text directly
    return {
      name: 'Unknown profile',
      summary: MIN_SAFE_SUMMARY,
      whyItMatters: MIN_SAFE_SUMMARY,
      keyEffects: [],
      risk: MIN_SAFE_RISK,
      mechanism: 'Mechanism notes are being reviewed.',
    }
  }
}

export function shouldShowRawDebug(search: string): boolean {
  const params = new URLSearchParams(search)
  return params.get('debug') === 'raw'
}
