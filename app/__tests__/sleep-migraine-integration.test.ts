import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()

function read(relativePath: string) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8').replace(/\s+/g, ' ')
}

describe('migraine sleep research integration', () => {
  it('keeps the migraine evidence review discoverable from the canonical sleep hub', () => {
    const hub = read('app/guides/sleep/page.tsx')
    expect(hub).toContain('/articles/migraine-and-sleep/')
    expect(hub).toContain('Migraine and Sleep')
  })

  it('preserves the bidirectional and measurement guardrails', () => {
    const migraine = read('content/articles/migraine-and-sleep.md')

    expect(migraine).toMatch(/bidirectional/i)
    expect(migraine).toMatch(/objective.*heterogeneous|heterogeneous.*objective/i)
    expect(migraine).toMatch(/CBT-I helps insomnia in migraine.*stronger than.*migraine|CBT-I.*insomnia.*stronger.*migraine/i)
    expect(migraine).toMatch(/morning headache does not automatically mean sleep apnea/i)
  })
})
