'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  RISK_MATRIX_DEFINITIONS,
  rowsForRiskMatrix,
  type ResearchMatrixRow,
  type RiskMatrixId,
} from '@/lib/research-matrices'

type MatrixView = 'evidence' | RiskMatrixId

type OutcomeColumn = {
  id: string
  label: string
  matches: (row: ResearchMatrixRow) => boolean
}

const OUTCOME_COLUMNS: OutcomeColumn[] = [
  { id: 'calming-sleep', label: 'Sleep / calming', matches: (row) => row.outcomes.includes('Calming') || row.outcomes.includes('Sedating / sleep') },
  { id: 'focus', label: 'Cognition / focus', matches: (row) => row.outcomes.includes('Cognition / focus') },
  { id: 'energy', label: 'Energy / stimulation', matches: (row) => row.outcomes.includes('Stimulating / energy') },
  { id: 'mood', label: 'Mood', matches: (row) => row.outcomes.includes('Mood') },
  { id: 'metabolic', label: 'Metabolic', matches: (row) => row.outcomes.includes('Metabolic') },
]

const normalize = (value: string) => value.trim().toLowerCase()

function GradeBadge({ grade }: { grade: ResearchMatrixRow['evidenceGrade'] }) {
  const label = grade === 'Avoid/Insufficient' ? 'Avoid / Insufficient' : grade
  return <span className='inline-flex rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-1 text-xs font-bold text-ink'>{label}</span>
}

function OutcomeCell({ mapped }: { mapped: boolean }) {
  return mapped
    ? <span className='font-semibold text-ink' title='This outcome family is explicitly mapped in the structured profile. This does not make the profile-level evidence grade outcome-specific.'>Mapped</span>
    : <span className='text-muted'>—</span>
}

export default function ResearchMatricesClient({ rows }: { rows: ResearchMatrixRow[] }) {
  const [view, setView] = useState<MatrixView>('evidence')
  const [query, setQuery] = useState('')
  const definition = view === 'evidence' ? null : RISK_MATRIX_DEFINITIONS.find((item) => item.id === view) ?? null

  const viewRows = useMemo(() => {
    const base = view === 'evidence' ? rows : rowsForRiskMatrix(rows, view)
    const needle = normalize(query)
    if (!needle) return base
    return base.filter((row) => [row.name, row.slug, row.evidenceGrade, ...row.outcomes, ...row.mechanisms, ...row.safetySignals].join(' ').toLowerCase().includes(needle))
  }, [rows, view, query])

  const evidenceRows = viewRows.slice(0, 60)
  const safetyRows = viewRows.slice(0, 100)

  return (
    <section className='space-y-6'>
      <div className='rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm'>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div>
            <p className='eyebrow-label'>Matrix explorer</p>
            <h2 className='mt-1 text-2xl font-bold text-ink'>Choose a comparison lens</h2>
            <p className='mt-2 max-w-3xl text-sm leading-6 text-muted'>Each matrix is generated from the same canonical runtime records so evidence, outcome, and safety labels do not drift between tools.</p>
          </div>
          <label className='w-full sm:w-72'>
            <span className='mb-1 block text-xs font-bold uppercase tracking-wide text-muted'>Search matrices</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Ingredient, outcome, safety signal…' className='w-full rounded-xl border border-brand-900/15 bg-white px-3 py-2 text-sm text-ink' />
          </label>
        </div>

        <div className='mt-5 flex flex-wrap gap-2' role='group' aria-label='Research matrix view'>
          <button type='button' onClick={() => setView('evidence')} aria-pressed={view === 'evidence'} className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${view === 'evidence' ? 'border-indigo-900 bg-indigo-950 text-white' : 'border-brand-900/10 bg-white text-ink hover:bg-brand-50'}`}>Evidence Matrix</button>
          {RISK_MATRIX_DEFINITIONS.map((item) => (
            <button key={item.id} type='button' onClick={() => setView(item.id)} aria-pressed={view === item.id} className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${view === item.id ? 'border-indigo-900 bg-indigo-950 text-white' : 'border-brand-900/10 bg-white text-ink hover:bg-brand-50'}`}>{item.title}</button>
          ))}
        </div>
      </div>

      {view === 'evidence' ? (
        <section className='space-y-4'>
          <div>
            <p className='eyebrow-label'>Popular supplement evidence</p>
            <h2 className='mt-1 text-2xl font-bold text-ink'>Evidence Matrix</h2>
            <p className='mt-2 max-w-4xl text-sm leading-6 text-muted'>Compare popular and high-signal research records across common outcome families. “Mapped” means the canonical profile explicitly associates that ingredient with the outcome family. The profile evidence grade is shown separately and must not be read as an outcome-specific grade.</p>
          </div>
          <div className='overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/90 shadow-sm'>
            <table className='min-w-[1100px] w-full border-collapse text-left text-sm'>
              <caption className='sr-only'>Popular supplements compared across structured outcome mappings and profile-level evidence</caption>
              <thead className='bg-brand-50/80 text-xs uppercase tracking-wide text-muted'><tr><th className='p-4'>Ingredient</th><th className='p-4'>Profile evidence</th><th className='p-4'>Mapped human studies</th>{OUTCOME_COLUMNS.map((column) => <th key={column.id} className='p-4'>{column.label}</th>)}</tr></thead>
              <tbody>{evidenceRows.map((row) => <tr key={`${row.entityType}:${row.slug}`} className='border-t border-brand-900/10 align-top'><td className='p-4'><Link href={row.href} className='font-bold text-indigo-900 hover:underline'>{row.name}</Link><p className='mt-1 text-xs uppercase tracking-wide text-muted'>{row.entityType}</p></td><td className='p-4'><GradeBadge grade={row.evidenceGrade} /></td><td className='p-4 font-semibold text-ink'>{row.humanEvidenceCount || '—'}</td>{OUTCOME_COLUMNS.map((column) => <td key={column.id} className='p-4'><OutcomeCell mapped={column.matches(row)} /></td>)}</tr>)}</tbody>
            </table>
          </div>
          <p className='text-xs leading-5 text-muted'>A blank cell means that outcome is not mapped in this dataset—not that the ingredient has been proven ineffective for that outcome. Human-study counts are shown only when structured count data is available.</p>
        </section>
      ) : (
        <section className='space-y-4'>
          <div><p className='eyebrow-label'>Safety screening matrix</p><h2 className='mt-1 text-2xl font-bold text-ink'>{definition?.title}</h2><p className='mt-2 max-w-4xl text-sm leading-6 text-muted'>{definition?.description}</p></div>
          <div className='rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-sm leading-6 text-amber-950'><strong>Screening tool, not a safety verdict.</strong> A flag can represent a documented concern, class effect, mechanism-based concern, or precaution depending on the underlying source. Missing data is unknown—not “safe.” Review the ingredient profile and primary sources, and use the <Link href='/safety-checker/' className='font-bold underline'>Safety Checker</Link> for combination screening.</div>
          <div className='overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/90 shadow-sm'>
            <table className='min-w-[1050px] w-full border-collapse text-left text-sm'>
              <caption className='sr-only'>{definition?.title} generated from normalized structured safety signals</caption>
              <thead className='bg-brand-50/80 text-xs uppercase tracking-wide text-muted'><tr><th className='p-4'>Ingredient</th><th className='p-4'>Profile evidence</th><th className='p-4'>Human studies</th><th className='p-4'>Why included</th><th className='p-4'>Other structured safety signals</th></tr></thead>
              <tbody>{safetyRows.map((row) => <tr key={`${row.entityType}:${row.slug}`} className='border-t border-brand-900/10 align-top'><td className='p-4'><Link href={row.href} className='font-bold text-indigo-900 hover:underline'>{row.name}</Link></td><td className='p-4'><GradeBadge grade={row.evidenceGrade} /></td><td className='p-4 font-semibold text-ink'>{row.humanEvidenceCount || '—'}</td><td className='p-4 text-ink'>{definition?.signal ? `Structured ${definition.signal} signal` : 'One or more structured safety / interaction signals'}</td><td className='p-4 text-muted'>{row.safetySignals.join(' · ') || 'No structured signal'}</td></tr>)}</tbody>
            </table>
          </div>
          {!safetyRows.length ? <p className='rounded-xl border border-brand-900/10 bg-white p-5 text-sm text-muted'>No records match this matrix and search term.</p> : null}
        </section>
      )}
    </section>
  )
}
