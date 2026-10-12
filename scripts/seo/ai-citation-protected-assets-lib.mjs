import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

export const normalizeUrl = (input) => {
  if (typeof input !== 'string' || !input.trim()) return null
  let url
  try { url = new URL(input, 'https://thehippiescientist.net') } catch { return null }
  if (!['thehippiescientist.net', 'www.thehippiescientist.net'].includes(url.hostname)) return null
  const pathname = url.pathname
  if (!pathname.startsWith('/') || /%2f|%5c|\.\./i.test(pathname)) return null
  return pathname === '/' ? '/' : pathname.replace(/\/+$/, '') + '/'
}

export function sourceFileFor(url, root = process.cwd()) {
  const route = normalizeUrl(url)
  if (!route) return null
  let candidates
  if (route.startsWith('/articles/')) {
    const slug = route.slice('/articles/'.length, -1)
    if (!slug || slug.includes('/')) return null
    candidates = ['content/articles/' + slug + '.md', 'content/articles/' + slug + '.mdx', 'content/blog/' + slug + '.md', 'content/blog/' + slug + '.mdx']
  } else {
    candidates = [route === '/' ? 'app/page.tsx' : 'app' + route + 'page.tsx']
  }
  const existing = candidates.filter(file => existsSync(path.join(root, file)))
  return existing.length === 1 ? existing[0] : null
}

const frontmatter = (source) => source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? null

function scalar(data, key) {
  const pattern = new RegExp('^' + key + '\\s*:\\s*(.+)$', 'm')
  const raw = data?.match(pattern)?.[1]?.trim() ?? ''
  if (!raw) return null
  if (raw[0] === '"' || raw[0] === "'") {
    if (raw.at(-1) !== raw[0] || raw.length < 3) return null
    return raw.slice(1, -1).trim() || null
  }
  if (raw.startsWith('[') || raw.startsWith('{') || raw.startsWith('>')) return null
  return raw.replace(/\s+#.*$/, '').trim() || null
}

function sourceTitle(source) {
  const metadata = source.match(/export\s+const\s+metadata(?:\s*:\s*Metadata)?\s*=\s*\{([\s\S]*?)\n\}/)?.[1]
  const literal = metadata?.match(/\btitle\s*:\s*(['"])([^\r\n]*?)\1/)?.[2]
  if (literal && !literal.includes('$' + '{')) return literal.trim()
  const constant = source.match(/\bconst\s+TITLE\s*=\s*(['"])([^\r\n]*?)\1/)?.[2]
  if (constant && !constant.includes('$' + '{')) return constant.trim()
  const simple = source.match(/\btitle\s*:\s*(['"])([^\r\n]*?)\1/)?.[2]
  return simple && !simple.includes('$' + '{') ? simple.trim() : null
}

function sourceCanonical(source) {
  const alternates = source.match(/\balternates\s*:\s*\{\s*canonical\s*:\s*(['"])([^'"]+)\1/)?.[2]
  if (alternates) return normalizeUrl(alternates)
  if (/\balternates\s*:\s*\{\s*canonical\s*:\s*CANONICAL_PATH\b/.test(source)) {
    const assigned = source.match(/\bconst\s+CANONICAL_PATH\s*=\s*(['"])([^'"]+)\1/)?.[2]
    return assigned ? normalizeUrl(assigned) : null
  }
  const slugConstant = source.match(/\bconst\s+SLUG\s*=\s*(['"])([^'"]+)\1/)?.[2]
  const pathExpression = source.match(/\bpath\s*:\s*\x60([^\x60]+)\x60/)?.[1]
  if (slugConstant && pathExpression && pathExpression.includes('$' + '{SLUG}')) {
    return normalizeUrl(pathExpression.replace('$' + '{SLUG}', slugConstant))
  }
  return null
}

export function extractIdentity(source, sourceFile, url, root = process.cwd()) {
  const route = normalizeUrl(url)
  if (!route || !sourceFile) return null
  if (sourceFile.startsWith('content/articles/') || sourceFile.startsWith('content/blog/')) {
    const fm = frontmatter(source)
    const title = scalar(fm, 'title')
    const slug = scalar(fm, 'slug')
    if (!title || !slug || '/articles/' + slug + '/' !== route) return null
    const canonical = scalar(fm, 'canonical')
    if (canonical && normalizeUrl(canonical) !== route) return null
    return { title, slug, ...(canonical ? { canonical: route } : {}) }
  }
  const title = sourceTitle(source)
  if (!title) return null
  const canonical = sourceCanonical(source)
  if (canonical && canonical !== route) return null
  const slug = source.match(/\bconst\s+SLUG\s*=\s*(['"])([^'"]+)\1/)?.[2] || null
  if (slug && !route.endsWith('/' + slug + '/')) return null
  let h1 = source.match(/<h1(?:\s[^>]*)?>([^<{][^<{}]*?)<\/h1>/i)?.[1]?.replace(/\s+/g, ' ').trim() || null
  let renderedBy = null
  const importedDefault = source.match(/\bimport\s+([A-Za-z_$][\w$]*)\s+from\s+(['"])(\.\.?\/[^'"]+\/page)\2/)
  if (importedDefault && new RegExp('\\bexport\\s+default\\s+' + importedDefault[1] + '\\b').test(source)) {
    const imported = path.posix.normalize(path.posix.join(path.posix.dirname(sourceFile), importedDefault[3] + '.tsx'))
    if (!imported.startsWith('app/') || !existsSync(path.join(root, imported))) return null
    const importedSource = readFileSync(path.join(root, imported), 'utf8')
    h1 = importedSource.match(/<h1(?:\s[^>]*)?>([^<{][^<{}]*?)<\/h1>/i)?.[1]?.replace(/\s+/g, ' ').trim() || null
    if (!h1) return null
    renderedBy = imported
  }
  return { title, ...(slug ? { slug } : {}), ...(canonical ? { canonical } : {}), ...(h1 ? { h1 } : {}), ...(renderedBy ? { renderedBy } : {}) }
}

export function selectProtectedAssets({ root, manifest, policy }) {
  const total = Number(manifest?.totals?.citations)
  const snapshotLabel = manifest?.snapshotLabel
  const rows = manifest?.defendUrls
  if (!Number.isFinite(total) || total <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(snapshotLabel ?? '') || !Array.isArray(rows) || !rows.length) throw Error('Missing validated, dated derived Bing Page Stats manifest')
  if (!Number.isInteger(policy.minAssets) || policy.minAssets < 1 || policy.minAssets > policy.maxAssets) throw Error('Invalid protection minAssets policy')
  const sorted = [...rows].sort((a, b) => b.citations - a.citations)
  const seen = new Set()
  let citationsCovered = 0
  const assets = []
  const unresolvedOwners = []
  for (const row of sorted) {
    const url = normalizeUrl(row.url)
    const count = Number(row.citations)
    if (!url || url !== row.url || !Number.isFinite(count) || count <= 0 || seen.has(url)) throw Error('Invalid or duplicate URL/citations in derived Bing manifest')
    seen.add(url)
    const sourceFile = sourceFileFor(url, root)
    if (!sourceFile) unresolvedOwners.push({ url, citations: count, reason: 'no verified direct canonical source owner' })
    if (assets.length >= policy.maxAssets || (assets.length >= policy.minAssets && citationsCovered * 100 >= policy.cumulativeCoveragePct * total)) continue
    if (!sourceFile) continue
    const identity = extractIdentity(readFileSync(path.join(root, sourceFile), 'utf8'), sourceFile, url)
    if (!identity) {
      unresolvedOwners.push({ url, citations: count, reason: 'source identity missing, dynamic, or canonical conflict' })
      continue
    }
    assets.push({
      url, citations: count, sourceFile,
      sourceType: (sourceFile.startsWith('content/articles/') || sourceFile.startsWith('content/blog/')) ? 'article-frontmatter' : 'app-route-source',
      citationSharePct: Number((count * 100 / total).toFixed(2)),
      identity,
    })
    citationsCovered += count
  }
  if (assets.length < policy.minAssets || citationsCovered * 100 < policy.cumulativeCoveragePct * total) throw Error('Insufficient verified owner and citation coverage for a ready ledger')
  return { assets, unresolvedOwners, citationsCovered, coveragePct: Number((citationsCovered * 100 / total).toFixed(2)) }
}

export function identityFailures(root, ledger) {
  const failures = []
  for (const a of ledger.assets ?? []) {
    if (!a.url || !a.sourceFile || !a.identity || !a.identity.title || !normalizeUrl(a.url)) { failures.push('missing verified identity: ' + a.url); continue }
    const resolved = sourceFileFor(a.url, root)
    if (resolved !== a.sourceFile) { failures.push(a.url + ': canonical source owner missing or moved'); continue }
    const current = extractIdentity(readFileSync(path.join(root, resolved), 'utf8'), resolved, a.url)
    if (!current) { failures.push(a.url + ': protected identity is missing or ambiguous'); continue }
    for (const [key, value] of Object.entries(a.identity)) {
      if (current[key] !== value) failures.push(a.url + ': protected ' + key + ' changed in ' + resolved)
    }
  }
  return failures
}
