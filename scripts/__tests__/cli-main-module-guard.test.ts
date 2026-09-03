import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

// `import.meta.url === `file://${process.argv[1]}`` is false on Windows: Node
// sets process.argv[1] to a backslash drive path (`C:\repo\script.mjs`) while
// import.meta.url is `file:///C:/repo/script.mjs`. Scripts guarded that way
// silently no-op and still exit 0, which is how `npm run data:export` came to
// leave a stale committed export in data/generated/site/ while reporting
// success. The same trap catches `path.resolve(new URL(import.meta.url).pathname)`,
// which resolves `/C:/repo/...` against the current drive.
//
// The portable form is `pathToFileURL(process.argv[1]).href`.
const SCAN_ROOTS = ['scripts', 'agent', 'lib', 'functions', 'config', 'data']
const SCAN_EXTS = new Set(['.mjs', '.cjs', '.js', '.ts', '.tsx'])
const IGNORED_DIRS = new Set(['node_modules', '.next', 'out', 'dist', 'coverage', '.git'])

// The stub only documents the historical pattern inside a comment; the guard it
// describes now lives in build-interaction-data.mjs in portable form.
const ALLOWED = new Set([
  'scripts/data/xlsx-optional-dependency-stub.mjs',
  'scripts/data/build-search-index.test.mjs',
  'scripts/__tests__/cli-main-module-guard.test.ts',
])

function collect(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) collect(full, out)
    else if (SCAN_EXTS.has(path.extname(entry.name))) out.push(full)
  }
  return out
}

const files = SCAN_ROOTS.flatMap((root) => collect(path.join(process.cwd(), root)))
  .map((full) => path.relative(process.cwd(), full).split(path.sep).join('/'))
  .filter((rel) => !ALLOWED.has(rel))

describe('CLI main-module guards are cross-platform', () => {
  it('scans a non-trivial number of source files', () => {
    expect(files.length).toBeGreaterThan(100)
  })

  it('never compares import.meta.url to a raw file:// + process.argv[1] string', () => {
    const offenders = files.filter((rel) =>
      fs.readFileSync(rel, 'utf8').includes('`file://${process.argv[1]}`'),
    )
    expect(offenders).toEqual([])
  })

  it('never path.resolve()s a file URL pathname to compare against argv[1]', () => {
    const offenders = files.filter((rel) =>
      /path\.resolve\(\s*new URL\(import\.meta\.url\)\.pathname\s*\)/.test(
        fs.readFileSync(rel, 'utf8'),
      ),
    )
    expect(offenders).toEqual([])
  })
})
