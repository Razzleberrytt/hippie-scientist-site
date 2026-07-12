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

      {verdict?.primaryGuide || (verdict?.comparisons && verdict.comparisons.length > 0) || continueReading.length > 0 ? (
        <section
          aria-label="Where to go next"
          className="not-prose rounded-2xl border border-brand-900/12 bg-brand-50/40 p-4 dark:border-white/10 dark:bg-[var(--surface-subtle)]"
        >
          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between gap-3 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 focus-visible:rounded">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Where to go next — guides &amp; comparisons</span>
              <span aria-hidden="true" className="shrink-0 text-brand-500 transition-transform group-open:rotate-180">v</span>
            </summary>
            <div className="mt-3 border-t border-brand-900/10 pt-3 dark:border-white/10">
          {verdict?.primaryGuide ? (
            <p className="text-sm leading-6">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-emerald-300">Start here</span>{' '}
              <span className="text-muted">— new to this? Begin with </span>
              <Link
                href={verdict.primaryGuide.href}
                className="font-bold text-brand-800 hover:underline dark:text-[var(--text-primary)]"
              >
                {verdict.primaryGuide.label}
              </Link>
            </p>
          ) : null}

          {verdict?.comparisons && verdict.comparisons.length > 0 ? (
            <div className={verdict?.primaryGuide ? 'mt-3 border-t border-brand-900/10 pt-3 dark:border-white/10' : ''}>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
                Compare before choosing
              </p>
              <ul className="mt-2 space-y-1.5">
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
            </div>
          ) : null}

          {continueReading.length > 0 ? (
            <div className={verdict?.primaryGuide || (verdict?.comparisons && verdict.comparisons.length > 0) ? 'mt-3 border-t border-brand-900/10 pt-3 dark:border-white/10' : ''}>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Continue reading</p>
              <ul className="mt-2 space-y-1.5">
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
            </div>
          ) : null}
            </div>
          </details>
        </section>
      ) : null}
    </div>
  )
}

export default ProfileDecisionPanel
