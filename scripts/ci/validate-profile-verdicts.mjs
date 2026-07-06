import fs from 'node:fs'
import path from 'node:path'

/**
 * Guards the editorial verdict overlay (config/profile-verdicts.ts).
 *
 * Every route the overlay links to — betterAlternative.href and each
 * comparisons[].href — must resolve to a real page, and every keyed profile
 * must exist in the workbook export. This enforces the overlay's core rule:
 * only surface routes and profiles that actually exist. Run in CI so a curated
 * verdict can never ship a dead link.
 */

const ROOT = process.cwd()
const CONFIG = path.join(ROOT, 'config/profile-verdicts.ts')
const src = fs.readFileSync(CONFIG, 'utf8')

const slugSet = (file) => {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'))
  const rows = Array.isArray(raw) ? raw : raw.items || raw.data || []
  return new Set(rows.map((r) => r.slug).filter(Boolean))
}
const herbSlugs = slugSet('public/data/herbs.json')
const compoundSlugs = slugSet('public/data/compounds.json')

const routeExists = (href) => {
  const clean = href.replace(/^\/+|\/+$/g, '') // strip leading/trailing slashes
  const m = clean.match(/^(herbs|compounds)\/(.+)$/)
  if (m) {
    const [, kind, slug] = m
    return kind === 'herbs' ? herbSlugs.has(slug) : compoundSlugs.has(slug)
  }
  const dir = path.join(ROOT, 'app', clean)
  return (
    fs.existsSync(path.join(dir, 'page.tsx')) ||
    fs.existsSync(path.join(dir, 'page.mdx')) ||
    fs.existsSync(path.join(dir, 'page.ts'))
  )
}

const errors = []

// Validate every keyed profile exists in the workbook export.
for (const [, key] of src.matchAll(/^\s{2}'?([a-z0-9-]+)'?:\s*\{$/gm)) {
  if (!herbSlugs.has(key) && !compoundSlugs.has(key)) {
    errors.push(`Keyed profile "${key}" is not a real herb or compound slug`)
  }
}

// Validate every linked route resolves.
for (const [, href] of src.matchAll(/href:\s*'([^']+)'/g)) {
  if (!href.startsWith('/')) continue // external / anchor links are out of scope
  if (!routeExists(href)) errors.push(`Dead route in overlay: ${href}`)
}

if (errors.length) {
  console.error('validate-profile-verdicts: FAILED\n - ' + errors.join('\n - '))
  process.exit(1)
}

console.log('validate-profile-verdicts: OK (all keyed profiles and linked routes resolve)')
