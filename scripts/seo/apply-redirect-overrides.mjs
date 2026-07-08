import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const redirectsPath = path.join(root, 'out', '_redirects')
const overridesDir = path.join(root, 'public', 'redirect-overrides')

if (!fs.existsSync(overridesDir)) {
  console.log('[redirect-overrides] No public/redirect-overrides directory found; skipping.')
  process.exit(0)
}

if (!fs.existsSync(redirectsPath)) {
  console.warn('[redirect-overrides] out/_redirects not found; skipping redirect override merge.')
  process.exit(0)
}

const overrideFiles = fs.readdirSync(overridesDir)
  .filter((fileName) => /\.(txt|redirects)$/i.test(fileName))
  .sort()

const rules = []
const seenSources = new Set()

function sourceVariants(source) {
  if (!source.startsWith('/') || source === '/' || source.includes('*') || source.includes(':')) {
    return [source]
  }

  return source.endsWith('/')
    ? [source, source.replace(/\/+$/, '')]
    : [source, `${source}/`]
}

function addRule(source, target, status) {
  if (!source || !target) return
  if (seenSources.has(source)) return

  seenSources.add(source)
  rules.push(`${source} ${target} ${status}`)
}

for (const fileName of overrideFiles) {
  const filePath = path.join(overridesDir, fileName)
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const [source, target, status = '301'] = trimmed.split(/\s+/)
    if (!source || !target) continue

    for (const variant of sourceVariants(source)) {
      addRule(variant, target, status)
    }
  }
}

if (rules.length === 0) {
  console.log('[redirect-overrides] No redirect override rules found; skipping.')
  process.exit(0)
}

const existing = fs.readFileSync(redirectsPath, 'utf8').trimStart()
const header = [
  '# Redirect overrides merged during build.',
  '# These rules are intentionally prepended so exact audit-cleanup rules win over older wildcard or stale targets.',
  '# Exact slash and non-slash variants are generated automatically for path redirects.',
]

fs.writeFileSync(
  redirectsPath,
  `${header.join('\n')}\n${rules.join('\n')}\n\n${existing}`,
)

console.log(`[redirect-overrides] Prepended ${rules.length} redirect override rules to out/_redirects.`)
