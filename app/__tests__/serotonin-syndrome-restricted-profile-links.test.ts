import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const source = fs.readFileSync(
  path.join(root, 'app', 'learn', 'serotonin-syndrome-supplements', 'page.tsx'),
  'utf8',
)
const baseline = JSON.parse(
  fs.readFileSync(path.join(root, 'config', 'broken-link-baseline.json'), 'utf8'),
)

describe('serotonin syndrome restricted profile links', () => {
  it.each(['dmt', 'harmaline', 'harmine'])(
    'keeps %s as reference-only instead of linking an unpublished profile',
    (slug) => {
      expect(source).toContain(`slug: '${slug}', type: 'compound', profileAvailable: false`)
    },
  )

  it('renders reference-only entities without a profile link', () => {
    expect(source).toContain('e.profileAvailable === false')
    expect(source).toContain('Restricted reference-only compounds remain listed for safety context')
  })

  it('needs no broken-link baseline allowances after removing unpublished profile hrefs', () => {
    expect(baseline.targets).toEqual([])
  })
})
