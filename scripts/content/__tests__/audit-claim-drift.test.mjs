import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'
import test from 'node:test'

const ROOT = process.cwd()
const SCRIPT = path.join(ROOT, 'scripts/content/audit-claim-drift.mjs')

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

function commitAll(cwd, message) {
  git(cwd, 'add', '.')
  git(cwd, 'commit', '-m', message)
}

function runAudit(cwd, base) {
  return spawnSync(
    process.execPath,
    ['scripts/content/audit-claim-drift.mjs', `--changed-from=${base}`, '--fail-on-critical'],
    { cwd, encoding: 'utf8' },
  )
}

test('PR claim gate ignores historical critical matches but blocks new component critical matches', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'claim-drift-'))
  try {
    fs.mkdirSync(path.join(temp, 'scripts/content'), { recursive: true })
    fs.mkdirSync(path.join(temp, 'app/guides/example'), { recursive: true })
    fs.mkdirSync(path.join(temp, 'components'), { recursive: true })
    fs.copyFileSync(SCRIPT, path.join(temp, 'scripts/content/audit-claim-drift.mjs'))

    git(temp, 'init')
    git(temp, 'config', 'user.email', 'ci@example.invalid')
    git(temp, 'config', 'user.name', 'CI')

    fs.writeFileSync(
      path.join(temp, 'app/guides/example/page.tsx'),
      "export default function Page() { return <p>Take 500 mg nightly.</p> }\n",
    )
    fs.writeFileSync(path.join(temp, 'components/Harmless.tsx'), "export const Harmless = () => <p>Context only.</p>\n")
    commitAll(temp, 'baseline with historical debt')

    fs.appendFileSync(path.join(temp, 'app/guides/example/page.tsx'), '// harmless maintenance edit\n')
    commitAll(temp, 'unrelated edit')

    const historical = runAudit(temp, 'HEAD~1')
    assert.equal(historical.status, 0, historical.stderr || historical.stdout)
    const historicalReport = JSON.parse(fs.readFileSync(path.join(temp, 'reports/content-claim-drift.json'), 'utf8'))
    assert.ok(historicalReport.counts.critical >= 1)
    assert.equal(historicalReport.blockingCriticalCount, 0)

    fs.writeFileSync(
      path.join(temp, 'components/NewUnsafeClaim.tsx'),
      "export const NewUnsafeClaim = () => <p>Take 750 mg every night.</p>\n",
    )
    commitAll(temp, 'add new component claim')

    const introduced = runAudit(temp, 'HEAD~1')
    assert.equal(introduced.status, 1)
    const introducedReport = JSON.parse(fs.readFileSync(path.join(temp, 'reports/content-claim-drift.json'), 'utf8'))
    assert.equal(introducedReport.blockingCriticalCount, 1)
    assert.equal(introducedReport.findings.find((finding) => finding.introduced)?.file, 'components/NewUnsafeClaim.tsx')
  } finally {
    fs.rmSync(temp, { recursive: true, force: true })
  }
})
