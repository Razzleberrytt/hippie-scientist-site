import { getProfileVerdict, type ProfileVerdictOverlay } from '@/config/profile-verdicts'
import { getProfileIntentRoutes } from './topic-taxonomy'

/**
 * Derives the decision surface for a herb/compound profile from runtime data
 * that already exists in the workbook export, plus the opt-in editorial verdict
 * overlay. It never invents facts: only reliably-clean fields are surfaced, and
 * the richer verdict comes from `config/profile-verdicts.ts` when present.
 *
 * This keeps the source-of-truth boundary clean:
 *   - structured facts  → workbook / runtime data (evidence tier, safety flags)
 *   - editorial verdict → config/profile-verdicts.ts (curated, opt-in)
 *   - topic routing      → lib/topic-taxonomy.ts (organizational only)
 *   - rendering         → components/editorial/ProfileDecisionPanel
 */

export type ContinuePath = {
  ifYouWant: string
  goTo: string
  href: string
}

export type ProfileDecision = {
  /** Curated verdict, present only when the slug has an overlay entry. */
  verdict?: ProfileVerdictOverlay
  /** Intent-based "continue reading" routes derived from the record. Always present (may be empty). */
  continueReading: ContinuePath[]
}

type LooseRecord = Record<string, unknown>

const asStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean)
  if (typeof value === 'string') return value ? [value] : []
  return []
}

/** Build routing signals from fields that already describe what a profile is about. */
function routingSignalsOf(record: LooseRecord): string[] {
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
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
}

export function buildProfileDecision(record: LooseRecord, kind: 'herb' | 'compound'): ProfileDecision {
  const slug = String(record.slug ?? '')
  const verdict = getProfileVerdict(slug)

  // Topic matching is navigation only. It must not be reused as evidence that
  // the ingredient treats a condition; scientific outcome claims live in the
  // canonical evidence/claim data instead.
  const continueReading: ContinuePath[] = getProfileIntentRoutes(routingSignalsOf(record))
  const seen = new Set(continueReading.map((path) => path.href))

  // Always offer a browse-the-ecosystem exit relevant to this profile type.
  const indexPath: ContinuePath =
    kind === 'herb'
      ? { ifYouWant: 'to browse more herbs', goTo: 'All herbs', href: '/herbs/' }
      : { ifYouWant: 'to browse more compounds', goTo: 'All compounds', href: '/compounds/' }
  if (!seen.has(indexPath.href)) continueReading.push(indexPath)

  return { verdict, continueReading }
}
