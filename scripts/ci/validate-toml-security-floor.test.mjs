import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

const scriptPath = path.join(process.cwd(), 'scripts/ci/validate-toml-security-floor.mjs')
const tempDirs = []

function makeFixture({ fragmentRules = [] } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'toml-security-floor-'))
  tempDirs.push(root)
  fs.mkdirSync(path.join(root, 'security', 'audit-allowlist.d'), { recursive: true })

  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({
    overrides: { toml: '4.2.0' },
  }), 'utf8')
  fs.writeFileSync(path.join(root, 'package-lock.json'), JSON.stringify({
    packages: {
      'node_modules/toml': {
        version: '4.2.0',
      },
    },
  }), 'utf8')
  fs.writeFileSync(path.join(root, 'security', 'audit-allowlist.json'), JSON.stringify({
    rules: [],
  }), 'utf8')
  fs.writeFileSync(path.join(root, 'security', 'audit-allowlist.d', 'fixture.json'), JSON.stringify({
    rules: fragmentRules,
  }), 'utf8')
  return root
}

function run(root) {
  return spawnSync(process.execPath, [scriptPath], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: {
      ...process.env,
      TOML_SECURITY_REPO_ROOT: root,
    },
  })
}

afterEach(() => {
  for (const root of tempDirs.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

describe('TOML security floor guard', () => {
  it('passes with patched TOML and no #5456 waivers in any allowlist source', () => {
    const result = run(makeFixture())
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('[validate-toml-security-floor] PASS')
  })

  it('fails when a #5456 waiver is restored through an allowlist fragment', () => {
    const result = run(makeFixture({
      fragmentRules: [{
        id: 'restored-toml-waiver',
        package: 'toml',
        severity: 'high',
        followUpIssueUrl: 'https://github.com/Razzleberrytt/hippie-scientist-site/issues/5456',
      }],
    }))

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('remove obsolete #5456 audit allowlist rules')
    expect(result.stderr).toContain('restored-toml-waiver')
  })
})
