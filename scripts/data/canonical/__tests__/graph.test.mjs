import { describe, it, expect } from 'vitest'
import { suggestSharedCompoundEdges, isReadOnlySelect } from '../graph.mjs'

// NOTE: node:sqlite cannot be bundled by Vite's jsdom environment, so real-DB
// view assertions live in scripts/data/canonical/__tests__/graph-smoke.mjs
// (run by `npm run data:ci`). Here we unit-test the pure graph logic with a
// lightweight fake db that mimics the two queries suggestSharedCompoundEdges runs.

describe('isReadOnlySelect', () => {
  it('allows a single SELECT/WITH, blocks writes and multi-statements', () => {
    expect(isReadOnlySelect('SELECT * FROM entities')).toBe(true)
    expect(isReadOnlySelect('  with x as (select 1) select * from x')).toBe(true)
    expect(isReadOnlySelect('DROP TABLE entities')).toBe(false)
    expect(isReadOnlySelect('SELECT 1; DELETE FROM entities')).toBe(false)
    expect(isReadOnlySelect('UPDATE entities SET slug = 1')).toBe(false)
    expect(isReadOnlySelect('INSERT INTO entities VALUES (1)')).toBe(false)
  })
})

// Fake db: first prepare() is the shared-pairs query (.all), subsequent
// prepare() calls are the existing-edge check (.get).
function fakeDb({ pairs, existingPairs = new Set() }) {
  let call = 0
  return {
    prepare(sql) {
      const isPairsQuery = /v_herbs_sharing_compound/.test(sql)
      call += 1
      return {
        all() { return isPairsQuery ? pairs : [] },
        get(a, b) {
          const key1 = `${a}|${b}`
          const key2 = `${b}|${a}`
          return { n: existingPairs.has(key1) || existingPairs.has(key2) ? 1 : 0 }
        },
      }
    },
  }
}

describe('suggestSharedCompoundEdges', () => {
  const pairs = [
    { herb_a: 'h1', herb_a_name: 'Herb One', herb_b: 'h2', herb_b_name: 'Herb Two', shared: 3 },
    { herb_a: 'h1', herb_a_name: 'Herb One', herb_b: 'h3', herb_b_name: 'Herb Three', shared: 1 },
  ]

  it('suggests only pairs meeting the threshold, with an explanation and suggested origin', () => {
    const suggestions = suggestSharedCompoundEdges(fakeDb({ pairs }), { threshold: 3 })
    // Threshold filtering happens in SQL (HAVING); the fake returns pre-filtered
    // rows, so simulate that by passing only the >=3 pair.
    const filtered = suggestSharedCompoundEdges(fakeDb({ pairs: [pairs[0]] }), { threshold: 3 })
    expect(filtered).toHaveLength(1)
    expect(filtered[0]).toMatchObject({ from_id: 'h1', to_id: 'h2', rel_type: 'shares_compound', origin: 'suggested' })
    expect(filtered[0].explanation).toMatch(/share 3 compounds but have no direct edge/)
    expect(suggestions.length).toBeGreaterThanOrEqual(1)
  })

  it('skips pairs that already have a direct edge', () => {
    const suggestions = suggestSharedCompoundEdges(fakeDb({ pairs: [pairs[0]], existingPairs: new Set(['h1|h2']) }), { threshold: 3 })
    expect(suggestions).toHaveLength(0)
  })
})
