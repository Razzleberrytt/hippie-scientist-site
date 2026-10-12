import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

// Public canonical route identity; never join an untrusted URL into the filesystem.
export function normalizeCitationUrl(value) {
  let route = String(value ?? '').trim()
  if (/^https?:\/\//i.test(route)) {
    const parsed = new URL(route)
    if (!['thehippiescientist.net', 'www.thehippiescientist.net'].includes(parsed.hostname.toLowerCase())) {
      throw new Error('External host is not a THS canonical owner')
    }
    route = parsed.pathname
  }
  if (!/^\/(?:[a-z0-9/-]*)$/i.test(route) || route.includes('//') || route.includes('..')) {
    throw new Error('Invalid citation route')
  }
  return route === '/' ? '/' : route.endsWith('/') ? route : route + '/'
}

const scalar = (body, field) => {
  const match = body.match(new RegExp('^' + field + '\\s*:\\s*(.+?)\\s*$', 'm'))
  if (!match) return null
  const value = match[1].trim()
  if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'")))) return value.slice(1, -1)
  return value || null
}

function frontmatterOf(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  return match ? match[1] : null
}

export function findCitationOwner(root, url) {
  const route = normalizeCitationUrl(url)
  const parts = route.split('/').filter(Boolean)
  const relative = path.posix.join('app', ...parts, 'page.tsx')
  if (existsSync(path.join(root, relative))) return { sourceFile: relative, sourceType: 'next-page' }
  if (parts.length === 2 && parts[0] === 'articles') {
    const slug = parts[1]
    for (const ext of ['md', 'mdx']) {
      const candidate = path.posix.join('content', 'articles', slug + '.' + ext)
      const file = path.join(root, candidate)
      if (!existsSync(file)) continue
      const frontmatter = frontmatterOf(readFileSync(file, 'utf8'))
      if (frontmatter && scalar(frontmatter, 'slug') === slug) {
        return { sourceFile: candidate, sourceType: 'article-frontmatter' }
      }
    }
  }
  return null
}

export function extractCitationIdentity(source, sourceType) {
  if (sourceType === 'article-frontmatter') {
    const frontmatter = frontmatterOf(source)
    if (!frontmatter) return {}
    return Object.fromEntries(Object.entries({
      title: scalar(frontmatter, 'title'),
      slug: scalar(frontmatter, 'slug'),
      canonical: scalar(frontmatter, 'canonical'),
    }).filter(([, value]) => typeof value === 'string' && value.length > 0))
  }
  if (sourceType !== 'next-page') return {}

  let title = source.match(/\btitle\s*:\s*['"]([^'"]+)['"]/)?.[1] ?? null
  // buildPageMetadata can receive a source-owned TITLE rather than a literal.
  if (!title && /\btitle\s*:\s*(?:compactMetaTitle\(TITLE\)|TITLE)/.test(source)) {
    title = source.match(/\bconst\s+TITLE\s*=\s*['"]([^'"]+)['"]/)?.[1] ?? null
  }

  const match = source.match(/\balternates\s*:\s*\{\s*canonical\s*:\s*(?:'([^']+)'|"([^"]+)"|([A-Z][A-Z_0-9]+))/s)
  let canonical = match?.[1] ?? match?.[2] ?? null
  if (!canonical && match?.[3]) {
    const variable = match[3]
    canonical = source.match(new RegExp('\\bconst\\s+' + variable + '\\s*=\\s*[\\x27\\x22]([^\\x27\\x22]+)[\\x27\\x22]'))?.[1] ?? null
  }

  // The buildPageMetadata helper derives canonical from the path argument.
  // Resolve only literal paths or exact local string constants.
  if (!canonical) {
    const pathArgument = source.match(new RegExp('buildPageMetadata\\s*\\(\\s*\\{[\\s\\S]*?\\bpath\\s*:\\s*[\\x27\\x22\\x60]([^\\x27\\x22\\x60]+)[\\x27\\x22\\x60]'))?.[1]
    if (pathArgument) {
      const expression = new RegExp('\\$\\x7b([A-Z][A-Z_0-9]+)\\x7d', 'g')
      const resolved = pathArgument.replace(expression, (whole, name) => {
        const constant = source.match(new RegExp('\\bconst\\s+' + name + '\\s*=\\s*[\\x27\\x22]([^\\x27\\x22]+)[\\x27\\x22]'))?.[1]
        return constant ?? whole
      })
      if (!resolved.includes(String.fromCharCode(36, 123)) && resolved.startsWith('/')) {
        canonical = resolved
      }
    }
  }

  const h1 = source.match(/<h1(?:\s[^>]*)?>([^<{][\s\S]*?)<\/h1>/i)?.[1]?.replace(/\s+/g, ' ').trim() ?? null
  return Object.fromEntries(Object.entries({ title, canonical, h1 }).filter(([, value]) =>
    typeof value === 'string' && value.length > 0))
}

export function identityFor(root, owner) {
  return extractCitationIdentity(readFileSync(path.join(root, owner.sourceFile), 'utf8'), owner.sourceType)
}
