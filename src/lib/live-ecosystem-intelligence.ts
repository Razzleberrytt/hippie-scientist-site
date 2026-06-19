import { list, text, unique } from '@/lib/display-utils'
import { mechanismEcosystems } from './mechanism-ecosystems'
import { buildSemanticIntelligenceReport } from './semantic-intelligence-layer'

export type EcosystemHotspot = {
  slug: string
  title: string
  score: number
  density: number
  evidenceWeight: number
  connectedRecords: number
  signals: string[]
  summary: string
}

function normalize(value: unknown) {
  return text(value).toLowerCase().trim()
}

function collectSignals(record: any) {
  return unique([
    record?.slug,
    record?.name,
    record?.displayName,
    record?.summary,
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
    ...list(record?.topics),
  ].map(normalize).filter(Boolean))
}

function evidenceWeight(record: any) {
  const evidence = normalize(record?.evidence_tier || record?.evidenceTier || record?.summary_quality || record?.profile_status)
  if (/strong|clinical|human|high|complete/.test(evidence)) return 3
  if (/moderate|mixed|limited/.test(evidence)) return 2
  return 1
}

export function buildEcosystemHotspots(records: any[] = [], limit = 8): EcosystemHotspot[] {
  return mechanismEcosystems
    .map((ecosystem) => {
      const ecosystemSignals = [ecosystem.slug, ecosystem.title, ...ecosystem.pathways, ...ecosystem.compounds].map(normalize)
      const connected = records.filter((record) => {
        const recordSignals = collectSignals(record)
        return recordSignals.some((signal) =>
          ecosystemSignals.some((candidate) => candidate.includes(signal) || signal.includes(candidate)),
        )
      })

      const density = unique(connected.flatMap(collectSignals)).length
      const evidence = connected.reduce((sum, record) => sum + evidenceWeight(record), 0)
      const intelligence = connected.reduce((sum, record) => sum + buildSemanticIntelligenceReport(record, records).totalScore, 0)
      const score = connected.length * 4 + density * 0.4 + evidence * 2 + intelligence * 0.08

      return {
        slug: ecosystem.slug,
        title: ecosystem.title,
        score: Math.round(score),
        density,
        evidenceWeight: evidence,
        connectedRecords: connected.length,
        signals: ecosystem.pathways.slice(0, 5),
        summary: ecosystem.summary,
      }
    })
    .filter((item) => item.connectedRecords > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit)
}

export function buildEmergingPathwayClusters(records: any[] = [], limit = 12) {
  const counts = new Map<string, { count: number; evidence: number }>()

  records.forEach((record) => {
    unique([
      ...list(record?.primary_effects),
      ...list(record?.effects),
      ...list(record?.mechanisms),
      ...list(record?.pathways),
      ...list(record?.topics),
    ].map(normalize).filter(Boolean)).forEach((signal) => {
      const current = counts.get(signal) || { count: 0, evidence: 0 }
      counts.set(signal, {
        count: current.count + 1,
        evidence: current.evidence + evidenceWeight(record),
      })
    })
  })

  return Array.from(counts.entries())
    .map(([signal, value]) => ({
      signal,
      title: signal.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
      score: value.count * 3 + value.evidence,
      count: value.count,
      evidenceWeight: value.evidence,
    }))
    .filter((item) => item.count >= 2)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit)
}

export function buildEcosystemIntelligenceSummary(records: any[] = []) {
  const hotspots = buildEcosystemHotspots(records, 6)
  const clusters = buildEmergingPathwayClusters(records, 8)

  return {
    headline: 'Live ecosystem intelligence',
    description: 'Ecosystem priority is estimated from graph density, evidence maturity, pathway overlap, and semantic continuity.',
    hotspots,
    clusters,
  }
}
