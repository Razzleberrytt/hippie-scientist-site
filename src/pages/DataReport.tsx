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

const KEY_FIELD_DEFS: FieldDefinition[] = [
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

const OPTIONAL_FIELD_DEFS: FieldDefinition[] = [
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
  { key: 'regiontags', label: 'Region Tags' },
  { key: 'subcategory', label: 'Subcategory' },
]

const KEY_FIELDS = [
  'common',
  'scientific',
  'category',
  'intensity',
  'region',
  'effects',
  'description',
  'legalstatus',
  'compounds',
  'tags',
]

const OPTIONAL_FIELDS = [
  'mechanism',
  'pharmacology',
  'preparations',
  'dosage',
  'duration',
  'onset',
  'therapeutic',
  'interactions',
  'contraindications',
  'sideeffects',
  'safety',
  'toxicity',
  'toxicity_ld50',
  'schedule',
  'legalnotes',
  'sources',
  'image',
  'regiontags',
  'subcategory',
]

function hasVal(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.filter(Boolean).length > 0
  }
  if (value == null) return false
  if (typeof value === 'object') {
    return Object.values(value).some(hasVal)
  }
  return !!String(value ?? '').trim()
}

function exportCSV(rows: any[], headers: string[]) {
  const esc = (s: any) => `"${String(s ?? '').replace(/"/g, '""')}"`
  const coerce = (v: any) => (Array.isArray(v) ? v.join('; ') : v ?? '')
  const lines = [
    headers.map(esc).join(','),
    ...rows.map(r => headers.map(h => esc(coerce(r[h]))).join(',')),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `herb_report_${headers.join('_')}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function DataReport() {
  const [coverage, setCoverage] = useState<Coverage>({})
  const [missing, setMissing] = useState<Herb[]>([])
  const [total, setTotal] = useState(0)
  const [showMissingOf, setShowMissingOf] = useState<string[]>([])
  const [filtered, setFiltered] = useState<any[]>([])

  useEffect(() => {
    const rows = data as Herb[]
    const n = rows.length
    setTotal(n)

    const allFields = [...KEY_FIELD_DEFS, ...OPTIONAL_FIELD_DEFS]
    const nextCoverage: Coverage = {}

    allFields.forEach(({ key }) => {
      nextCoverage[String(key)] = rows.reduce((acc, row) => acc + (hasVal(row[key]) ? 1 : 0), 0)
    })

    setCoverage(nextCoverage)

    const missingRows = rows.filter(row =>
      KEY_FIELDS.some(key => !hasVal((row as any)[key]))
    )

    setMissing(missingRows)
  }, [])

  useEffect(() => {
    const rows = data as Herb[]
    if (showMissingOf.length === 0) {
      setFiltered([])
    } else {
      setFiltered(rows.filter(r => showMissingOf.every(k => !hasVal((r as any)[k]))))
    }
  }, [showMissingOf])

  const sortedOptionalFields = useMemo(
    () =>
      OPTIONAL_FIELD_DEFS.map(field => ({
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

      <div className='mb-6 border rounded-lg p-3 bg-gray-900'>
        <p className='text-sm font-semibold mb-2'>Filter: show herbs missing ALL of the selected fields</p>
        <div className='flex flex-wrap gap-3'>
          {[...KEY_FIELDS, ...OPTIONAL_FIELDS].map(f => {
            const checked = showMissingOf.includes(f)
            return (
              <label key={f} className='flex items-center gap-2 text-xs bg-gray-800 px-2 py-1 rounded-md cursor-pointer'>
                <input
                  type='checkbox'
                  checked={checked}
                  onChange={e =>
                    setShowMissingOf(prev =>
                      e.target.checked ? [...prev, f] : prev.filter(x => x !== f),
                    )
                  }
                />
                <span>{f}</span>
              </label>
            )
          })}
        </div>

        <div className='mt-3 text-xs opacity-80 flex items-center gap-3'>
          <span>Selected: {showMissingOf.length || 0}</span>
          <span>•</span>
          <span>Matches: {filtered.length || 0}</span>
          {filtered.length > 0 && (
            <button
              onClick={() => exportCSV(filtered, ['slug', 'common', 'scientific', ...showMissingOf])}
              className='ml-auto border px-2 py-1 rounded-md hover:bg-gray-800'
            >
              Export CSV (current)
            </button>
          )}
        </div>
      </div>

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
              {KEY_FIELD_DEFS.map(({ key, label }) => {
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
        <h2 className='text-xl font-semibold mb-2'>
          {showMissingOf.length === 0
            ? `Missing Key Field Rows (${missing.length})`
            : `Rows missing: ${showMissingOf.join(', ')} (${filtered.length})`}
        </h2>

        {(showMissingOf.length === 0 ? missing.length === 0 : filtered.length === 0) ? (
          <p className='opacity-70'>No rows match.</p>
        ) : (
          <div className='overflow-x-auto max-h-[480px] border rounded-lg'>
            <table className='w-full text-xs border-collapse border'>
              <thead>
                <tr className='bg-gray-800 text-left sticky top-0'>
                  <th className='p-2 border'>Slug</th>
                  <th className='p-2 border'>Common</th>
                  <th className='p-2 border'>Missing Fields</th>
                  <th className='p-2 border'>Open</th>
                </tr>
              </thead>
              <tbody>
                {(showMissingOf.length === 0 ? missing : filtered).map((r, i) => {
                  const miss = KEY_FIELDS.filter(k => !hasVal((r as any)[k]))
                  return (
                    <tr key={r.slug || i} className='odd:bg-gray-900 even:bg-gray-800'>
                      <td className='p-2 border'>{r.slug}</td>
                      <td className='p-2 border'>{r.common}</td>
                      <td className='p-2 border'>{miss.join(', ')}</td>
                      <td className='p-2 border'>
                        <Link to={`/herb/${r.slug}`} className='underline'>Details →</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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
