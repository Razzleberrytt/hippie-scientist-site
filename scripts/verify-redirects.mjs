import fs from 'node:fs'
import path from 'node:path'

const staticDir = process.env.STATIC_OUTPUT_DIR || 'out'
const redirectsPath = path.resolve(staticDir, '_redirects')
if (!fs.existsSync(redirectsPath)) {
  console.error(`[verify-redirects] MISSING ${staticDir}/_redirects — Cloudflare Pages redirects will not be published.`)
  process.exit(1)
}

const txt = fs.readFileSync(redirectsPath, 'utf-8')
const lines = txt
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(Boolean)

console.log(`[verify-redirects] ${staticDir}/_redirects present:\n---\n${txt}\n---`)

const obsoleteAppShellRewrite = ['/*', '/index.html', '200'].join(' ')
if (lines.includes(obsoleteAppShellRewrite)) {
  console.error(`[verify-redirects] Obsolete app-shell rewrite found: "${obsoleteAppShellRewrite}"`)
  process.exit(1)
}

const atomRedirectRule = '/atom.xml /feed.xml 301'
if (!lines.includes(atomRedirectRule)) {
  console.error(`[verify-redirects] Expected feed compatibility redirect "${atomRedirectRule}"`)
  process.exit(1)
}

console.log('[verify-redirects] OK')
