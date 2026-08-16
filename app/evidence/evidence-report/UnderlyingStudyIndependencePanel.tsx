import type { PublicEvidenceReportMetrics } from '@/lib/public-evidence-dataset'

type Props = {
  metrics: PublicEvidenceReportMetrics
}

function value(value: number | null): string {
  return value === null ? '—' : value.toLocaleString()
}

function pct(value: number | null): string {
  return value === null ? '—' : `${Math.round(value * 100)}%`
}

export default function UnderlyingStudyIndependencePanel({ metrics }: Props) {
  const available = metrics.underlyingStudyMetricsSource === 'canonical-research-topology'
    && metrics.globalPrimaryHumanPublicationCount !== null
    && metrics.globalPrimaryHumanUnderlyingStudyCount !== null
    && metrics.globalCollapsedPrimaryHumanPublicationCount !== null

  if (!available) return null

  const unresolved = metrics.independenceUnresolvedClaims ?? 0
  const multiStudy = metrics.independenceMultiStudyApprovedClaims ?? 0
  const highConfidenceUnresolved = metrics.highConfidenceIndependenceUnresolvedClaims ?? 0
  const primaryHumanMissingMetadata = metrics.globalPrimaryHumanPublicationsWithoutIndependenceMetadata ?? 0

  return (
    <section className="rounded-2xl border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="underlying-study-independence-heading">
      <p className="eyebrow-label">Evidence independence</p>
      <h2 id="underlying-study-independence-heading" className="mt-2 text-2xl font-semibold text-ink">
        Independence-adjusted counts, not assumed independence
      </h2>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-muted">
        The canonical research graph first deduplicates publication identities across profiles, then collapses publications only when explicit trial-registration, cohort, dataset, or parent-study lineage shows they belong to the same underlying evidence unit. Missing lineage stays unresolved and is never treated as proof that publications are either dependent or independent.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Primary-human publications</p>
          <p className="mt-2 text-3xl font-bold text-ink">{value(metrics.globalPrimaryHumanPublicationCount)}</p>
          <p className="mt-2 text-xs leading-5 text-muted">Unique site-wide publication identities classified as primary human research.</p>
        </article>
        <article className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Independence-adjusted human units</p>
          <p className="mt-2 text-3xl font-bold text-ink">{value(metrics.globalPrimaryHumanUnderlyingStudyCount)}</p>
          <p className="mt-2 text-xs leading-5 text-muted">Primary-human evidence units remaining after explicitly proven cross-publication dependence is collapsed.</p>
        </article>
        <article className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Human publications collapsed</p>
          <p className="mt-2 text-3xl font-bold text-ink">{value(metrics.globalCollapsedPrimaryHumanPublicationCount)}</p>
          <p className="mt-2 text-xs leading-5 text-muted">Publication identities removed from the adjusted count because shared underlying-study identity was positively established.</p>
        </article>
        <article className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Primary-human metadata coverage</p>
          <p className="mt-2 text-3xl font-bold text-ink">{pct(metrics.globalPrimaryHumanIndependenceMetadataCoverage)}</p>
          <p className="mt-2 text-xs leading-5 text-muted">Share of unique primary-human publications with explicit registry, cohort, dataset, parent-study, or same-trial metadata available for independence assessment.</p>
        </article>
      </div>

      {primaryHumanMissingMetadata > 0 ? (
        <div className="mt-5 rounded-xl border border-amber-900/15 bg-amber-50/70 p-4 text-sm leading-6 text-amber-950">
          <strong>{primaryHumanMissingMetadata} unique primary-human publication{primaryHumanMissingMetadata === 1 ? '' : 's'} currently lack explicit independence metadata.</strong>{' '}
          Those publications remain separate in the adjusted count unless and until the canonical research graph positively establishes shared underlying-study identity.
        </div>
      ) : null}

      {multiStudy > 0 ? (
        <div className="mt-4 rounded-xl border border-brand-900/10 bg-brand-50/50 p-4 text-sm leading-6 text-muted">
          <strong className="text-ink">Approved-claim diagnostic:</strong>{' '}
          independence remains unresolved for {unresolved} of {multiStudy} approved claims supported by multiple publication-level studies; {highConfidenceUnresolved} of those unresolved claims are high-confidence. Mean claim-level explicit lineage coverage is {pct(metrics.meanIndependenceCoverage)}.
        </div>
      ) : null}

      <p className="mt-5 text-xs leading-5 text-muted">
        Because unknown relationships are left separate, the adjusted study count is a conservative upper bound with respect to unobserved publication dependence—not proof that every remaining evidence unit is independently recruited or generated. These counts are narrower than the report’s “human evidence source records” metric: syntheses and reviews remain publication-level evidence records, while the independence-adjusted figure above is restricted to primary human research. It is not an estimate of unique participants and is not an RCT-only count. Across all study classes, the current topology retains {value(metrics.globalInventoryUnderlyingStudyCount)} evidence units after explicitly proven dependence collapse.
      </p>
    </section>
  )
}
