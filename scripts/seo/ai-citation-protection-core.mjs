import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

export const SOURCE_MANIFEST = 'config/ai-citation-swarm-priorities.json'

export function normalizeCitationUrl(input) {
  if (typeof input !== 'string') return null
  let route = input.trim()
  if (/^https?:\/\//i.test(route)) {
    try {
      const parsed = new URL(route)
      if (!['thehippiescientist.net', 'www.thehippiescientist.net'].includes(parsed.hostname.toLowerCase())) return null
      route = parsed.pathname
    } catch { return null }
  }
  if (route !== '/' && !/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/?)+$/i.test(route)) return null
  return route === '/' ? '/' : route.replace(/\/?$/, '/')
}

export function sourceOwner(root, url) {
  const route = normalizeCitationUrl(url)
  if (!route) return null
  const slug = route.split('/').filter(Boolean).at(-1)
  const choices = [path.join(root, 'app', route.slice(1), 'page.tsx')]
  if (route.startsWith('/articles/') && route.split('/').filter(Boolean).length === 2) {
    for (const directory of ['articles', 'blog']) {
      for (const ext of ['md', 'mdx']) choices.push(path.join(root, 'content', directory, slug + '.' + ext))
    }
  }
  const found = choices.filter(existsSync)
  if (found.length !== 1) return null
  return path.relative(root, found[0]).split(path.sep).join('/')
}

// Resolve only an explicit, same-site, permanent redirect with one canonical
// destination. Redirected cited URLs are guarded by BOTH rule and target source.
export function protectedSourceOwner(root, url) {
  const route = normalizeCitationUrl(url)
  if (!route) return null
  const direct = sourceOwner(root, route)
  if (direct) return { sourceFile: direct, redirect: null }
  const redirectFile = path.join(root, 'public', '_redirects')
  if (!existsSync(redirectFile)) return null
  const matches = readFileSync(redirectFile, 'utf8').split(/\r?\n/)
    .map(x => x.trim().split(/\s+/))
    .filter(parts => parts.length === 3 && normalizeCitationUrl(parts[0]) === route)
  if (!matches.length || matches.some(parts => parts[2] !== '301')) return null
  const targets = [...new Set(matches.map(parts => normalizeCitationUrl(parts[1])))]
  if (targets.length !== 1 || !targets[0] || targets[0] === route) return null
  const targetOwner = sourceOwner(root, targets[0])
  if (!targetOwner) return null
  return { sourceFile: targetOwner, redirect: { to: targets[0], status: 301, rulesFile: 'public/_redirects' } }
}

function literal(input) {
  if (!input) return null
  const s = input.trim()
  const quote = s[0]
  if (s.length >= 2 && s.at(-1) === quote && ["'", '"', String.fromCharCode(96)].includes(quote)) return s.slice(1, -1)
  return null
}

function frontmatterValue(fm, name) {
  const row = fm.split(/\r?\n/).find(x => x.startsWith(name + ':'))
  if (!row) return null
  const raw = row.slice(name.length + 1).trim()
  return literal(raw) ?? (/^[a-zA-Z0-9][a-zA-Z0-9 _-]*$/.test(raw) ? raw : null)
}

export function extractCitationIdentity(source, sourceFile) {
  if (/\.(md|mdx)$/.test(sourceFile)) {
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
    const front = match?.[1] ?? ''
    return { sourceType: 'markdown-frontmatter', title: frontmatterValue(front, 'title'), slug: frontmatterValue(front, 'slug'), canonical: null }
  }
  // Only statically declared identity fields are protected. Rendered HTML is not inferred.
  const constants = Object.fromEntries(
    [...source.matchAll(/^const\s+(TITLE|SLUG|CANONICAL_PATH)\s*=\s*(['"])([^\r\n]*?)\2\s*;?\s*$/gm)]
      .map(m => [m[1], m[3]]),
  )
  const title = constants.TITLE ?? source.match(/^\s*title:\s*(['"])([^\r\n]*?)\1\s*,?\s*$/m)?.[2] ?? null
  const expression = source.match(/alternates:\s*\{\s*canonical:\s*([^,}\r\n]+)/)?.[1]
    ?? source.match(/^\s*path:\s*([^,\r\n]+)\s*,?\s*$/m)?.[1]
  let canonical = literal(expression)
  if (!canonical && expression?.trim() === 'CANONICAL_PATH') canonical = constants.CANONICAL_PATH ?? null
  if (canonical?.includes('$' + '{SLUG}') && constants.SLUG) canonical = canonical.replace('$' + '{SLUG}', constants.SLUG)
  if (canonical && /^\/[a-z0-9/-]+$/i.test(canonical)) canonical = normalizeCitationUrl(canonical)
  else canonical = null
  return { sourceType: 'tsx-static-declaration', title, slug: null, canonical }
}

export function selectProtectedAssets(root, signal, policy) {
  if (!signal?.snapshotLabel || !/^\d{4}-\d{2}-\d{2}$/.test(signal.snapshotLabel)) throw Error('Missing dated source snapshot')
  const total = signal?.totals?.citations
  if (!Number.isInteger(total) || total < 1) throw Error('Invalid source citation count')
  const rows = [...(signal.defendUrls ?? [])].sort((a, b) => b.citations - a.citations)
  const assets = [], unresolved = []
  let covered = 0
  for (const row of rows) {
    if (assets.length >= policy.maxAssets) break
    const url = normalizeCitationUrl(row.url)
    const citations = row.citations
    if (!url || !Number.isInteger(citations) || citations <= 0) throw Error('Invalid cited URL or count in derived manifest')
    const share = (citations / total) * 100
    if (citations < policy.minCitations && share < policy.minCitationSharePct && (covered / total) * 100 >= policy.cumulativeCoveragePct) continue
    const resolved = protectedSourceOwner(root, url)
    if (!resolved) { unresolved.push({ url, citations, reason: 'no unique exact source or verified permanent redirect' }); continue }
    const { sourceFile, redirect } = resolved
    const targetUrl = redirect?.to ?? url
    const identity = extractCitationIdentity(readFileSync(path.join(root, sourceFile), 'utf8'), sourceFile)
    if (!identity.title || (sourceFile.startsWith('content/') && identity.slug !== targetUrl.split('/').filter(Boolean).at(-1))) {
      unresolved.push({ url, citations, reason: 'source title/slug not verifiable' })
      continue
    }
    if (identity.canonical && identity.canonical !== targetUrl) {
      unresolved.push({ url, citations, reason: 'declared canonical differs from resolved owner URL' })
      continue
    }
    assets.push({ url, sourceFile, redirect, citations, citationSharePct: Number(share.toFixed(2)),
      protectionReason: 'derived-page-stats', identity })
    covered += citations
  }
  if (!assets.length) throw Error('No verifiable protected citation assets')
  return { assets, unresolved, coveredCitations: covered, coveragePct: Number(((covered / total) * 100).toFixed(2)) }
}
