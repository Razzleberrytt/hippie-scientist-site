import assert from 'node:assert/strict'
import { test } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const repository = process.cwd()

test('indexability authority keys distinguish identical herb and compound slugs', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-indexability-kinds-'))
  const data = path.join(root, 'public', 'data')
  try {
    for (const dir of ['summary-indexes', 'herbs-detail', 'compounds-detail']) {
      fs.mkdirSync(path.join(data, dir), { recursive: true })
    }
    for (const kind of ['herbs', 'compounds']) {
      const isHerb = kind === 'herbs'
      const records = Array.from({ length: 201 }, (_, i) => {
        const slug = i === 0 ? 'shared-slug' : `${isHerb ? 'herb' : 'compound'}-${i}`
        const publish = isHerb || i !== 0
        const status = publish ? 'PUBLISH' : 'BLOCKED'
        const robots = publish ? 'index,follow' : 'noindex,follow'
        return {
          slug,
          indexability_status: status,
          robots,
          sitemap_included: publish,
          indexability_reasons: [],
          governance: { indexingAllowed: publish },
        }
      })
      fs.writeFileSync(path.join(data, 'summary-indexes', `${kind}-summary.json`), JSON.stringify(records))
      for (const record of records) {
        fs.writeFileSync(
          path.join(data, `${kind}-detail`, `${record.slug}.json`),
          JSON.stringify(record),
        )
      }
    }
    const run = (name, args = []) => spawnSync(
      process.execPath,
      [path.join(repository, name), `--data-dir=${data}`, ...args],
      { cwd: root, encoding: 'utf8' },
    )
    const sync = run('scripts/data/sync-detail-indexability.mjs', ['--dry-run'])
    assert.equal(sync.status, 0, sync.stderr)
    assert.match(sync.stdout, /Governance conflicts\s+0/)
    const report = run('scripts/ci/report-indexability-divergence.mjs')
    assert.equal(report.status, 0, report.stderr)
    assert.match(report.stdout, /Divergent\s+0/)
    const output = JSON.parse(fs.readFileSync(path.join(root, 'ops/reports/indexability-divergence.json'), 'utf8'))
    assert.equal(output.divergent, 0)
    assert.equal(output.compared, 402)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})
import assert from 'node:assert/strict'
import { test } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const repository = process.cwd()

test('indexability authority keys distinguish identical herb and compound slugs', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-indexability-kinds-'))
  const data = path.join(root, 'public', 'data')
  try {
    for (const dir of ['summary-indexes', 'herbs-detail', 'compounds-detail']) {
      fs.mkdirSync(path.join(data, dir), { recursive: true })
    }
    for (const kind of ['herbs', 'compounds']) {
      const isHerb = kind === 'herbs'
      const records = Array.from({ length: 201 }, (_, i) => {
        const slug = i === 0 ? 'shared-slug' : `${isHerb ? 'herb' : 'compound'}-${i}`
        const publish = isHerb || i !== 0
        const status = publish ? 'PUBLISH' : 'BLOCKED'
        const robots = publish ? 'index,follow' : 'noindex,follow'
        return {
          slug,
          indexability_status: status,
          robots,
          sitemap_included: publish,
          indexability_reasons: [],
          governance: { indexingAllowed: publish },
        }
      })
      fs.writeFileSync(path.join(data, 'summary-indexes', `${kind}-summary.json`), JSON.stringify(records))
      for (const record of records) {
        fs.writeFileSync(
          path.join(data, `${kind}-detail`, `${record.slug}.json`),
          JSON.stringify(record),
        )
      }
    }
    const run = (name, args = []) => spawnSync(
      process.execPath,
      [path.join(repository, name), `--data-dir=${data}`, ...args],
      { cwd: root, encoding: 'utf8' },
    )
    const sync = run('scripts/data/sync-detail-indexability.mjs', ['--dry-run'])
    assert.equal(sync.status, 0, sync.stderr)
    assert.match(sync.stdout, /Governance conflicts\s+0/)
    const report = run('scripts/ci/report-indexability-divergence.mjs')
    assert.equal(report.status, 0, report.stderr)
    assert.match(report.stdout, /Divergent\s+0/)
    const output = JSON.parse(fs.readFileSync(path.join(root, 'ops/reports/indexability-divergence.json'), 'utf8'))
    assert.equal(output.divergent, 0)
    assert.equal(output.compared, 402)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})
