import type { PublicEvidenceReportMetrics } from '@/lib/public-evidence-dataset'

type Props = {
  metrics: PublicEvidenceReportMetrics
}

function value(value: number | null): string {
  return value === null ? '—' : value.toLocaleString()
}

export default function UnderlyingStudyIndependencePanel({ metrics }: Props) {
  const available = metrics.underlyingStudyMetricsSource === 'canonical-research-topology'
    && metrics.globalPrimaryHumanPublicationCount !== null
    && metrics.globalPrimaryHumanUnderlyingStudyCount !== null
    && metrics.globalCollapsedPrimaryHumanPublicationCount !== null

  if (!available) return null

  return (
    <section className="rounded-2xl border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="underlying-study-independence-heading">
      <p className="eyebrow-label">Evidence independence</p>
      <h2 id="underlying-study-independence-heading" className="mt-2 text-2xl font-semibold text-ink">
        Publications are not automatically independent studies
      </h2>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-muted">
        The canonical research graph first deduplicates publication identities across profiles, then collapses publications only when explicit trial-registration, cohort, dataset, or parent-study lineage shows they belong to the same underlying evidence unit. Missing lineage is never treated as proof of dependence.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Primary-human publications</p>
          <p className="mt-2 text-3xl font-bold text-ink">{value(metrics.globalPrimaryHumanPublicationCount)}</p>
          <p className="mt-2 text-xs leading-5 text-muted">Unique site-wide publication identities classified as primary human research.</p>
        </article>
        <article className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Underlying human studies</p>
          <p className="mt-2 text-3xl font-bold text-ink">{value(metrics.globalPrimaryHumanUnderlyingStudyCount)}</p>
          <p className="mt-2 text-xs leading-5 text-muted">Independent primary-human evidence units after explicit cross-publication dependence is collapsed.</p>
        </article>
        <article className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Human publications collapsed</p>
          <p className="mt-2 text-3xl font-bold text-ink">{value(metrics.globalCollapsedPrimaryHumanPublicationCount)}</p>
          <p className="mt-2 text-xs leading-5 text-muted">Publication records removed from the independence-adjusted count because shared underlying-study identity was positively established.</p>
        </article>
        <article className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">All underlying evidence units</p>
          <p className="mt-2 text-3xl font-bold text-ink">{value(metrics.globalInventoryUnderlyingStudyCount)}</p>
          <p className="mt-2 text-xs leading-5 text-muted">All canonical study classes after site-wide publication alias and explicit dependence collapse.</p>
        </article>
      </div>

      <p className="mt-5 text-xs leading-5 text-muted">
        These counts are narrower than the report’s “human evidence source records” metric: syntheses and reviews remain publication-level evidence records, while the independence-adjusted figure above is restricted to primary human research. It is not an estimate of unique participants and is not an RCT-only count.
      </p>
    </section>
  )
}
