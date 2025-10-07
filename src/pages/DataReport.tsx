import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import data from '../data/herbs/herbs.normalized.json'
import type { Herb } from '../types'

type Coverage = Record<string, number>

type FieldDefinition = {
  key: keyof Herb | string
  label?: string
  description?: string
}

const REQUIRED_FIELDS: FieldDefinition[] = [
  { key: 'common', label: 'Common Name' },
  { key: 'scientific', label: 'Scientific Name' },
  { key: 'category', label: 'Category' },
  { key: 'intensity', label: 'Intensity' },
  { key: 'region', label: 'Region' },
  { key: 'effects', label: 'Effects' },
  { key: 'description', label: 'Description' },
  { key: 'legalstatus', label: 'Legal Status' },
  { key: 'compounds', label: 'Compounds' },
  { key: 'tags', label: 'Tags' },
]

const OPTIONAL_FIELDS: FieldDefinition[] = [
  { key: 'mechanism', label: 'Mechanism' },
  { key: 'pharmacology', label: 'Pharmacology' },
  { key: 'preparations', label: 'Preparations' },
  { key: 'dosage', label: 'Dosage' },
  { key: 'duration', label: 'Duration' },
  { key: 'onset', label: 'Onset' },
  { key: 'therapeutic', label: 'Therapeutic Uses' },
  { key: 'interactions', label: 'Interactions' },
  { key: 'contraindications', label: 'Contraindications' },
  { key: 'sideeffects', label: 'Side Effects' },
  { key: 'safety', label: 'Safety' },
  { key: 'toxicity', label: 'Toxicity' },
  { key: 'toxicity_ld50', label: 'Toxicity (LD50)' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'legalnotes', label: 'Legal Notes' },
  { key: 'sources', label: 'Sources' },
  { key: 'image', label: 'Image' },
]

const hasValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).length > 0
  }
  if (value == null) return false
  if (typeof value === 'object') {
    return Object.values(value).some(hasValue)
  }
  return String(value).trim().length > 0
}

export default function DataReport() {
  const [coverage, setCoverage] = useState<Coverage>({})
  const [missing, setMissing] = useState<Herb[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const rows = data as Herb[]
    const n = rows.length
    setTotal(n)

    const allFields = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS]
    const nextCoverage: Coverage = {}

    allFields.forEach(({ key }) => {
      nextCoverage[String(key)] = rows.reduce((acc, row) => acc + (hasValue(row[key]) ? 1 : 0), 0)
    })

    setCoverage(nextCoverage)

    const missingRows = rows.filter(row =>
      REQUIRED_FIELDS.some(({ key }) => !hasValue(row[key]))
    )

    setMissing(missingRows)
  }, [])

  const sortedOptionalFields = useMemo(
    () =>
      OPTIONAL_FIELDS.map(field => ({
        ...field,
        coverage: coverage[String(field.key)] ?? 0,
      })).sort((a, b) => b.coverage - a.coverage || String(a.key).localeCompare(String(b.key))),
    [coverage]
  )

  const formatPercent = (key: string) => {
    if (!total) return '-'
    const count = coverage[key] ?? 0
    return `${((count / total) * 100).toFixed(1)}%`
  }

  return (
    <main className='mx-auto max-w-6xl px-4 py-10 text-sand'>
      <header className='mb-10'>
        <h1 className='text-gradient mb-3 text-4xl font-bold'>📊 Herb Dataset Coverage</h1>
        <p className='max-w-3xl text-sm text-sand/80'>
          This internal dashboard summarizes the completeness of the normalized herb dataset used across the
          site. Each metric reflects how many of the {total || '—'} total entries have non-empty data for a
          given field.
        </p>
      </header>

      <section className='mb-12'>
        <h2 className='mb-3 text-2xl font-semibold text-lime-300'>Key Fields</h2>
        <div className='overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-lg backdrop-blur'>
          <table className='w-full table-fixed border-collapse text-sm'>
            <thead>
              <tr className='bg-black/60 text-left uppercase tracking-wide text-sand/60'>
                <th className='p-3 font-medium'>Field</th>
                <th className='p-3 text-right font-medium'>Filled</th>
                <th className='p-3 text-right font-medium'>Coverage</th>
              </tr>
            </thead>
            <tbody>
              {REQUIRED_FIELDS.map(({ key, label }) => {
                const count = coverage[String(key)] ?? 0
                return (
                  <tr key={String(key)} className='odd:bg-white/5 even:bg-black/30'>
                    <td className='p-3 font-medium text-sand'>{label || key}</td>
                    <td className='p-3 text-right text-sand/80'>
                      {count} / {total}
                    </td>
                    <td className='p-3 text-right text-sand/80'>{formatPercent(String(key))}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-12'>
        <h2 className='mb-3 text-2xl font-semibold text-sky-300'>Optional Fields</h2>
        <div className='overflow-hidden rounded-xl border border-white/10 bg-black/30 shadow-lg backdrop-blur'>
          <table className='w-full table-fixed border-collapse text-sm'>
            <thead>
              <tr className='bg-black/60 text-left uppercase tracking-wide text-sand/60'>
                <th className='p-3 font-medium'>Field</th>
                <th className='p-3 text-right font-medium'>Filled</th>
                <th className='p-3 text-right font-medium'>Coverage</th>
              </tr>
            </thead>
            <tbody>
              {sortedOptionalFields.map(({ key, label, coverage: count }) => (
                <tr key={String(key)} className='odd:bg-white/5 even:bg-black/30'>
                  <td className='p-3 font-medium text-sand'>{label || key}</td>
                  <td className='p-3 text-right text-sand/80'>
                    {count} / {total}
                  </td>
                  <td className='p-3 text-right text-sand/80'>{formatPercent(String(key))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className='mb-4 flex items-center justify-between gap-4'>
          <h2 className='text-2xl font-semibold text-rose-300'>Missing Key Field Rows</h2>
          <span className='rounded-full bg-rose-500/20 px-3 py-1 text-sm font-semibold text-rose-200'>
            {missing.length}
          </span>
        </div>
        {missing.length === 0 ? (
          <div className='rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-6 text-emerald-100'>
            All rows have the required key fields. ✅
          </div>
        ) : (
          <div className='overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-lg backdrop-blur'>
            <div className='max-h-[420px] overflow-auto'>
              <table className='w-full table-fixed border-collapse text-xs'>
                <thead>
                  <tr className='sticky top-0 bg-black/80 text-left uppercase tracking-wide text-sand/60'>
                    <th className='p-3 font-medium'>Slug</th>
                    <th className='p-3 font-medium'>Common</th>
                    <th className='p-3 font-medium'>Missing Fields</th>
                  </tr>
                </thead>
                <tbody>
                  {missing.map(herb => {
                    const missingFields = REQUIRED_FIELDS.filter(({ key }) => !hasValue(herb[key])).map(({ label, key }) =>
                      label || String(key)
                    )
                    return (
                      <tr key={herb.slug} className='odd:bg-white/5 even:bg-black/30 text-sand'>
                        <td className='p-3 font-mono text-xs text-sand/70'>{herb.slug}</td>
                        <td className='p-3 font-medium'>{herb.common || herb.name || '—'}</td>
                        <td className='p-3 text-sand/80'>{missingFields.join(', ')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <footer className='mt-12 text-sm text-sand/70'>
        <Link to='/database' className='text-sky-300 underline-offset-4 hover:underline'>
          ← Back to database
        </Link>
      </footer>
    </main>
  )
}
