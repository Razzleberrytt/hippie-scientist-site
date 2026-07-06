/**
 * Editorial verdict overlay for herb/compound profiles.
 *
 * This is an OPT-IN editorial layer, keyed by slug. It is NOT workbook data and
 * never overrides structured facts — the workbook remains the source of truth
 * for evidence grades, safety flags, dosing, etc. This file only holds the
 * curated editorial *judgement* (recommendation, best/not-ideal framing,
 * a better alternative, bottom line) that data alone cannot express.
 *
 * A profile with no entry here still renders a derived decision surface
 * (evidence + safety + intent-based "continue reading") — see
 * `lib/profile-decision.ts`. Adding an entry upgrades that profile to a full
 * Scientific Verdict with zero template changes.
 *
 * Rules:
 * - Never invent facts. Only summarize what the profile/article already supports.
 * - Keep it honest: use "No" / "Situation-dependent" and a real "not ideal for".
 * - `betterAlternative.href` must be a real route.
 */

export type ProfileVerdictOverlay = {
  recommendation: 'Yes' | 'Maybe' | 'No' | 'Situation-dependent'
  bestFor: string[]
  notIdealFor: string[]
  onset?: string
  evaluationWindow?: string
  bottomLine: string
  betterAlternative?: { label: string; href: string; reason?: string }
}

export const PROFILE_VERDICTS: Record<string, ProfileVerdictOverlay> = {
  // ── Herb ──────────────────────────────────────────────────────────────
  ashwagandha: {
    recommendation: 'Yes',
    bestFor: [
      'Chronic stress with anxiety',
      'Stress-related sleep disruption',
      'High cortisol — feeling "wired but tired"',
    ],
    notIdealFor: [
      'Acute anxiety or panic (works over weeks, not minutes)',
      'A same-night sleep aid',
      'Pregnancy, thyroid disease, or use with sedatives',
    ],
    onset: 'Gradual — first shifts in 2–4 weeks',
    evaluationWindow: '6–8 weeks',
    bottomLine:
      'The best-studied adaptogen for chronic stress — it lowers cortisol and eases stress-related sleep over weeks. Not a quick fix, and the wrong tool for acute anxiety.',
    betterAlternative: {
      label: 'L-theanine',
      href: '/compounds/l-theanine/',
      reason: 'for acute, in-the-moment calm',
    },
  },

  // ── Compound ──────────────────────────────────────────────────────────
  'l-theanine': {
    recommendation: 'Yes',
    bestFor: [
      'Caffeine jitters',
      'Racing thoughts at bedtime',
      'Mild situational anxiety (presentations, exams)',
      'Calm focus without sedation',
    ],
    notIdealFor: ['Severe insomnia', 'Panic attacks', 'Chronic baseline stress alone'],
    onset: '30–40 minutes',
    evaluationWindow: 'Same day to 2 weeks',
    bottomLine:
      'A strong first choice for calm without sedation — smoothing caffeine and quieting a busy mind. Not the best primary tool for chronic stress or severe anxiety.',
    betterAlternative: {
      label: 'Ashwagandha',
      href: '/herbs/ashwagandha/',
      reason: 'for chronic baseline stress',
    },
  },
}

export function getProfileVerdict(slug: string): ProfileVerdictOverlay | undefined {
  return PROFILE_VERDICTS[slug]
}
