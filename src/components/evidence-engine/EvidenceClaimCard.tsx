import Link from 'next/link'
import EvidenceSafetyNotes from './EvidenceSafetyNotes'
import EvidenceSourceList from './EvidenceSourceList'
import TrialDesignInsight from '@/components/education/TrialDesignInsight'
import { countHumanTrials, getHumanParticipantMetric } from '../../lib/evidence-source-metrics'
import {
  formatEvidenceLabel,
  getConfidenceDisplay,
  type EvidenceEngineClaim,
  type EvidenceEngineSafetyNote,
  type EvidenceEngineSource,
} from '../../lib/evidence-engine'

type EvidenceClaimCardProps = {
  claim: EvidenceEngineClaim
  problemLabel: string
  profileHref: string
  safetyNotes: EvidenceEngineSafetyNote[]
  sources: EvidenceEngineSource[]
}

export default function EvidenceClaimCard({
  claim,
  problemLabel,
  profileHref,
  safetyNotes,
  sources,
}: EvidenceClaimCardProps) {
  const confidence = getConfidenceDisplay(claim.confidence_tier)
  const humanTrialCount = countHumanTrials(sources)
  const participantMetric = getHumanParticipantMetric(sources)
  const evidenceSignals = [
    claim.design_type
      ? { label: 'Evidence type', value: formatEvidenceLabel(claim.design_type) }
      : null,
    humanTrialCount > 0
      ? { label: 'Human trials', value: String(humanTrialCount) }
      : null,
    participantMetric
      ? {
          label: participantMetric.complete ? 'Approx participants' : 'Known participants',
          value: `N≈${participantMetric.total.toLocaleString()}`,
        }
      : claim.sample_size && claim.sample_size > 0
        ? { label: 'Participants', value: `N=${claim.sample_size.toLocaleString()}` }
        : null,
    sources.length > 0
      ? { label: 'Cited sources', value: String(sources.length) }
      : null,
    claim.duration
      ? { label: 'Duration', value: claim.duration }
      : null,
    claim.finding_consistency
      ? { label: 'Consistency', value: formatEvidenceLabel(claim.finding_consistency) }
      : null,
  ].filter((signal): signal is { label: string; value: string } => signal !== null)

  return (
    <article className="rounded-2xl border border-brand-900/12 bg-white/95 p-5 shadow-sm dark:bg-[var(--surface-card-strong)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="text-xl font-semibold text-ink">{claim.ingredient_name}</h4>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
            {problemLabel}
          </p>
        </div>
        <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${confidence.tone}`}>
          {confidence.label}
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold leading-6 text-ink">{claim.claim_statement}</p>

      {evidenceSignals.length > 0 ? (
        <dl className="mt-3 flex flex-wrap gap-2" aria-label="Evidence details">
          {evidenceSignals.map((signal) => (
            <div key={signal.label} className="rounded-lg border border-brand-900/10 bg-brand-50/60 px-3 py-2">
              <dt className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-muted">{signal.label}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-ink">{signal.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <dl className="mt-4 space-y-3 text-sm leading-6">
        <div>
          <dt className="font-semibold text-ink">Evidence summary</dt>
          <dd className="text-[#36483e] dark:text-[var(--text-muted)]">{claim.evidence_summary}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Limitations</dt>
          <dd className="text-[#36483e] dark:text-[var(--text-muted)]">{claim.limitations}</dd>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-brand-50/80 p-3 ring-1 ring-brand-900/8 dark:bg-[var(--surface-subtle)]">
            <dt className="font-semibold text-ink">Best fit</dt>
            <dd className="mt-1 text-[#36483e] dark:text-[var(--text-muted)]">{claim.best_fit}</dd>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200 dark:bg-[var(--surface-neutral)] dark:ring-[var(--border-soft)]">
            <dt className="font-semibold text-ink">Not best fit</dt>
            <dd className="mt-1 text-[#36483e] dark:text-[var(--text-muted)]">{claim.not_best_fit}</dd>
          </div>
        </div>
      </dl>

      {claim.design_type && (
        <TrialDesignInsight
          designType={claim.design_type}
          sampleSize={claim.sample_size ?? undefined}
          duration={claim.duration}
          blinding={claim.blinding}
          control={claim.control}
          title={`${claim.ingredient_name} Study Design`}
        >
          {claim.design_insight}
        </TrialDesignInsight>
      )}

      <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-800 ring-1 ring-slate-200 dark:bg-[var(--surface-neutral)] dark:text-[var(--text-muted)] dark:ring-[var(--border-soft)]">
        <strong>{confidence.label}:</strong> {confidence.description}
      </div>

      <EvidenceSafetyNotes notes={safetyNotes} />
      <EvidenceSourceList sources={sources} />

      <Link href={profileHref} className="mt-5 inline-flex text-sm font-semibold text-brand-800 hover:text-brand-700 hover:underline">
        Read the full profile
      </Link>
    </article>
  )
}
