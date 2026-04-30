import fs from 'node:fs'
import path from 'node:path'

const staticDir = process.env.STATIC_OUTPUT_DIR || 'out'
const out = path.resolve(staticDir, '_redirects')
if (!fs.existsSync(out)) {
  console.error(`[verify-redirects] MISSING ${staticDir}/_redirects — SPA deep links will 404.`)
  process.exit(1)
}

const txt = fs.readFileSync(out, 'utf-8')
const lines = txt
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(Boolean)

console.log(`[verify-redirects] ${staticDir}/_redirects present:\n---\n${txt}\n---`)

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
  console.error(`[verify-redirects] Catch-all rule must be the final line in ${staticDir}/_redirects`)
  process.exit(1)
}

console.log('[verify-redirects] OK')
