import Link from 'next/link'
import type { ProfileDecision } from '@/lib/profile-decision'
import ScientificVerdictCard from '@/components/editorial/ScientificVerdictCard'
import EvidenceConfidence from '@/components/editorial/EvidenceConfidence'

/** Shared decision surface for every herb and compound profile. */
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
          id="decision-summary"
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
        <section aria-label="Where to go next" className="not-prose">
          <details className="group border-y border-[color:var(--hs-hairline-strong)] !bg-transparent !p-0 !shadow-none">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] [&::-webkit-details-marker]:hidden">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--tone-ink)]">Where to go next — guides &amp; comparisons</span>
              <svg
                className="size-4 shrink-0 text-[color:var(--hs-body)] transition-transform group-open:rotate-180"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>

            <div className="border-t border-[color:var(--hs-hairline)]">
              {verdict?.primaryGuide ? (
                <div className="grid gap-1 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--hs-gold)]">Start here</p>
                  <p className="text-sm leading-6 text-[color:var(--hs-body)]">
                    New to this? Begin with{' '}
                    <Link href={verdict.primaryGuide.href} className="font-bold text-[color:var(--tone-ink)] underline-offset-4 hover:underline">
                      {verdict.primaryGuide.label}
                    </Link>.
                  </p>
                </div>
              ) : null}

              {verdict?.comparisons && verdict.comparisons.length > 0 ? (
                <div className="border-t border-[color:var(--hs-hairline)] py-4 sm:grid sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">Compare first</p>
                  <ul className="mt-2 space-y-2 sm:mt-0">
                    {verdict.comparisons.map((comparison) => (
                      <li key={comparison.href} className="text-sm leading-6 text-[color:var(--hs-body)]">
                        <Link href={comparison.href} className="font-bold text-[color:var(--tone-ink)] underline-offset-4 hover:underline">{comparison.label}</Link>
                        <span> — if {comparison.when}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {continueReading.length > 0 ? (
                <div className="border-t border-[color:var(--hs-hairline)] py-4 sm:grid sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--tone-ink)]">Continue reading</p>
                  <ul className="mt-2 space-y-2 sm:mt-0">
                    {continueReading.map((path) => (
                      <li key={path.href} className="text-sm leading-6 text-[color:var(--hs-body)]">
                        <span>If you want {path.ifYouWant} → </span>
                        <Link href={path.href} className="font-bold text-[color:var(--tone-ink)] underline-offset-4 hover:underline">{path.goTo}</Link>
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
