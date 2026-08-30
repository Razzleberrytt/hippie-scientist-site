import fs from 'node:fs'
import path from 'node:path'

const outDir = path.resolve('out')

if (!fs.existsSync(outDir)) {
  // Skipping beats failing: this runs inside verify:postbuild now, and a
  // caller without a build should be told, not blocked.
  console.log(`Output directory "${outDir}" does not exist - skipping internal link validation.`)
  process.exit(0)
}

// 1. Load Redirects (exact sources + wildcard/splat prefixes).
// Cloudflare `_redirects` honors trailing `/*` splats (e.g. `/compare/* ...`),
// so a link like `/compare/foo` is a valid redirect target even though it is not
// an emitted static file. The validator must mirror that to avoid flagging
// wildcard-covered links as broken.
const redirects = new Set()
const redirectPrefixes = [] // root-relative sources ending in `/*`, sans the `*`
const redirectsFile = path.join(outDir, '_redirects')
if (fs.existsSync(redirectsFile)) {
  const content = fs.readFileSync(redirectsFile, 'utf8')
  content.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const parts = trimmed.split(/\s+/)
    const source = parts[0]
    if (!source) return
    // Only root-relative sources can match internal root-relative routes.
    if (source.startsWith('/') && source.endsWith('/*')) {
      redirectPrefixes.push(source.slice(0, -1)) // keep trailing slash, drop `*`
    } else {
      redirects.add(source)
    }
  })
}

// 2. Helper to check if a route exists
function routeExists(route) {
  let cleanRoute = route.split('?')[0].split('#')[0]
  if (cleanRoute.endsWith('/')) {
    cleanRoute = cleanRoute.slice(0, -1)
  }
  if (!cleanRoute) {
    cleanRoute = '/'
  }

  // Check redirects (exact source match)
  if (redirects.has(cleanRoute) || redirects.has(cleanRoute + '/')) {
    return true
  }
  // Check wildcard/splat redirect prefixes (e.g. `/compare/*` covers `/compare/foo`)
  const withSlash = cleanRoute + '/'
  if (redirectPrefixes.some(prefix => withSlash.startsWith(prefix))) {
    return true
  }

  if (cleanRoute === '/') {
    return fs.existsSync(path.join(outDir, 'index.html'))
  }

  const p1 = path.join(outDir, cleanRoute, 'index.html')
  const p2 = path.join(outDir, cleanRoute + '.html')
  const p3 = path.join(outDir, cleanRoute)

  return fs.existsSync(p1) || fs.existsSync(p2) || (fs.existsSync(p3) && fs.statSync(p3).isFile())
}

// 3. Walk directory to find HTML files
function getHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = entries.flatMap(entry => {
    const res = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '_next') return []
      return getHtmlFiles(res)
    }
    return entry.name.endsWith('.html') ? res : []
  })
  return files
}

const htmlFiles = getHtmlFiles(outDir)
console.log(`Found ${htmlFiles.length} HTML files to scan for internal links.`)

let errorCount = 0
const checkedLinks = new Map()
/** target route -> files linking to it, so a new break names its source. */
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
      rawHref.includes('AFFILIATE_LINK_HERE')
    ) {
      continue
    }
    
    let normalizedRoute
    if (rawHref.startsWith('/')) {
      normalizedRoute = rawHref
    } else {
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

/**
 * A ratchet, not a gate at zero.
 *
 * This check has been correct and unwired for its whole life: it exits 1, no
 * npm script ever ran it, and 393 dead links accumulated behind it. Failing at
 * zero now would just make it the thing everyone skips, and zero is not the
 * honest baseline — some dead targets need a decision nobody has made yet.
 * Linking /herbs/berberis-aristata/ to berberis-vulgaris would claim two
 * species are one plant, so that link is wrong whichever way it is resolved.
 *
 * Recorded targets are tolerated, a new one fails, and a target that stops
 * being broken is reported so the baseline can shrink. The count only goes down.
 */
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
const appeared = foundTargets.filter((route) => !baseline.has(route))
const cleared = [...baseline].filter((route) => !brokenTargets.has(route)).sort()

console.log(`Broken link targets: ${foundTargets.length} (${errorCount} link edges); baseline allows ${baseline.size}.`)

if (cleared.length) {
  console.log(`${cleared.length} baselined target(s) now resolve. Remove them from config/broken-link-baseline.json to lock it in:`)
  for (const route of cleared.slice(0, 20)) console.log(`  ${route}`)
}

// Regenerating beats hand-editing: the file stays sorted, and shrinking it is a
// one-command operation once links are fixed.
if (process.argv.includes('--update-baseline')) {
  fs.mkdirSync(path.dirname(BASELINE_PATH), { recursive: true })
  fs.writeFileSync(
    BASELINE_PATH,
    `${JSON.stringify(
      {
        note: 'Internal link targets that do not resolve. A ratchet: new targets fail, existing ones are tolerated until someone decides where they should point. Regenerate with: node scripts/ci/validate-internal-links.mjs --update-baseline',
        targets: foundTargets,
      },
      null,
      2,
    )}\n`,
  )
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
