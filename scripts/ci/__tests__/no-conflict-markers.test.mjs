import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * The check is only worth having if it fails on a real conflict, so these tests
 * build a throwaway git repository and put one there. Asserting that the check
 * passes on this repo would prove nothing: it passes on any repo where the scan
 * silently found no files at all.
 */
const SCRIPT = path.resolve('scripts/ci/validate-no-conflict-markers.mjs')

// Assembled by repetition so this test file does not contain a literal marker
// and trip the check it is testing.
const OURS = '<'.repeat(7)
const THEIRS = '>'.repeat(7)
const DIVIDER = '='.repeat(7)

let repo

function git(...args) {
  execFileSync('git', args, { cwd: repo, encoding: 'utf8', stdio: 'pipe' })
}

/** Run the validator inside the temp repo; return exit code and output. */
function run() {
  try {
    const stdout = execFileSync(process.execPath, [SCRIPT], { cwd: repo, encoding: 'utf8', stdio: 'pipe' })
    return { code: 0, output: stdout }
  } catch (error) {
    return { code: error.status ?? 1, output: `${error.stdout || ''}${error.stderr || ''}` }
  }
}

function commitFile(relativePath, contents) {
  const full = path.join(repo, relativePath)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, contents)
  git('add', relativePath)
}

beforeAll(() => {
  repo = fs.mkdtempSync(path.join(os.tmpdir(), 'conflict-marker-check-'))
  git('init', '-q')
  git('config', 'user.email', 'test@example.com')
  git('config', 'user.name', 'test')
})

afterAll(() => {
  if (repo) fs.rmSync(repo, { recursive: true, force: true })
})

describe('conflict marker check', () => {
  it('passes on a repository with no markers', () => {
    commitFile('app/page.tsx', 'export default function Page() { return null }\n')
    commitFile('README.md', `Title\n${DIVIDER}\n\nA setext heading is not a conflict.\n`)
    const { code, output } = run()
    expect(code).toBe(0)
    expect(output).toContain('clean')
  })

  it('fails on a marker in a file TypeScript would never look at', () => {
    // This is the whole reason the check exists. tsc covers .ts and .tsx; a
    // marker in CSS, JSON, or _redirects ships quietly.
    commitFile('styles/theme.css', `body { color: red }\n${OURS} HEAD\n.a { color: blue }\n${DIVIDER}\n.a { color: green }\n${THEIRS} branch\n`)
    const { code, output } = run()
    expect(code).toBe(1)
    expect(output).toContain('styles/theme.css:2')
    expect(output).toContain('styles/theme.css:6')
  })

  it('reports the divider only once a real conflict is established', () => {
    // README.md still holds a bare `=======`. It must stay unreported even now
    // that another file in the same repo is genuinely conflicted.
    const { output } = run()
    expect(output).not.toContain('README.md')
  })

  it('ignores an untracked file, because git would not ship it', () => {
    fs.writeFileSync(path.join(repo, 'scratch.css'), `${OURS} HEAD\n${THEIRS} branch\n`)
    const { output } = run()
    expect(output).not.toContain('scratch.css')
  })
})
