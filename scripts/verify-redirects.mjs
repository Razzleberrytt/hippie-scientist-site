import fs from 'node:fs'
import path from 'node:path'

const out = path.resolve('dist', '_redirects')
if (!fs.existsSync(out)) {
  console.error('[verify-redirects] MISSING dist/_redirects — SPA deep links will 404.')
  process.exit(1)
}

const txt = fs.readFileSync(out, 'utf-8')
const lines = txt
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(Boolean)

console.log('[verify-redirects] dist/_redirects present:\n---\n' + txt + '\n---')

const catchAllRule = '/* /index.html 200'
const catchAllIndexes = lines
  .map((line, idx) => (line === catchAllRule ? idx : -1))
  .filter(idx => idx >= 0)

if (catchAllIndexes.length !== 1) {
  console.error(`[verify-redirects] Expected exactly one catch-all rule "${catchAllRule}"`)
  process.exit(1)
}

const catchAllIndex = catchAllIndexes[0]
if (catchAllIndex !== lines.length - 1) {
  console.error('[verify-redirects] Catch-all rule must be the final line in dist/_redirects')
  process.exit(1)
}

const atomIndex = lines.indexOf('/atom.xml /feed.xml 301')
if (atomIndex < 0) {
  console.error('[verify-redirects] Missing required atom.xml redirect')
  process.exit(1)
}
if (atomIndex > catchAllIndex) {
  console.error('[verify-redirects] /atom.xml redirect must appear before the catch-all rule')
  process.exit(1)
}

const aliasAfterCatchAll = lines.find((line, idx) => {
  const isAlias = /^\/(herbs|compounds)\//.test(line) && /\s301$/.test(line)
  return isAlias && idx > catchAllIndex
})

if (aliasAfterCatchAll) {
  console.error(`[verify-redirects] Alias redirect appears after catch-all: ${aliasAfterCatchAll}`)
  process.exit(1)
}

console.log('[verify-redirects] OK')
