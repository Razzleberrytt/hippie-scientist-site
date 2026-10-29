import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

test('reviewed publication floors still block unexpected discovery loss', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'ths-index-budget-'))
  const script = path.resolve('scripts/ci/validate-production-indexability-budget.mjs')
  const budget = JSON.parse(readFileSync('config/indexability-production-budget.json', 'utf8'))
  mkdirSync(path.join(root, 'config'))
  mkdirSync(path.join(root, 'public/data/summary-indexes'), { recursive: true })
  writeFileSync(path.join(root, 'config/indexability-production-budget.json'), JSON.stringify(budget))
  const publish = count => Array.from({ length: count }, (_, i) => ({ slug: `synthetic-${i}`, indexability_status: 'PUBLISH', robots: 'index,follow', sitemap_included: true }))
  const run = (herbs, compounds) => {
    for (const [kind, count] of [['herbs', herbs], ['compounds', compounds]]) writeFileSync(path.join(root, `public/data/summary-indexes/${kind}-summary.json`), JSON.stringify(publish(count)))
    return spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' })
  }
  try {
    assert.equal(run(98, 64).status, 0)
    const rejected = run(budget.minimumHerbs - 1, budget.minimumCompounds)
    assert.equal(rejected.status, 1)
    assert.match(rejected.stderr, /deployment blocker/)
  } finally {
    assert.ok(path.resolve(root).startsWith(path.resolve(tmpdir()) + path.sep))
    assert.ok(path.basename(root).startsWith('ths-index-budget-'))
    rmSync(root, { recursive: true, force: true })
  }
})
