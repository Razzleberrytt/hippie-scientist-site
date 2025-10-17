import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import QuickFillModal from '../components/QuickFillModal'
import { useHerbData } from '@/lib/herb-data'
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
  const coerce = (v: any) => (Array.isArray(v) ? v.join('; ') : (v ?? ''))
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
  const data = useHerbData()
  const [coverage, setCoverage] = useState<Coverage>({})
  const [missing, setMissing] = useState<Herb[]>([])
  const [total, setTotal] = useState(0)
  const [showMissingOf, setShowMissingOf] = useState<string[]>([])
  const [filtered, setFiltered] = useState<Herb[]>([])
  const [editRow, setEditRow] = useState<Herb | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [patchedData, setPatchedData] = useState<Herb[] | null>(null)
  const currentData = useMemo(() => patchedData ?? data, [patchedData, data])

  useEffect(() => {
    const rows = currentData
    const n = rows.length
    setTotal(n)

    const allFields = [...KEY_FIELD_DEFS, ...OPTIONAL_FIELD_DEFS]
    const nextCoverage: Coverage = {}

    allFields.forEach(({ key }) => {
      nextCoverage[String(key)] = rows.reduce((acc, row) => acc + (hasVal(row[key]) ? 1 : 0), 0)
    })

    setCoverage(nextCoverage)

    const missingRows = rows.filter(row => KEY_FIELDS.some(key => !hasVal((row as any)[key])))

    setMissing(missingRows)
  }, [currentData])

  useEffect(() => {
    const rows = currentData
    if (showMissingOf.length === 0) {
      setFiltered([])
    } else {
      setFiltered(rows.filter(r => showMissingOf.every(k => !hasVal((r as any)[k]))))
    }
  }, [showMissingOf, currentData])

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

  const openQuickFill = (row: Herb) => {
    setEditRow(row)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditRow(null)
  }

  const applyPatch = (patch: Record<string, string>) => {
    if (!editRow) return
    const sourceData = patchedData ?? data
    let changed = false
    const newData = sourceData.map(r => {
      if (r.slug !== editRow.slug) return r
      const updated = { ...r }
      let rowChanged = false
      for (const [key, value] of Object.entries(patch)) {
        const trimmed = value.trim()
        if (trimmed) {
          ;(updated as any)[key] = trimmed
          rowChanged = true
        }
      }
      if (rowChanged) {
        changed = true
        return updated
      }
      return r
    })

    if (changed) {
      setPatchedData(newData)
    }

    closeModal()
  }

  const exportJSON = () => {
    const rowsToExport = patchedData ?? data
    const blob = new Blob([JSON.stringify(rowsToExport, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'herbs_patched.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <main className='text-sand mx-auto max-w-6xl px-4 py-10'>
      <header className='mb-10'>
        <h1 className='text-gradient mb-3 text-4xl font-bold'>📊 Herb Dataset Coverage</h1>
        <p className='text-sand/80 max-w-3xl text-sm'>
          This internal dashboard summarizes the completeness of the normalized herb dataset used
          across the site. Each metric reflects how many of the {total || '—'} total entries have
          non-empty data for a given field.
        </p>
      </header>

      <div className='mb-6 rounded-lg border bg-gray-900 p-3'>
        <p className='mb-2 text-sm font-semibold'>
          Filter: show herbs missing ALL of the selected fields
        </p>
        <div className='flex flex-wrap gap-3'>
          {[...KEY_FIELDS, ...OPTIONAL_FIELDS].map(f => {
            const checked = showMissingOf.includes(f)
            return (
              <label
                key={f}
                className='flex cursor-pointer items-center gap-2 rounded-md bg-gray-800 px-2 py-1 text-xs'
              >
                <input
                  type='checkbox'
                  checked={checked}
                  onChange={e =>
                    setShowMissingOf(prev =>
                      e.target.checked ? [...prev, f] : prev.filter(x => x !== f)
                    )
                  }
                />
                <span>{f}</span>
              </label>
            )
          })}
        </div>

        <div className='mt-3 flex items-center gap-3 text-xs opacity-80'>
          <span>Selected: {showMissingOf.length || 0}</span>
          <span>•</span>
          <span>Matches: {filtered.length || 0}</span>
          {filtered.length > 0 && (
            <button
              onClick={() =>
                exportCSV(filtered, ['slug', 'common', 'scientific', ...showMissingOf])
              }
              className='ml-auto rounded-md border px-2 py-1 hover:bg-gray-800'
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
              <tr className='text-sand/60 bg-black/60 text-left uppercase tracking-wide'>
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
                    <td className='text-sand p-3 font-medium'>{label || key}</td>
                    <td className='text-sand/80 p-3 text-right'>
                      {count} / {total}
                    </td>
                    <td className='text-sand/80 p-3 text-right'>{formatPercent(String(key))}</td>
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
              <tr className='text-sand/60 bg-black/60 text-left uppercase tracking-wide'>
                <th className='p-3 font-medium'>Field</th>
                <th className='p-3 text-right font-medium'>Filled</th>
                <th className='p-3 text-right font-medium'>Coverage</th>
              </tr>
            </thead>
            <tbody>
              {sortedOptionalFields.map(({ key, label, coverage: count }) => (
                <tr key={String(key)} className='odd:bg-white/5 even:bg-black/30'>
                  <td className='text-sand p-3 font-medium'>{label || key}</td>
                  <td className='text-sand/80 p-3 text-right'>
                    {count} / {total}
                  </td>
                  <td className='text-sand/80 p-3 text-right'>{formatPercent(String(key))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className='mb-2 text-xl font-semibold'>
          {showMissingOf.length === 0
            ? `Missing Key Field Rows (${missing.length})`
            : `Rows missing: ${showMissingOf.join(', ')} (${filtered.length})`}
        </h2>

        {(showMissingOf.length === 0 ? missing.length === 0 : filtered.length === 0) ? (
          <p className='opacity-70'>No rows match.</p>
        ) : (
          <div className='max-h-[480px] overflow-x-auto rounded-lg border'>
            <table className='w-full border-collapse border text-xs'>
              <thead>
                <tr className='sticky top-0 bg-gray-800 text-left'>
                  <th className='border p-2'>Slug</th>
                  <th className='border p-2'>Common</th>
                  <th className='border p-2'>Missing Fields</th>
                  <th className='border p-2'>Open</th>
                </tr>
              </thead>
              <tbody>
                {(showMissingOf.length === 0 ? missing : filtered).map((r, i) => {
                  const miss = KEY_FIELDS.filter(k => !hasVal((r as any)[k]))
                  return (
                    <tr key={r.slug || i} className='odd:bg-gray-900 even:bg-gray-800'>
                      <td className='border p-2'>{r.slug}</td>
                      <td className='border p-2'>{r.common}</td>
                      <td className='border p-2'>{miss.join(', ')}</td>
                      <td className='flex gap-2 border p-2'>
                        <Link to={`/herb/${r.slug}`} className='underline'>
                          Details →
                        </Link>
                        <button
                          onClick={() => openQuickFill(r)}
                          className='text-xs text-green-400 underline hover:text-green-300'
                        >
                          Quick-fill
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {patchedData && (
        <div className='mt-8 flex justify-end'>
          <button
            onClick={exportJSON}
            className='rounded-lg bg-green-700 px-4 py-2 hover:bg-green-600'
          >
            💾 Download Patched herbs.normalized.json
          </button>
        </div>
      )}

      {showModal && editRow && (
        <QuickFillModal
          row={editRow}
          missing={KEY_FIELDS.filter(key => !hasVal((editRow as any)[key]))}
          onSave={applyPatch}
          onCancel={closeModal}
        />
      )}

      <footer className='text-sand/70 mt-12 text-sm'>
        <Link to='/herbs' className='text-sky-300 underline-offset-4 hover:underline'>
          ← Back to database
        </Link>
      </footer>
    </main>
  )
}
