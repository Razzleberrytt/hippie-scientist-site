#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

function getActivePageRoutes(dir, baseRoute = '', routes = []) {
  const absDir = path.join(ROOT, dir)
  if (!fs.existsSync(absDir)) return routes

  const entries = fs.readdirSync(absDir, { withFileTypes: true })
  for (const entry of entries) {
    const res = path.join(absDir, entry.name)
    if (entry.isDirectory()) {
      if (['__tests__', 'node_modules', '.next', 'out', 'legacy-quarantine'].includes(entry.name)) continue
      // Handle Route Groups (e.g. (public))
      if (/^\(.*\)$/.test(entry.name)) {
        getActivePageRoutes(path.relative(ROOT, res), baseRoute, routes)
      } else {
        const routeSegment = entry.name
        getActivePageRoutes(path.relative(ROOT, res), `${baseRoute}/${routeSegment}`, routes)
      }
    } else if (entry.isFile() && /^page\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      routes.push({
        file: path.relative(ROOT, res).replace(/\\/g, '/'),
        route: baseRoute || '/',
      })
    }
  }
  return routes
}

function parseRedirects() {
  const filepath = path.join(ROOT, 'public/_redirects')
  if (!fs.existsSync(filepath)) return []

  const content = fs.readFileSync(filepath, 'utf8')
  return content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const parts = line.split(/\s+/)
      return {
        from: parts[0],
        to: parts[1],
        status: parts[2] || '301',
      }
    })
}

function main() {
  console.log('[route-governance] Auditing active page routes against redirects...')

  const activePages = getActivePageRoutes('app')
  const redirects = parseRedirects()

  let hasConflict = false
  const conflicts = []
  const catalog = []

  for (const page of activePages) {
    // Ignore dynamic routes in governance check as they are wildcard catchalls
    const isDynamic = /\[.*\]/.test(page.route)
    catalog.push({
      route: page.route,
      file: page.file,
      type: isDynamic ? 'dynamic' : 'static',
    })

    if (isDynamic) continue

    // Normalize routes for comparison (trailing slash mapping)
    const routesToTest = [page.route, `${page.route}/`].map(r => r.replace(/\/+/g, '/'))

    for (const r of routesToTest) {
      const matchedRedirect = redirects.find(red => red.from === r)
      if (matchedRedirect) {
        // A 200 rewrite (like safety-checker) is compatible. Redirections (3xx) and 404s conflict.
        if (matchedRedirect.status !== '200') {
          // Ignore standard trailing-slash normalizations (e.g., /route -> /route/)
          const normalizedFrom = matchedRedirect.from.replace(/\/$/, '')
          const normalizedTo = matchedRedirect.to.replace(/\/$/, '')
          if (normalizedFrom !== normalizedTo) {
            conflicts.push(`Active page route "${page.route}" (defined in ${page.file}) conflicts with redirect rule: "${matchedRedirect.from} -> ${matchedRedirect.to} ${matchedRedirect.status}"`)
            hasConflict = true
          }
        }
      }
    }
  }

  // Generate Docs Route Inventory
  const docDir = path.join(ROOT, 'docs', 'generated')
  fs.mkdirSync(docDir, { recursive: true })
  
  const mdContent = `# Route Inventory

Generated on ${new Date().toISOString()}

This file lists all active Page Router routes compiled by Next.js static export.

## Active Routes

| Route | Type | Source File |
| :--- | :--- | :--- |
${catalog.map(c => `| \`${c.route}\` | ${c.type} | [\`${c.file}\`](file:///${ROOT.replace(/\\/g, '/')}/${c.file}) |`).join('\n')}

## Redirect & 404 Statuses

See [public/_redirects](file:///${ROOT.replace(/\\/g, '/')}/public/_redirects) for the complete Cloudflare redirection mapping.
`
  fs.writeFileSync(path.join(docDir, 'route-inventory.md'), mdContent, 'utf8')
  console.log('[route-governance] Wrote docs/generated/route-inventory.md')

  if (hasConflict) {
    console.error('[route-governance] FAIL: Conflicting routes detected!')
    conflicts.forEach(c => console.error(`  - ${c}`))
    process.exit(1)
  }

  console.log('[route-governance] PASS: No route conflicts found.')
  process.exit(0)
}

main()
