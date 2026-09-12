import fs from 'node:fs'
import path from 'node:path'

const outDir = path.resolve('out')

if (!fs.existsSync(outDir)) {
  console.log(`Output directory "${outDir}" does not exist - skipping internal link validation.`)
  process.exit(0)
}

const redirects = new Set()
const redirectPrefixes = []
const redirectsFile = path.join(outDir, '_redirects')
if (fs.existsSync(redirectsFile)) {
  const content = fs.readFileSync(redirectsFile, 'utf8')
  content.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const parts = trimmed.split(/\s+/)
    const source = parts[0]
    if (!source) return
    if (source.startsWith('/') && source.endsWith('/*')) {
      redirectPrefixes.push(source.slice(0, -1))
    } else {
      redirects.add(source)
    }
  })
}

function routeExists(route) {
  let cleanRoute = route.split('?')[0].split('#')[0]
  if (cleanRoute.endsWith('/')) cleanRoute = cleanRoute.slice(0, -1)
  if (!cleanRoute) cleanRoute = '/'
  if (redirects.has(cleanRoute) || redirects.has(cleanRoute + '/')) return true
  const withSlash = cleanRoute + '/'
  if (redirectPrefixes.some(prefix => withSlash.startsWith(prefix))) return true
  if (cleanRoute === '/') return fs.existsSync(path.join(outDir, 'index.html'))
  const p1 = path.join(outDir, cleanRoute, 'index.html')
  const p2 = path.join(outDir, cleanRoute + '.html')
  const p3 = path.join(outDir, cleanRoute)
  return fs.existsSync(p1) || fs.existsSync(p2) || (fs.existsSync(p3) && fs.statSync(p3).isFile())
}

function getHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries.flatMap(entry => {
    const res = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '_next') return []
      return getHtmlFiles(res)
    }
    return entry.name.endsWith('.html') ? res : []
  })
}

const htmlFiles = getHtmlFiles(outDir)
console.log(`Found ${htmlFiles.length} HTML files to scan for internal links.`)

let errorCount = 0
const checkedLinks = new Map()
const brokenTargets = new Map()
const hrefRegex = /href=["']([^"']*)["']/g

for (const file of htmlFiles) {
  const relativeFile = path.relative(outDir, file)
  const content = fs.readFileSync(file, 'utf8')
  let match
  const fileLinks = new Set()
  while ((match = hrefRegex.exec(content)) !== null) {
    const rawHref = match[1]
    if (
      rawHref.startsWith('http://') ||
      rawHref.startsWith('https://') ||
      rawHref.startsWith('//') ||
      rawHref.startsWith('#') ||
      rawHref.startsWith('mailto:') ||
      rawHref.startsWith('tel:') ||
      rawHref.startsWith('javascript:') ||
      rawHref.startsWith('/_next/') ||
      rawHref.includes('AFFILIATE_LINK_HERE')
    ) continue
    let normalizedRoute
    if (rawHref.startsWith('/')) normalizedRoute = rawHref
    else {
      const fileDir = path.dirname(relativeFile)
      normalizedRoute = '/' + path.posix.join(fileDir.replace(/\\/g, '/'), rawHref)
    }
    fileLinks.add(normalizedRoute)
  }
  for (const route of fileLinks) {
    let isValid = checkedLinks.get(route)
    if (isValid === undefined) {
      isValid = routeExists(route)
      checkedLinks.set(route, isValid)
    }
    if (!isValid) {
      if (!brokenTargets.has(route)) brokenTargets.set(route, new Set())
      brokenTargets.get(route).add(relativeFile)
      errorCount++
    }
  }
}

const BASELINE_PATH = path.resolve('config', 'broken-link-baseline.json')
function readBrokenLinkBaseline() {
  try {
    const parsed = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'))
    return new Set(Array.isArray(parsed?.targets) ? parsed.targets : [])
  } catch {
    return new Set()
  }
}

const baseline = readBrokenLinkBaseline()
const foundTargets = [...brokenTargets.keys()].sort()
const appeared = foundTargets.filter(route => !baseline.has(route))
const cleared = [...baseline].filter(route => !brokenTargets.has(route)).sort()
console.log(`Broken link targets: ${foundTargets.length} (${errorCount} link edges); baseline allows ${baseline.size}.`)
if (cleared.length) {
  console.log(`${cleared.length} baselined target(s) now resolve. Remove them from config/broken-link-baseline.json to lock it in:`)
  for (const route of cleared.slice(0, 20)) console.log(`  ${route}`)
}

if (process.argv.includes('--update-baseline')) {
  fs.mkdirSync(path.dirname(BASELINE_PATH), { recursive: true })
  fs.writeFileSync(BASELINE_PATH, `${JSON.stringify({
    note: 'Internal link targets that do not resolve. A ratchet: new targets fail, existing ones are tolerated until someone decides where they should point. Regenerate with: node scripts/ci/validate-internal-links.mjs --update-baseline',
    targets: foundTargets,
  }, null, 2)}\n`)
  console.log(`Wrote ${foundTargets.length} target(s) to ${path.relative(process.cwd(), BASELINE_PATH)}.`)
  process.exit(0)
}

if (appeared.length) {
  console.error(`\n${appeared.length} internal link target(s) newly broken:`)
  for (const route of appeared) {
    const from = [...brokenTargets.get(route)].slice(0, 3)
    console.error(`  ${route}  <- ${from.join(', ')}`)
  }
  console.error('\nAdd the page, add a redirect in public/_redirects, or fix the link.')
  console.error('Baseline it only when the right destination is a decision nobody has made yet.')
  process.exit(1)
}
console.log('No newly broken internal links.')
