import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const script = path.join(repoRoot, 'scripts', 'seo', 'apply-redirect-overrides.mjs')

const workspaces: string[] = []

function makeWorkspace(redirects: string, overrides: Record<string, string>) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'redirect-overrides-'))
  workspaces.push(dir)

  fs.mkdirSync(path.join(dir, 'out'), { recursive: true })
  fs.writeFileSync(path.join(dir, 'out', '_redirects'), redirects)

  const overridesDir = path.join(dir, 'public', 'redirect-overrides')
  fs.mkdirSync(overridesDir, { recursive: true })
  for (const [name, contents] of Object.entries(overrides)) {
    fs.writeFileSync(path.join(overridesDir, name), contents)
  }

  return dir
}

function run(dir: string) {
  execFileSync('node', [script], { cwd: dir, stdio: 'pipe' })
  return fs.readFileSync(path.join(dir, 'out', '_redirects'), 'utf8')
}

function activeRules(contents: string) {
  return contents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
}

afterEach(() => {
  while (workspaces.length) {
    fs.rmSync(workspaces.pop()!, { recursive: true, force: true })
  }
})

describe('apply-redirect-overrides chain flattening', () => {
  it('collapses rules that an override turns into a two-hop chain', () => {
    // The override retires /guides/focus/old/, which turns the pre-existing
    // rule pointing at it into a chain. Cloudflare does not follow chains
    // server-side, so both rules must land on the final destination directly.
    const dir = makeWorkspace(
      '/legacy-focus/ /guides/focus/old/ 301\n',
      { '001-consolidation.txt': '/guides/focus/old/ /guides/focus/new/ 301\n' },
    )

    const rules = activeRules(run(dir))

    expect(rules).toContain('/legacy-focus/ /guides/focus/new/ 301')
    expect(rules).not.toContain('/legacy-focus/ /guides/focus/old/ 301')
  })

  it('flattens absolute www rules without mistaking the protocol colon for a placeholder', () => {
    const dir = makeWorkspace(
      'https://www.thehippiescientist.net/x https://thehippiescientist.net/guides/focus/old/ 301\n',
      { '001-consolidation.txt': '/guides/focus/old/ /guides/focus/new/ 301\n' },
    )

    const rules = activeRules(run(dir))

    expect(rules).toContain(
      'https://www.thehippiescientist.net/x https://thehippiescientist.net/guides/focus/new/ 301',
    )
  })

  it('leaves splat rules untouched', () => {
    const splat = 'https://www.thehippiescientist.net/* https://thehippiescientist.net/:splat 301'
    const dir = makeWorkspace(`${splat}\n`, {
      '001-consolidation.txt': '/guides/focus/old/ /guides/focus/new/ 301\n',
    })

    expect(activeRules(run(dir))).toContain(splat)
  })

  it('is idempotent so repeated builds cannot grow the file past the Cloudflare rule ceiling', () => {
    const dir = makeWorkspace('/legacy-focus/ /guides/focus/old/ 301\n', {
      '001-consolidation.txt': '/guides/focus/old/ /guides/focus/new/ 301\n',
    })

    const first = activeRules(run(dir))
    const second = activeRules(run(dir))

    expect(second).toEqual(first)
  })
})
