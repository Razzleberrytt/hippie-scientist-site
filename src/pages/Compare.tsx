import React, { useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useHerbData } from '@/lib/herb-data'
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
    [ids, data]
  )
  const loadingSelection = ids.length > 0 && data.length === 0

  return (
    <main className='mx-auto max-w-6xl px-4 py-8'>
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
        <div className='mt-6 overflow-x-auto'>
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
      )}

      <p className='mt-6 text-sm opacity-70'>
        Educational content only, not medical advice. Verify legal status locally. Individual
        responses vary.
      </p>
    </main>
  )
}
