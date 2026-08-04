import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(join(process.cwd(), 'components/SeeAlsoCluster.tsx'), 'utf8')

describe('SeeAlsoCluster accessibility contract', () => {
  it('keeps relationship and guide links comfortably tappable', () => {
    expect(source).toContain('min-h-11')
    expect(source).toContain('text-sm font-semibold capitalize')
    expect(source).not.toContain('text-[10px]')
  })

  it('provides visible keyboard focus treatment and directional cues', () => {
    expect(source).toContain('focus-visible:ring-2')
    expect(source).toContain('focus-visible:ring-brand-600')
    expect(source).toContain('{entry.label} →')
  })
})
