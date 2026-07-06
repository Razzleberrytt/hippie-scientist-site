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

  return { verdict, continueReading }
}
