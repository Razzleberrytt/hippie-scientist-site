import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { loadCanonicalLocalizedProfile } from '../localized-profile'

const roots: string[] = []

function makeRoot(kind: 'herb' | 'compound', slug: string, name: string) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'localized-profile-cache-'))
  roots.push(root)
  const directory = kind === 'herb' ? 'herbs-detail' : 'compounds-detail'
  const dir = path.join(root, 'public', 'data', directory)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `${slug}.json`), JSON.stringify({ slug, name }))
  return root
}

afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true })
})

describe('canonical localized profile cache', () => {
  it('reuses the same parsed profile for repeated root/kind/slug lookups', () => {
    const root = makeRoot('herb', 'ashwagandha', 'Ashwagandha')
    const first = loadCanonicalLocalizedProfile('herb', 'ashwagandha', root)
    fs.writeFileSync(
      path.join(root, 'public', 'data', 'herbs-detail', 'ashwagandha.json'),
      JSON.stringify({ slug: 'ashwagandha', name: 'Changed on disk' }),
    )
    const second = loadCanonicalLocalizedProfile('herb', 'ashwagandha', root)

    expect(second).toBe(first)
    expect(second.name).toBe('Ashwagandha')
  })

  it('isolates cache entries by root', () => {
    const a = makeRoot('herb', 'ashwagandha', 'Root A')
    const b = makeRoot('herb', 'ashwagandha', 'Root B')
    expect(loadCanonicalLocalizedProfile('herb', 'ashwagandha', a).name).toBe('Root A')
    expect(loadCanonicalLocalizedProfile('herb', 'ashwagandha', b).name).toBe('Root B')
  })

  it('isolates herb and compound entries with the same slug', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'localized-profile-kind-cache-'))
    roots.push(root)
    for (const [directory, name] of [['herbs-detail', 'Herb'], ['compounds-detail', 'Compound']] as const) {
      const dir = path.join(root, 'public', 'data', directory)
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(path.join(dir, 'shared.json'), JSON.stringify({ slug: 'shared', name }))
    }

    expect(loadCanonicalLocalizedProfile('herb', 'shared', root).name).toBe('Herb')
    expect(loadCanonicalLocalizedProfile('compound', 'shared', root).name).toBe('Compound')
  })

  it('validates slug mismatch before caching', () => {
    const root = makeRoot('herb', 'expected', 'Mismatch')
    fs.writeFileSync(
      path.join(root, 'public', 'data', 'herbs-detail', 'expected.json'),
      JSON.stringify({ slug: 'wrong', name: 'Mismatch' }),
    )
    expect(() => loadCanonicalLocalizedProfile('herb', 'expected', root)).toThrow(
      'Canonical localized profile mismatch for herb:expected',
    )
  })
})
