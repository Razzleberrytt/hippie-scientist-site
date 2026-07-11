import Link from 'next/link'
import type { ProfileDecision } from '@/lib/profile-decision'
import ScientificVerdictCard from '@/components/editorial/ScientificVerdictCard'
import EvidenceConfidence from '@/components/editorial/EvidenceConfidence'

/**
 * ProfileDecisionPanel — the shared decision surface for every herb and
 * compound profile. Rendered once by each profile template, so improving it
 * improves hundreds of pages at once.
 *
 * - When the slug has a curated verdict (config/profile-verdicts.ts), it opens
 *   with a full ScientificVerdictCard.
 * - Always shows an intent-based "Continue reading" nav derived from the
 *   record's own data — replacing generic related-link dumps with routing.
 *
 * Static-safe server component; theme-aware. Data comes from
 * `buildProfileDecision(record, kind)`.
 */
export function ProfileDecisionPanel({
  decision,
  name,
}: {
  decision: ProfileDecision
  name: string
}) {
  const { verdict, continueReading } = decision
  if (!verdict && continueReading.length === 0) return null

  return (
    <div className="space-y-4">
      {verdict ? (
        <ScientificVerdictCard
          title={`Verdict: ${name}`}
          recommendation={verdict.recommendation}
          confidence={verdict.confidence}
          bestFor={verdict.bestFor}
          notIdealFor={verdict.notIdealFor}
          onset={verdict.onset}
          evaluationWindow={verdict.evaluationWindow}
          safetyNote={verdict.safetyNote}
          evidenceNote={verdict.evidenceNote}
          betterAlternative={verdict.betterAlternative}
          bottomLine={verdict.bottomLine}
        />
      ) : null}

      {verdict?.evidenceConfidence ? (
        <EvidenceConfidence
          grade={verdict.evidenceConfidence.grade}
          whyNotHigher={verdict.evidenceConfidence.whyNotHigher}
          whyNotLower={verdict.evidenceConfidence.whyNotLower}
          practicalTakeaway={verdict.evidenceConfidence.practicalTakeaway}
        />
      ) : null}

      {verdict?.primaryGuide ? (
        <section
          aria-label="Start here"
          className="not-prose rounded-2xl border border-brand-700/25 bg-brand-50/60 p-5 dark:border-emerald-400/20 dark:bg-[var(--surface-subtle)]"
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-emerald-300">Start here</p>
          <p className="mt-2 text-sm leading-6">
            <span className="text-muted">New to this? Begin with the guide, then come back → </span>
            <Link
              href={verdict.primaryGuide.href}
              className="font-bold text-brand-800 hover:underline dark:text-[var(--text-primary)]"
            >
              {verdict.primaryGuide.label}
            </Link>
          </p>
        </section>
      ) : null}

      {verdict?.comparisons && verdict.comparisons.length > 0 ? (
        <section
          aria-label="Compare before choosing"
          className="not-prose rounded-2xl border border-amber-500/25 bg-amber-50/50 p-5 dark:border-amber-400/15 dark:bg-[var(--surface-subtle)]"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
                Compare before choosing
              </p>
              <p className="max-w-2xl text-sm leading-6 text-muted">
                Use these side-by-side guides to compare timing, safety, evidence strength, and fit against nearby options.
              </p>
            </div>
            <Link
              href="/guides/compare/"
              className="text-xs font-bold text-brand-800 underline underline-offset-4 hover:text-brand-900 dark:text-[var(--text-primary)]"
            >
              Browse all comparisons →
            </Link>
          </div>
          <ul className="mt-4 space-y-2.5">
            {verdict.comparisons.map((c) => (
              <li key={c.href} className="text-sm leading-6">
                <Link
                  href={c.href}
                  className="font-bold text-brand-800 hover:underline dark:text-[var(--text-primary)]"
                >
                  {c.label}
                </Link>
                <span className="text-muted"> — if {c.when}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {continueReading.length > 0 ? (
        <section
          aria-label="Continue reading"
          className="not-prose rounded-2xl border border-brand-900/12 bg-brand-50/40 p-5 dark:border-white/10 dark:bg-[var(--surface-subtle)]"
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Continue reading</p>
          <ul className="mt-3 space-y-2">
            {continueReading.map((path) => (
              <li key={path.href} className="text-sm leading-6">
                <span className="text-muted">If you want {path.ifYouWant} → </span>
                <Link
                  href={path.href}
                  className="font-bold text-brand-800 hover:underline dark:text-[var(--text-primary)]"
                >
                  {path.goTo}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

export default ProfileDecisionPanel
