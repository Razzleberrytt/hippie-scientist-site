'use client'

import Link from 'next/link'
import type { EvidenceGradeChange } from '@/data/editorial/evidence-grade-history'
import type { PublicEvidenceReportMetrics } from '@/lib/public-evidence-dataset'

type Props = {
  datasetVersion: string
  citationText: string
  metrics: PublicEvidenceReportMetrics
  changeHistory: EvidenceGradeChange[]
}

function pct(numerator: number, denominator: number) {
  return denominator > 0 ? (numerator / denominator) * 100 : 0
}

function formatPct(value: number) {
  if (!Number.isFinite(value)) return '0%'
  return value >= 10 ? `${Math.round(value)}%` : `${value.toFixed(1)}%`
}

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, character => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;',
  }[character] || character))
}

function buildGradeChartSvg(metrics: PublicEvidenceReportMetrics, datasetVersion: string) {
  const width = 1000
  const left = 180
  const barWidth = 650
  const rowHeight = 76
  const height = 130 + metrics.gradeDistribution.length * rowHeight
  const rows = metrics.gradeDistribution.map((item, index) => {
    const y = 90 + index * rowHeight
    const widthValue = Math.max(0, Math.min(barWidth, (item.pct / 100) * barWidth))
    return `
      <text x="30" y="${y + 25}" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#292431">${escapeXml(item.grade)}</text>
      <rect x="${left}" y="${y}" width="${barWidth}" height="34" rx="17" fill="#eee8f4" />
      <rect x="${left}" y="${y}" width="${widthValue}" height="34" rx="17" fill="#63558f" />
      <text x="${left + barWidth + 24}" y="${y + 25}" font-family="Arial, sans-serif" font-size="20" fill="#514a59">${item.count} · ${formatPct(item.pct)}</text>`
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#fffdf9" />
    <text x="30" y="42" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#292431">State of Supplement Evidence 2026</text>
    <text x="30" y="68" font-family="Arial, sans-serif" font-size="15" fill="#6b6471">Evidence-grade distribution · The Hippie Scientist · dataset ${escapeXml(datasetVersion)}</text>
    ${rows}
    <text x="30" y="${height - 22}" font-family="Arial, sans-serif" font-size="13" fill="#6b6471">thehippiescientist.net/evidence/evidence-report/</text>
  </svg>`
}

export default function EvidenceReportClient({ datasetVersion, citationText, metrics, changeHistory }: Props) {
  const strongModeratePct = pct(metrics.strongOrModerateIngredients, metrics.ingredientCount)
  const preliminaryPct = pct(metrics.preliminaryOrInsufficientIngredients, metrics.ingredientCount)
  const safetyPct = pct(metrics.ingredientsWithSafetyCautions, metrics.ingredientCount)
  const sortedChanges = [...changeHistory].sort((a, b) => Date.parse(b.changedAt) - Date.parse(a.changedAt))

  function downloadGradeChart() {
    const svg = buildGradeChartSvg(metrics, datasetVersion)
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const href = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = `state-of-supplement-evidence-${datasetVersion}.svg`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(href)
  }

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="eyebrow-label">Original data report · dataset v{datasetVersion}</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">State of Supplement Evidence 2026</h1>
        <p className="mt-5 max-w-4xl text-lg leading-8 text-muted">
          A build-time analysis of the currently indexable Hippie Scientist research library: evidence grades,
          structured study/source records, human-study records, reported participant counts, safety cautions, and explicit disagreement
          between supporting and unfavorable or null evidence relationships.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/evidence/evidence-report/dataset.csv" download className="rounded-full bg-brand-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-900">Download CSV</a>
          <a href="/evidence/evidence-report/dataset.json" download className="rounded-full border border-brand-900/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-brand-50">Download JSON</a>
          <button type="button" onClick={downloadGradeChart} className="rounded-full border border-brand-900/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-brand-50">Download chart SVG</button>
          <Link href="/learn/citation-explorer/" className="rounded-full border border-brand-900/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-brand-50">Explore studies</Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Evidence report key findings">
        <div className="card-premium p-5">
          <p className="eyebrow-label">Strong / moderate</p>
          <p className="mt-2 text-3xl font-bold text-ink">{formatPct(strongModeratePct)}</p>
          <p className="mt-2 text-xs leading-5 text-muted">{metrics.strongOrModerateIngredients} of {metrics.ingredientCount} indexable ingredients are currently A or B.</p>
        </div>
        <div className="card-premium p-5">
          <p className="eyebrow-label">Preliminary / insufficient</p>
          <p className="mt-2 text-3xl font-bold text-ink">{formatPct(preliminaryPct)}</p>
          <p className="mt-2 text-xs leading-5 text-muted">C, D, or Avoid/Insufficient profiles remain visibly separate from stronger evidence.</p>
        </div>
        <div className="card-premium p-5">
          <p className="eyebrow-label">Structured safety cautions</p>
          <p className="mt-2 text-3xl font-bold text-ink">{formatPct(safetyPct)}</p>
          <p className="mt-2 text-xs leading-5 text-muted">{metrics.ingredientsWithSafetyCautions} profiles contain caution signals; this is a screening statistic, not a risk rate.</p>
        </div>
        <div className="card-premium p-5">
          <p className="eyebrow-label">Human trial records indexed</p>
          <p className="mt-2 text-3xl font-bold text-ink">{metrics.humanTrialCount.toLocaleString()}</p>
          <p className="mt-2 text-xs leading-5 text-muted">Across {metrics.studyCount.toLocaleString()} deduplicated structured study entities. This is a record count, not a count of proven-independent underlying trials.</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Study coverage">
        <div className="rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Human evidence source records</p>
          <p className="mt-2 text-3xl font-bold text-ink">{metrics.humanStudyCount.toLocaleString()}</p>
          <p className="mt-1 text-xs text-muted">
            Publication/study entities classified as human evidence.
            {metrics.studyClassAmbiguityStudyCount > 0
              ? ` ${metrics.studyClassAmbiguityStudyCount} deduplicated study record${metrics.studyClassAmbiguityStudyCount === 1 ? '' : 's'} with conflicting concrete design classes ${metrics.studyClassAmbiguityStudyCount === 1 ? 'is' : 'are'} conservatively classified as Other / unclear and excluded from human/trial counts until reconciled.`
              : ''}{' '}
            Multiple publication records can still originate from the same underlying trial, cohort, or dataset.
          </p>
        </div>
        <div className="rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Reported participants</p>
          <p className="mt-2 text-3xl font-bold text-ink">~{metrics.approximateParticipants.toLocaleString()}</p>
          <p className="mt-1 text-xs text-muted">
            Only deduplicated human-evidence records with one unambiguous structured N are included.
            {metrics.participantCountAmbiguityStudyCount > 0
              ? ` ${metrics.participantCountAmbiguityStudyCount} study record${metrics.participantCountAmbiguityStudyCount === 1 ? '' : 's'} with conflicting N values ${metrics.participantCountAmbiguityStudyCount === 1 ? 'is' : 'are'} excluded from this total.`
              : ''}{' '}
            Overlapping publications may still count some participants more than once.
          </p>
        </div>
        <div className="rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Endpoint heterogeneity</p>
          <p className="mt-2 text-3xl font-bold text-ink">{metrics.withinIngredientDirectionalHeterogeneityStudyCount.toLocaleString()}</p>
          <p className="mt-1 text-xs text-muted">Deduplicated study entities with mixed directional endpoint contexts for the same ingredient. Cross-ingredient variation is excluded from this headline count.</p>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow-label">Evidence distribution</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">How the indexable library is graded</h2>
          </div>
          <button type="button" onClick={downloadGradeChart} className="text-sm font-semibold text-brand-700 hover:underline">Download reusable SVG →</button>
        </div>
        <div className="mt-7 space-y-5">
          {metrics.gradeDistribution.map(item => (
            <div key={item.grade}>
              <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
                <span className="font-semibold text-ink">{item.grade} · {item.count} profiles</span>
                <span className="text-muted">{formatPct(item.pct)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-brand-50">
                <div className="h-full rounded-full bg-brand-700" style={{ width: `${Math.max(0, Math.min(100, item.pct))}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8">
        <p className="eyebrow-label">Category comparison</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Where the current library has stronger human-evidence coverage</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-muted">
          Categories are ranked by the share of indexable ingredients currently graded A/B, then by structured human-trial record coverage. Human source and trial counts are deduplicated publication entities within each category, not citation incidences or proven-independent underlying studies. Category names come from canonical runtime records; small categories can be volatile.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-brand-900/10 text-xs uppercase tracking-wider text-muted">
                <th className="py-3 pr-4">Category</th><th className="py-3 pr-4">Ingredients</th><th className="py-3 pr-4">A/B</th><th className="py-3 pr-4">Preliminary/insufficient</th><th className="py-3 pr-4">Unassigned</th><th className="py-3 pr-4">Human source records</th><th className="py-3">Human trial records</th>
              </tr>
            </thead>
            <tbody>
              {metrics.categories.slice(0, 20).map(category => (
                <tr key={category.category} className="border-b border-brand-900/10 last:border-0">
                  <td className="py-3 pr-4 font-semibold text-ink">{category.category}</td>
                  <td className="py-3 pr-4 text-muted">{category.totalIngredients}</td>
                  <td className="py-3 pr-4 text-muted">{category.strongOrModerate}</td>
                  <td className="py-3 pr-4 text-muted">{category.preliminaryOrInsufficient}</td>
                  <td className="py-3 pr-4 text-muted">{category.unassigned}</td>
                  <td className="py-3 pr-4 text-muted">{category.humanStudies}</td>
                  <td className="py-3 text-muted">{category.humanTrials}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-brand-900/10 bg-brand-50/50 p-6 sm:p-8">
          <p className="eyebrow-label">Claim-discipline signal</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Explicitly flagged claim overreach</h2>
          <p className="mt-3 text-4xl font-bold text-ink">{metrics.explicitlyFlaggedClaimOverreach.toLocaleString()}</p>
          <p className="mt-3 text-sm leading-7 text-muted">
            This counts only records carrying an explicit structured overreach or evidence-language violation flag. It intentionally avoids manufacturing a more dramatic statistic from weak heuristics.
          </p>
        </article>
        <article className="rounded-2xl border border-brand-900/10 bg-brand-50/50 p-6 sm:p-8">
          <p className="eyebrow-label">Directional evidence relationships</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Support is not the only thing retained</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <p><strong className="text-ink">{metrics.supportingRelationships}</strong><br /><span className="text-muted">supporting</span></p>
            <p><strong className="text-ink">{metrics.mixedRelationships}</strong><br /><span className="text-muted">mixed</span></p>
            <p><strong className="text-ink">{metrics.contradictingRelationships}</strong><br /><span className="text-muted">contradicting</span></p>
            <p><strong className="text-ink">{metrics.noClearEffectRelationships}</strong><br /><span className="text-muted">no clear effect</span></p>
          </div>
          <Link href="/learn/citation-explorer/" className="mt-5 inline-flex text-sm font-semibold text-brand-700 hover:underline">Explore study relationships →</Link>
        </article>
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8">
        <p className="eyebrow-label">Evidence Change Tracker</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">What changed the conclusion?</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-muted">
          Grade changes are append-only events with the old grade, new grade, date, reason, and source IDs when available. The tracker starts from recorded events rather than inventing historical upgrades from today’s database state.
        </p>
        {sortedChanges.length === 0 ? (
          <div className="mt-5 rounded-xl border border-brand-900/10 bg-brand-50/50 p-5 text-sm leading-7 text-muted">
            No historical grade-change events have been entered in the new public ledger yet. Future upgrades, downgrades, and conclusion-changing research can be published without rewriting the past.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {sortedChanges.slice(0, 6).map(change => (
              <article key={change.id} className="rounded-xl border border-brand-900/10 p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted"><time dateTime={change.changedAt}>{change.changedAt}</time><span>•</span><Link href={change.ingredientPath} className="font-semibold text-brand-700 hover:underline">{change.ingredientName}</Link></div>
                <p className="mt-2 text-sm font-bold text-ink">{change.fromGrade} → {change.toGrade}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{change.reason}</p>
              </article>
            ))}
          </div>
        )}
        <Link href="/evidence/evidence-report/changes/" className="mt-5 inline-flex text-sm font-semibold text-brand-700 hover:underline">Open full Evidence Change Tracker →</Link>
      </section>

      <section className="rounded-[2rem] border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8">
        <p className="eyebrow-label">Cite / reuse</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Stable dataset citation</h2>
        <p className="mt-3 rounded-xl bg-brand-50/60 p-4 font-mono text-xs leading-6 text-ink">{citationText}</p>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-muted">
          Downloaded data includes stable study IDs, source identifiers, study class, reported sample size, dose, duration, population, outcome, limitation, safety outcome, ingredient relationships, evidence grades, and directional labels where structured data exists.
        </p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/info/editorial-policy/" className="text-brand-700 hover:underline">Methodology &amp; inclusion rules →</Link>
          <Link href="/evidence/evidence-report/changelog/" className="text-brand-700 hover:underline">Dataset changelog →</Link>
          <Link href="/info/corrections/" className="text-brand-700 hover:underline">Submit a correction →</Link>
          <Link href="/learn/citation-explorer/" className="text-brand-700 hover:underline">Search the studies →</Link>
        </div>
      </section>
    </main>
  )
}
