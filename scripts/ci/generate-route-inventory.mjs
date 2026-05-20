#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const appDir = path.join(root, 'app')
const outFile = path.join(root, 'docs/generated/route-inventory.md')

const pageFilePattern = /^page\.(tsx|ts|jsx|js)$/

const collectPageFiles = (dir) => {
  if (!fs.existsSync(dir)) return []

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...collectPageFiles(fullPath))
      continue
    }

    if (entry.isFile() && pageFilePattern.test(entry.name)) {
      files.push(path.relative(root, fullPath).split(path.sep).join('/'))
    }
  }

  return files
}

const pageFiles = collectPageFiles(appDir).sort()

const toRoute = (file) => {
  const rel = file.replace(/^app\//, '').replace(/\/page\.(tsx|ts|jsx|js)$/, '')
  if (!rel) return '/'
  const segs = rel.split('/').filter(Boolean).filter((s) => !/^\(.*\)$/.test(s))
  return '/' + segs.join('/')
}

const hasGenerateStaticParams = (txt) => /export\s+(async\s+)?function\s+generateStaticParams/.test(txt) || /export\s+const\s+generateStaticParams\s*=/.test(txt)
const isDynamicRoute = (route) => /\[[^\]]+\]/.test(route)

const rows = pageFiles.map((file) => {
  const txt = fs.readFileSync(path.join(root, file), 'utf8')
  const route = toRoute(file)
  const dynamic = isDynamicRoute(route)
  const params = [...route.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1])
  const isPrivate = route.startsWith('/dashboard')
  const likelyIndexable = isPrivate ? 'excluded' : 'indexable'
  const notes = route.includes('(') ? 'route group path omitted' : (isPrivate ? 'internal/private' : '')
  return { route, file, type: dynamic ? 'dynamic' : 'static', params, gsp: dynamic ? (hasGenerateStaticParams(txt) ? 'yes' : 'no') : 'n/a', likelyIndexable, notes }
})

const dynamicMissing = rows.filter((r) => r.type === 'dynamic' && r.gsp === 'no')

const lines = [
  '# Route Inventory',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  `Total routes: ${rows.length}`,
  `Dynamic routes missing generateStaticParams: ${dynamicMissing.length}`,
  '',
  '| Route | Source file | Type | Dynamic params | generateStaticParams | Indexability | Notes |',
  '|---|---|---|---|---|---|---|',
  ...rows.map((r) => `| \`${r.route}\` | \`${r.file}\` | ${r.type} | ${r.params.length ? r.params.join(', ') : '-'} | ${r.gsp} | ${r.likelyIndexable} | ${r.notes || '-'} |`),
  '',
  '## Dynamic routes missing generateStaticParams',
  '',
  ...(dynamicMissing.length ? dynamicMissing.map((r) => `- \`${r.route}\` (${r.file})`) : ['- None'])
]

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, lines.join('\n') + '\n')
console.log(`Wrote ${path.relative(root, outFile)} with ${rows.length} routes.`)
