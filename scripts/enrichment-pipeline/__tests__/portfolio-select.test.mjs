import { describe, expect, it } from 'vitest'
import { portfolioSelect } from '../lib/portfolio-select.mjs'

function item(workpackId, score, aiCitationPriority = 0) {
  return { workpackId, roi: { score }, aiCitationPriority }
}

const ids = rows => rows.map(row => row.workpackId)
const split = rows => ({
  cited: rows.filter(row => Number(row.aiCitationPriority ?? 0) > 0).length,
  exploration: rows.filter(row => Number(row.aiCitationPriority ?? 0) <= 0).length,
})

describe('AI citation portfolio allocation', () => {
  it('treats limit 0 as unlimited while keeping deterministic ROI order', () => {
    expect(ids(portfolioSelect([
      item('b', 20, 5), item('a', 20, 0), item('c', 10, 0),
    ], 0))).toEqual(['a', 'b', 'c'])
  })

  it('preserves the exploration floor at limit 1 when exploration exists', () => {
    expect(ids(portfolioSelect([
      item('winner', 100, 5), item('explore', 50, 0),
    ], 1))).toEqual(['explore'])
  })

  it('rounds a small limit conservatively toward the exploration floor', () => {
    const selected = portfolioSelect([
      item('c1', 100, 5), item('c2', 90, 4), item('e1', 80, 0), item('e2', 70, 0), item('e3', 60, 0),
    ], 3)
    expect(split(selected)).toEqual({ cited: 1, exploration: 2 })
  })

  it('fills unused capacity when cited candidates are insufficient', () => {
    const selected = portfolioSelect([
      item('c1', 100, 5), item('e1', 90, 0), item('e2', 80, 0), item('e3', 70, 0), item('e4', 60, 0),
    ], 5)
    expect(split(selected)).toEqual({ cited: 1, exploration: 4 })
    expect(selected).toHaveLength(5)
  })

  it('fills unused capacity when exploration candidates are insufficient', () => {
    const selected = portfolioSelect([
      item('c1', 100, 5), item('c2', 90, 5), item('c3', 80, 4), item('c4', 70, 4), item('e1', 60, 0),
    ], 5)
    expect(split(selected)).toEqual({ cited: 4, exploration: 1 })
    expect(selected).toHaveLength(5)
  })

  it('locks 65/35 rounding at six cited and four exploration slots for limit 10', () => {
    const ranked = [
      ...Array.from({ length: 8 }, (_, index) => item(`c${index + 1}`, 100 - index, 5)),
      ...Array.from({ length: 6 }, (_, index) => item(`e${index + 1}`, 80 - index, 0)),
    ]
    expect(split(portfolioSelect(ranked, 10))).toEqual({ cited: 6, exploration: 4 })
  })

  it('deduplicates workpack IDs and keeps the highest-ranked instance', () => {
    const selected = portfolioSelect([
      item('dup', 40, 0), item('dup', 100, 5), item('other', 90, 0),
    ], 5)
    expect(ids(selected)).toEqual(['dup', 'other'])
    expect(selected[0].aiCitationPriority).toBe(5)
  })

  it('uses workpack ID as the deterministic tie-breaker', () => {
    expect(ids(portfolioSelect([
      item('zeta', 50, 0), item('alpha', 50, 0), item('beta', 50, 0),
    ], 0))).toEqual(['alpha', 'beta', 'zeta'])
  })

  it('replays citation-disabled scheduling as neutral top-N selection', () => {
    const selected = portfolioSelect([
      item('cited-high', 100, 5), item('cited-next', 90, 5), item('explore', 80, 0),
    ], 2, { citationAdjacentTargetPct: 0, explorationFloorPct: 100 }, { citationEnabled: false })
    expect(ids(selected)).toEqual(['cited-high', 'cited-next'])
  })
})
