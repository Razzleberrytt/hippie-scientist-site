import React, { useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Meta from '@/components/Meta'
import { useHerbData } from '@/lib/herb-data'
import { buildGovernedCollectionSummary } from '@/lib/collectionEnrichment'
import { buildGovernedCollectionIntro } from '@/lib/governedCollectionIntro'
import {
  applyGovernedDiscoveryControls,
  type GovernedDiscoveryFilter,
  type GovernedDiscoverySort,
} from '@/lib/governedCollectionDiscovery'
import type { Herb } from '@/types'
import { trackGovernedEvent } from '@/lib/governedAnalytics'

const FIELDS: Array<[keyof Herb, string]> = [
  ['common', 'Common Name'],
  ['scientific', 'Scientific Name'],
  ['category', 'Category'],
  ['intensity', 'Intensity'],
  ['region', 'Region'],
  ['legalstatus', 'Legal Status'],
  ['mechanism', 'Mechanism'],
  ['compounds', 'Key Compounds'],
  ['interactions', 'Interactions'],
  ['contraindications', 'Contraindications'],
  ['safety', 'Safety'],
  ['sideeffects', 'Side Effects'],
  ['toxicity', 'Toxicity'],
  ['sources', 'Sources'],
]

export default function Compare() {
  const [sp] = useSearchParams()
  const data = useHerbData()
  const ids = (sp.get('ids') || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 3)
  const herbs = useMemo(
    () => ids.map(slug => data.find(h => h.slug === slug)).filter(Boolean) as Herb[],
    [ids, data],
  )
  const [governedFilter, setGovernedFilter] = React.useState<GovernedDiscoveryFilter>('all')
  const [governedSort, setGovernedSort] = React.useState<GovernedDiscoverySort>('default')
  const governedDiscovery = useMemo(
    () =>
      applyGovernedDiscoveryControls({
        items: herbs,
        getSummary: herb => herb.researchEnrichmentSummary,
        filter: governedFilter,
        sort: governedSort,
      }),
    [herbs, governedFilter, governedSort],
  )
  const visibleHerbs = governedDiscovery.items
  const loadingSelection = ids.length > 0 && data.length === 0
  const governedComparisonSummary = useMemo(
    () =>
      buildGovernedCollectionSummary(
        visibleHerbs.map(herb => ({
          entityType: 'herb',
          entitySlug: herb.slug,
          entityName: herb.common || herb.scientific || herb.slug,
        })),
      ),
    [visibleHerbs],
  )
  const governedComparisonIntro = useMemo(
    () =>
      buildGovernedCollectionIntro({
        fallbackIntro:
          'Compare up to three herbs side-by-side. This view is descriptive and should not be treated as a ranked efficacy claim.',
        summary: governedComparisonSummary,
        qualityApproved: true,
      }),
    [governedComparisonSummary],
  )
  React.useEffect(() => {
    trackGovernedEvent({
      type: 'governed_card_summary_visible',
      eventAction: 'visible',
      pageType: 'compare_page',
      entityType: 'compare',
      surfaceId: 'compare_governed_summary',
      componentType: 'comparison_summary',
      item: String(visibleHerbs.length),
      reviewedStatus: 'not_applicable',
      freshnessState: 'not_applicable',
    })
  }, [visibleHerbs.length])

  return (
    <main className='mx-auto max-w-6xl px-4 py-8'>
      <Meta
        title='Compare Herbs | The Hippie Scientist'
        description='Compare herb data side-by-side.'
        path='/compare'
        noindex
      />
      <div className='flex flex-wrap items-baseline justify-between gap-4'>
        <h1 className='text-2xl font-bold'>Compare Herbs</h1>
        <Link className='underline' to='/herbs'>
          ← Back to Database
        </Link>
      </div>
      <p className='mt-3 max-w-3xl text-sm leading-7 text-white/80'>
        {governedComparisonIntro.intro}
      </p>
      {governedComparisonIntro.mode === 'governed' && governedComparisonIntro.supportingNote ? (
        <p className='mt-2 text-xs text-indigo-100/90'>{governedComparisonIntro.supportingNote}</p>
      ) : null}

      {loadingSelection ? (
        <p className='mt-4'>Loading comparison…</p>
      ) : herbs.length === 0 ? (
        <p className='mt-4'>
          No herbs selected. Choose up to three from the database and click Compare.
        </p>
      ) : (
        <div className='mt-6 space-y-4'>
          <section className='rounded-xl border border-indigo-300/30 bg-indigo-500/10 p-3 text-sm'>
            <h2 className='text-xs font-semibold uppercase tracking-[0.14em] text-indigo-100'>
              Governed comparison context
            </h2>
            <p className='mt-2 text-white/85'>
              Only publish-approved governed enrichment is used here. Unreviewed, blocked, or
              partial enrichment is excluded from comparison signals.
            </p>
            <ul className='mt-3 list-disc space-y-1 pl-5 text-white/80'>
              <li>
                Enriched + reviewed in this comparison:{' '}
                {governedComparisonSummary.governedReviewedCount}/
                {governedComparisonSummary.includedCount}
              </li>
              <li>
                Safety/interactions present: {governedComparisonSummary.safetySignalsPresentCount}
              </li>
              <li>
                Mechanism coverage: {governedComparisonSummary.mechanismCoveragePresentCount};
                constituent coverage: {governedComparisonSummary.constituentCoveragePresentCount}
              </li>
              <li>
                Uncertainty/conflict flags:{' '}
                {governedComparisonSummary.unresolvedConflictOrUncertaintyCount}
              </li>
            </ul>
            {!governedComparisonSummary.allowComparativeHighlights ? (
              <p className='mt-3 rounded-lg border border-indigo-200/25 bg-black/20 px-3 py-2 text-xs leading-6 text-indigo-50/95'>
                Comparative conclusions are intentionally constrained because governed human-support
                coverage is sparse. Treat this as a side-by-side reference, not a rank order of
                efficacy.
              </p>
            ) : null}
          </section>
          <section className='rounded-xl border border-white/10 bg-white/[0.02] p-3'>
            <p className='text-[11px] text-white/70'>
              Start with <span className='font-semibold text-white'>Reviewed recently</span>, then sort by{' '}
              <span className='font-semibold text-white'>Review freshness</span> to compare safer shortlists first.
            </p>
            <div className='grid gap-2 sm:grid-cols-2'>
              <label className='flex flex-col gap-1 text-xs text-white/75'>
                Filter
                <select
                  value={governedFilter}
                  onChange={event => {
                    const next = event.target.value as GovernedDiscoveryFilter
                    setGovernedFilter(next)
                    trackGovernedEvent({
                      type: 'governed_collection_filter_change',
                      eventAction: 'change',
                      pageType: 'compare_page',
                      entityType: 'compare',
                      surfaceId: 'compare_governed_controls',
                      componentType: 'compare_filter',
                      item: next,
                      reviewedStatus: 'not_applicable',
                      freshnessState: 'not_applicable',
                    })
                  }}
                  className='rounded-lg border border-white/20 bg-slate-950/80 px-2 py-1 text-xs text-white'
                >
                  <option value='all'>All selected herbs</option>
                  <option value='governed_reviewed'>Enriched + reviewed only</option>
                  <option value='human_support'>Human-support evidence labels</option>
                  <option value='review_fresh'>Reviewed recently</option>
                  <option value='safety_present'>Safety cautions present</option>
                  <option value='uncertainty_or_conflict'>Uncertainty/conflict flagged</option>
                  <option value='mechanism_or_constituent'>Mechanism/constituent coverage</option>
                </select>
              </label>
              <label className='flex flex-col gap-1 text-xs text-white/75'>
                Sort
                <select
                  value={governedSort}
                  onChange={event => {
                    const next = event.target.value as GovernedDiscoverySort
                    setGovernedSort(next)
                    trackGovernedEvent({
                      type: 'governed_collection_filter_change',
                      eventAction: 'change',
                      pageType: 'compare_page',
                      entityType: 'compare',
                      surfaceId: 'compare_governed_controls',
                      componentType: 'compare_sort',
                      item: next,
                      reviewedStatus: 'not_applicable',
                      freshnessState: 'not_applicable',
                    })
                  }}
                  className='rounded-lg border border-white/20 bg-slate-950/80 px-2 py-1 text-xs text-white'
                >
                  <option value='default'>Selected order</option>
                  <option value='best_covered_first'>Best covered first (conservative)</option>
                  <option value='evidence_strength'>Evidence strength label</option>
                  <option value='review_freshness'>Review freshness</option>
                </select>
              </label>
            </div>
            <p className='mt-2 text-[11px] text-white/70'>
              Governed-eligible in current selection: {governedDiscovery.eligibility.governedEligible}/
              {governedDiscovery.eligibility.total}
            </p>
          </section>

          {visibleHerbs.length === 0 ? (
            <p className='rounded-xl border border-amber-300/35 bg-amber-500/10 p-3 text-sm text-amber-100'>
              No herbs match this governed filter. Widen the filter to keep side-by-side coverage.
            </p>
          ) : null}

          {visibleHerbs.length > 0 ? (
            <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                <tr>
                  <th className='border-b p-2 text-left'>Field</th>
                  {visibleHerbs.map(h => (
                    <th key={h.slug} className='border-b p-2 text-left'>
                      <div className='font-semibold'>{h.common || h.scientific}</div>
                      <div className='text-sm opacity-70'>{h.scientific}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FIELDS.map(([key, label]) => (
                  <tr key={String(key)}>
                    <td className='border-b p-2 align-top font-medium'>{label}</td>
                    {visibleHerbs.map(h => {
                      const v = (h as any)[key]
                      const text = Array.isArray(v) ? v.join(', ') : (v ?? '')
                      return (
                        <td
                          key={h.slug + String(key)}
                          className='whitespace-pre-wrap border-b p-2 align-top'
                        >
                          {text}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          ) : null}
        </div>
      )}

      <p className='mt-6 text-sm opacity-70'>
        Educational content only, not medical advice. Verify legal status locally. Individual
        responses vary.
      </p>
    </main>
  )
}
