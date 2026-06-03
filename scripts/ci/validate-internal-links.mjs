import fs from 'node:fs'
import path from 'node:path'

const outDir = path.resolve('out')

if (!fs.existsSync(outDir)) {
  console.error(`Output directory "${outDir}" does not exist. Run build first.`)
  process.exit(1)
}

// 1. Load Redirects
const redirects = new Set()
const redirectsFile = path.join(outDir, '_redirects')
if (fs.existsSync(redirectsFile)) {
  const content = fs.readFileSync(redirectsFile, 'utf8')
  content.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const parts = trimmed.split(/\s+/)
    if (parts[0]) {
      redirects.add(parts[0])
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

  // Check redirects
  if (redirects.has(cleanRoute) || redirects.has(cleanRoute + '/')) {
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
      console.error(`Broken link in "${relativeFile}": "${route}"`)
      errorCount++
    }
  }
}

if (errorCount > 0) {
  console.error(`\nFound ${errorCount} broken internal links.`)
  process.exit(1)
}

console.log(`Successfully verified all internal links! Clean output.`)
