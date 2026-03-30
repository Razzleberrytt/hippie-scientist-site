import React, { useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Meta from '@/components/Meta'
import { useHerbData } from '@/lib/herb-data'
import { buildGovernedCollectionSummary } from '@/lib/collectionEnrichment'
import type { Herb } from '@/types'

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
  const loadingSelection = ids.length > 0 && data.length === 0
  const governedComparisonSummary = useMemo(
    () =>
      buildGovernedCollectionSummary(
        herbs.map(herb => ({
          entityType: 'herb',
          entitySlug: herb.slug,
          entityName: herb.common || herb.scientific || herb.slug,
        })),
      ),
    [herbs],
  )

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

          <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                <tr>
                  <th className='border-b p-2 text-left'>Field</th>
                  {herbs.map(h => (
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
                    {herbs.map(h => {
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
        </div>
      )}

      <p className='mt-6 text-sm opacity-70'>
        Educational content only, not medical advice. Verify legal status locally. Individual
        responses vary.
      </p>
    </main>
  )
}
