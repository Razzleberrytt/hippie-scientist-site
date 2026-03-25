import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const outDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '..', 'dist')
const site = (process.env.SITE_URL || 'https://thehippiescientist.net').replace(/\/+$/, '')

const corePaths = [
  '/',
  '/herbs',
  '/compounds',
  '/blog',
  '/about',
  '/contact',
  '/methodology',
  '/collections/herbs-for-relaxation',
]

function normalizePathname(loc) {
  if (!loc) return null
  const pathname = `/${String(loc).replace(/^\/+|\/+$/g, '')}`
  return pathname === '/' ? '/' : pathname
}

function urlEntry(loc, { priority = 0.6, changefreq = 'weekly', lastmod } = {}) {
  const safeLoc = normalizePathname(loc)
  if (!safeLoc) return null
  const effectiveLastmod = lastmod || new Date().toISOString()
  return `<url><loc>${site}${safeLoc}</loc><lastmod>${effectiveLastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority.toFixed(1)}</priority></url>`
}

function readPosts() {
  const blogDataPath = path.resolve(__dirname, '..', 'public', 'blogdata', 'index.json')
  if (!fs.existsSync(blogDataPath)) return []

  try {
    const raw = fs.readFileSync(blogDataPath, 'utf-8')
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function isValidBuiltPost(slug) {
  const cleanSlug = String(slug || '').replace(/^\/+|\/+$/g, '')
  if (!cleanSlug) return false

  const builtIndex = path.join(outDir, 'blog', cleanSlug, 'index.html')
  const legacyBuiltFile = path.join(outDir, 'blog', `${cleanSlug}.html`)
  const publicIndex = path.resolve(__dirname, '..', 'public', 'blog', cleanSlug, 'index.html')

  return fs.existsSync(builtIndex) || fs.existsSync(legacyBuiltFile) || fs.existsSync(publicIndex)
}

function collectBlogUrls() {
  const valid = []
  const seen = new Set()

  for (const post of readPosts()) {
    const slug = String(post?.slug || '').trim()
    if (!slug || seen.has(slug) || !isValidBuiltPost(slug)) continue

    seen.add(slug)
    valid.push({
      path: `/blog/${slug}`,
      lastmod: post.lastUpdated || post.date || undefined,
      date: post.date || null,
    })
  }

  return valid
}

function buildXml() {
  const entries = []
  const seen = new Set()

  for (const p of corePaths) {
    const normalized = normalizePathname(p)
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    const priority = normalized === '/' ? 1.0 : normalized === '/herbs' || normalized === '/compounds' ? 0.9 : 0.8
    const changefreq = normalized === '/blog' ? 'daily' : 'weekly'
    entries.push(urlEntry(normalized, { priority, changefreq }))
  }

  const blogUrls = collectBlogUrls()
  for (const post of blogUrls) {
    const normalized = normalizePathname(post.path)
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    entries.push(urlEntry(normalized, { priority: 0.7, changefreq: 'weekly', lastmod: post.lastmod }))
  }

  const body = entries.filter(Boolean).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

function run() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const xml = buildXml()
  const outFile = path.join(outDir, 'sitemap.xml')
  fs.writeFileSync(outFile, xml, 'utf-8')
  console.log('[sitemap] wrote', outFile)
}

run()
