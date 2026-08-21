import { getProfileVerdict, type ProfileVerdictOverlay } from '@/config/profile-verdicts'

/**
 * Derives the decision surface for a herb/compound profile from runtime data
 * that already exists in the workbook export, plus the opt-in editorial verdict
 * overlay. It never invents facts: only reliably-clean fields are surfaced, and
 * the richer verdict comes from `config/profile-verdicts.ts` when present.
 *
 * This keeps the source-of-truth boundary clean:
 *   - structured facts  → workbook / runtime data (evidence tier, safety flags)
 *   - editorial verdict → config/profile-verdicts.ts (curated, opt-in)
 *   - rendering         → components/editorial/ProfileDecisionPanel
 */

export type ContinuePath = {
  ifYouWant: string
  goTo: string
  href: string
}

export type RuntimeProfileSummary = {
  /** Compact evidence label copied from structured runtime fields when available. */
  evidence?: string
  /** Compact safety label/note copied from structured runtime fields when available. */
  safety?: string
  /** Up to three deduplicated use/effect labels already present in runtime data. */
  topUses: string[]
}

export type ProfileDecision = {
  /** Curated verdict, present only when the slug has an overlay entry. */
  verdict?: ProfileVerdictOverlay
  /**
   * Conservative answer-first fallback for profiles without a curated verdict.
   * It is derived only from existing runtime fields and never supplies a default
   * safety claim when safety data is absent.
   */
  runtimeSummary?: RuntimeProfileSummary
  /** Intent-based "continue reading" routes derived from the record. Always present (may be empty). */
  continueReading: ContinuePath[]
}

type LooseRecord = Record<string, unknown>

const PLACEHOLDER_PATTERN = /^(?:research[-\s]?pending|placeholder|unknown|not specified|not available|needs review|n\/?a|none|tbd)$/i

const asStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap((v) => asStringList(v))
  if (typeof value === 'string') return value ? [value] : []
  return []
}

function compactString(value: unknown): string | undefined {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined
  const normalized = String(value).replace(/\s+/g, ' ').trim()
  if (!normalized || PLACEHOLDER_PATTERN.test(normalized)) return undefined
  return normalized
}

function firstSentence(value: unknown): string | undefined {
  const normalized = compactString(value)
  if (!normalized) return undefined
  return normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/)?.[0]?.trim() || normalized
}

function firstStructuredValue(record: LooseRecord, fields: string[]): string | undefined {
  for (const field of fields) {
    const value = compactString(record[field])
    if (value) return value
  }
  return undefined
}

function formatEvidence(value: string | undefined): string | undefined {
  if (!value) return undefined
  if (/^[A-D]$/i.test(value)) return `Grade ${value.toUpperCase()}`
  if (/^avoid\s*\/?\s*insufficient$/i.test(value)) return 'Avoid / insufficient'
  return value
}

function buildRuntimeSummary(record: LooseRecord): RuntimeProfileSummary | undefined {
  const evidence = formatEvidence(firstStructuredValue(record, [
    'evidence_grade',
    'evidenceGrade',
    'evidence_tier',
    'evidenceTier',
    'evidence_level',
    'evidenceLevel',
  ]))

  const safetyStructured = firstStructuredValue(record, [
    'safety_level',
    'safetyLevel',
    'safety_rating',
    'safetyRating',
  ])
  const safety = safetyStructured || firstSentence(record.safetyNotes ?? record.safety_notes ?? record.safety)

  const topUses: string[] = []
  const seenUses = new Set<string>()
  const useCandidates = [
    ...asStringList(record.primary_effects),
    ...asStringList(record.effects),
    ...asStringList(record.primaryActions),
    ...asStringList(record.primary_actions),
  ]
  for (const candidate of useCandidates) {
    const value = compactString(candidate)
    if (!value) continue
    const key = value.toLowerCase()
    if (seenUses.has(key)) continue
    seenUses.add(key)
    topUses.push(value)
    if (topUses.length >= 3) break
  }

  if (!evidence && !safety && topUses.length === 0) return undefined
  return { evidence, safety, topUses }
}

/** Build a lowercased keyword corpus from the fields that describe what a profile is about. */
function corpusOf(record: LooseRecord): string {
  return [
    record.name,
    record.summary,
    record.description,
    ...asStringList(record.effects),
    ...asStringList(record.primary_effects),
    ...asStringList(record.conditions),
    ...asStringList(record.tags),
    ...asStringList(record.keywords),
  ]
    .map((v) => String(v ?? '').toLowerCase())
    .join(' ')
}

// Intent → goal hub, matched by keyword. Ordered by priority; deduped by href.
const INTENT_ROUTES: { keywords: string[]; path: ContinuePath }[] = [
  {
    keywords: ['sleep', 'insomnia', 'melatonin', 'sedative', 'rest'],
    path: { ifYouWant: 'help sleeping', goTo: 'Sleep guides', href: '/guides/sleep/' },
  },
  {
    keywords: ['anxiety', 'stress', 'cortisol', 'calm', 'gaba', 'anxiolytic', 'adaptogen', 'relax'],
    path: { ifYouWant: 'help with anxiety or stress', goTo: 'Anxiety & stress guides', href: '/guides/anxiety/' },
  },
  {
    keywords: ['focus', 'cognition', 'cognitive', 'attention', 'nootropic', 'adhd', 'memory', 'concentration'],
    path: { ifYouWant: 'sharper focus', goTo: 'Focus guides', href: '/guides/focus/' },
  },
]

export function buildProfileDecision(record: LooseRecord, kind: 'herb' | 'compound'): ProfileDecision {
  const slug = String(record.slug ?? '')
  const verdict = getProfileVerdict(slug)
  const runtimeSummary = verdict ? undefined : buildRuntimeSummary(record)

  const corpus = corpusOf(record)
  const continueReading: ContinuePath[] = []
  const seen = new Set<string>()
  for (const { keywords, path } of INTENT_ROUTES) {
    if (keywords.some((k) => corpus.includes(k)) && !seen.has(path.href)) {
      continueReading.push(path)
      seen.add(path.href)
    }
  }
  // Always offer a browse-the-ecosystem exit relevant to this profile type.
  const indexPath: ContinuePath =
    kind === 'herb'
      ? { ifYouWant: 'to browse more herbs', goTo: 'All herbs', href: '/herbs/' }
      : { ifYouWant: 'to browse more compounds', goTo: 'All compounds', href: '/compounds/' }
  if (!seen.has(indexPath.href)) continueReading.push(indexPath)

  return { verdict, runtimeSummary, continueReading }
}
