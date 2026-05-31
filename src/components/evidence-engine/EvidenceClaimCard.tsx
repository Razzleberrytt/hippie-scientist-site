import Link from 'next/link'
import EvidenceSafetyNotes from '@/components/evidence-engine/EvidenceSafetyNotes'
import EvidenceSourceList from '@/components/evidence-engine/EvidenceSourceList'
import {
  getConfidenceDisplay,
  type EvidenceEngineClaim,
  type EvidenceEngineSafetyNote,
  type EvidenceEngineSource,
} from '@/lib/evidence-engine'

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

  return (
    <article className="rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="text-xl font-semibold text-ink">{claim.ingredient_name}</h4>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
            {problemLabel}
          </p>
        </div>
        <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${confidence.tone}`}>
          {confidence.label}
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold leading-6 text-ink">{claim.claim_statement}</p>
      <dl className="mt-4 space-y-3 text-sm leading-6">
        <div>
          <dt className="font-semibold text-ink">Evidence summary</dt>
          <dd className="text-muted">{claim.evidence_summary}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Limitations</dt>
          <dd className="text-muted">{claim.limitations}</dd>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-brand-50/50 p-3 ring-1 ring-brand-900/5">
            <dt className="font-semibold text-ink">Best fit</dt>
            <dd className="mt-1 text-muted">{claim.best_fit}</dd>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
            <dt className="font-semibold text-ink">Not best fit</dt>
            <dd className="mt-1 text-muted">{claim.not_best_fit}</dd>
          </div>
        </div>
      </dl>

      <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-700 ring-1 ring-slate-200">
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
