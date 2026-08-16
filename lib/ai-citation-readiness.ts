import fs from 'node:fs'
import path from 'node:path'

import type {
  ClaimQualityAnalysis,
  ProfileQualityAnalysis,
  ResearchQualityAnalysis,
} from './research-quality-analysis'

const WEAK = /preliminary|mixed evidence|limited evidence|insufficient|unclear|weak evidence|theoretical|animal evidence|in[- ]vitro|mechanistic only|research pending/i
const STRONG = /\b(?:grade\s*)?a\b|strong human evidence|high confidence|well[- ]established|robust evidence/i
const POSITIVE = /effective|efficacious|clinically proven|proven to|shown to improve|strong evidence for|supports the use/i
const NEGATIVE = /not supported|unsupported|no good evidence|insufficient evidence|does not support|failed to show|no clear benefit/i

type EntitySurface = {
  slug: string
  kind: 'herb' | 'compound' | 'unknown'
  freshnessSignal: boolean
  safetySignal: boolean
  answerSignal: boolean
  contradiction: boolean
}

export type AiCitationReadinessRow = {
  slug: string
  kind: EntitySurface['kind']
  score: number
  researchUrl: string | null
  approvedClaims: number
  canonicalStudies: number
  citationCompleteness: number
  primaryHuman: number
  systematicReviews: number
  narrativeReviews: number
  dominantStudySupportedClaimShare: number
  effectiveStudyCount: number
  contradiction: boolean
  gaps: string[]
}

export type AiCitationReadinessReport = {
  summary: {
    generatedAt: string
    researchQualitySource: string
    profiles: number
    matchedResearchProfiles: number
    averageScore: number
    below50: number
    below70: number
    contradictions: number
    overDependentOnSingleStudy: number
    narrativeDominated: number
  }
  profiles: AiCitationReadinessRow[]
}

function filesUnder(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) filesUnder(full, out)
    else if (entry.name.endsWith('.json') && entry.name !== 'manifest.json') out.push(full)
  }
  return out
}

function strings(value: unknown, out: string[] = []): string[] {
  if (value == null) return out
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    out.push(String(value))
    return out
  }
  if (Array.isArray(value)) {
    for (const item of value) strings(item, out)
    return out
  }
  if (typeof value === 'object') {
    for (const item of Object.values(value as Record<string, unknown>)) strings(item, out)
  }
  return out
}

function readEntitySurface(file: string, entityRoot: string): EntitySurface | null {
  try {
    const doc = JSON.parse(fs.readFileSync(file, 'utf8')) as unknown
    const allText = strings(doc).join(' | ')
    const relative = path.relative(entityRoot, file).replaceAll('\\', '/')
    return {
      slug: path.basename(file, '.json'),
      kind: relative.startsWith('herb/') ? 'herb' : relative.startsWith('compound/') ? 'compound' : 'unknown',
      freshnessSignal: /dateModified|datePublished|lastReviewed|reviewedAt|modifiedAt|review date/i.test(allText),
      safetySignal: /safety|contraindication|interaction|adverse|pregnan|warning|caution/i.test(allText),
      answerSignal: /summary|description|bottom line|quick answer|verdict|evidence summary/i.test(allText),
      contradiction: (STRONG.test(allText) && WEAK.test(allText)) || (POSITIVE.test(allText) && NEGATIVE.test(allText)),
    }
  } catch {
    return null
  }
}

function slugFromUrl(url: string): string {
  try {
    const parsed = url.startsWith('http') ? new URL(url) : new URL(url, 'https://thehippiescientist.net')
    return parsed.pathname.split('/').filter(Boolean).at(-1) ?? ''
  } catch {
    return url.split('/').filter(Boolean).at(-1) ?? ''
  }
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function claimsByUrl(claims: ClaimQualityAnalysis[]): Map<string, ClaimQualityAnalysis[]> {
  const map = new Map<string, ClaimQualityAnalysis[]>()
  for (const claim of claims) {
    const items = map.get(claim.url) ?? []
    items.push(claim)
    map.set(claim.url, items)
  }
  return map
}

export function buildAiCitationReadiness(
  analysis: ResearchQualityAnalysis,
  root = process.cwd(),
): AiCitationReadinessReport {
  const entityRoot = path.join(root, 'public', 'data', 'ai-entities')
  const approvedClaimsByUrl = claimsByUrl(analysis.claimAnalyses)
  const profileBySlug = new Map<string, ProfileQualityAnalysis>()
  for (const profile of analysis.profileAnalyses) profileBySlug.set(slugFromUrl(profile.url), profile)

  const surfaces = filesUnder(entityRoot)
    .map((file) => readEntitySurface(file, entityRoot))
    .filter((surface): surface is EntitySurface => Boolean(surface))

  const rows: AiCitationReadinessRow[] = []
  for (const surface of surfaces) {
    const research = profileBySlug.get(surface.slug)
    const approvedClaims = research ? (approvedClaimsByUrl.get(research.url) ?? []) : []
    const citationCompleteness = approvedClaims.length
      ? approvedClaims.filter((claim) => claim.validSourceRefCount > 0 && claim.danglingSourceRefs.length === 0).length / approvedClaims.length
      : research?.sourceCount
        ? 0.6
        : 0
    const humanRelevant = research ? research.primaryHuman + research.synthesis + research.narrativeReview : 0
    const primaryCoverage = humanRelevant && research ? (research.primaryHuman + research.synthesis) / humanRelevant : 0
    const independence = research ? 1 - Math.min(1, research.dominantStudySupportedClaimShare) : 0
    const sourceDepth = research ? Math.min(1, research.canonicalStudyCount / 5) : 0

    const score = clamp(
      citationCompleteness * 25 +
      primaryCoverage * 20 +
      independence * 15 +
      sourceDepth * 10 +
      Number(surface.freshnessSignal) * 10 +
      Number(surface.safetySignal) * 10 +
      Number(surface.answerSignal) * 10 -
      (surface.contradiction ? 35 : 0),
    )

    const gaps: string[] = []
    if (surface.contradiction) gaps.push('contradictory extractable claims')
    if (!research) gaps.push('no canonical research-quality profile match')
    if (research?.unsupportedApprovedClaims.length) gaps.push(`${research.unsupportedApprovedClaims.length} unsupported approved claim(s)`)
    if (research?.danglingSourceRefs.length) gaps.push(`${research.danglingSourceRefs.length} dangling source reference(s)`)
    if (research?.weakStructuredClaimCount) gaps.push(`${research.weakStructuredClaimCount} weak approved structured claim(s)`)
    if (research?.singleStudyApprovedClaims.length) gaps.push(`${research.singleStudyApprovedClaims.length} approved claim(s) supported by one study`)
    if (research?.overDependentOnSingleStudy) gaps.push('canonical research graph is over-dependent on one study')
    if (research?.narrativeDominatedVsPrimaryHuman) gaps.push('narrative-review dominated versus primary human research')
    if (research?.noPrimaryHuman) gaps.push('approved claims exist without primary human studies')
    if (research && research.canonicalStudyCount >= 3) {
      const classified = research.canonicalStudyCount - (research.designMix.unclassified ?? 0)
      if (classified / research.canonicalStudyCount < 0.7) gaps.push('study-design metadata coverage below 70%')
    }
    if (research && humanRelevant && primaryCoverage < 0.5) gaps.push('low primary/systematic human coverage')
    if (!surface.freshnessSignal) gaps.push('no explicit freshness signal')
    if (!surface.safetySignal) gaps.push('no obvious safety signal')
    if (!surface.answerSignal) gaps.push('no obvious answer-first extractability signal')

    rows.push({
      slug: surface.slug,
      kind: surface.kind,
      score,
      researchUrl: research?.url ?? null,
      approvedClaims: research?.approvedClaimCount ?? 0,
      canonicalStudies: research?.canonicalStudyCount ?? 0,
      citationCompleteness: Number(citationCompleteness.toFixed(3)),
      primaryHuman: research?.primaryHuman ?? 0,
      systematicReviews: research?.synthesis ?? 0,
      narrativeReviews: research?.narrativeReview ?? 0,
      dominantStudySupportedClaimShare: research?.dominantStudySupportedClaimShare ?? 0,
      effectiveStudyCount: research?.effectiveStudyCount ?? 0,
      contradiction: surface.contradiction,
      gaps,
    })
  }

  rows.sort((a, b) => a.score - b.score || b.gaps.length - a.gaps.length || a.slug.localeCompare(b.slug))
  return {
    summary: {
      generatedAt: new Date().toISOString(),
      researchQualitySource: 'lib/research-quality-analysis.ts',
      profiles: rows.length,
      matchedResearchProfiles: rows.filter((row) => row.researchUrl).length,
      averageScore: rows.length ? Math.round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length) : 0,
      below50: rows.filter((row) => row.score < 50).length,
      below70: rows.filter((row) => row.score < 70).length,
      contradictions: rows.filter((row) => row.contradiction).length,
      overDependentOnSingleStudy: rows.filter((row) => row.gaps.includes('canonical research graph is over-dependent on one study')).length,
      narrativeDominated: rows.filter((row) => row.gaps.includes('narrative-review dominated versus primary human research')).length,
    },
    profiles: rows,
  }
}

export function writeAiCitationReadinessReport(
  report: AiCitationReadinessReport,
  root = process.cwd(),
): string {
  const output = path.join(root, 'reports', 'ai-citation-readiness.json')
  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`)
  return output
}
