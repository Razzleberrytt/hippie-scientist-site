#!/usr/bin/env node
/**
 * Canonicalize public/_redirects.
 *
 * The site is built with `trailingSlash: true`, so exactly one URL form is
 * canonical: a path with a trailing slash. Over time the redirect file drifted
 * away from that in three ways, all of which cost crawl budget and split link
 * equity across duplicate URLs:
 *
 *  1. **Missing slash variants.** Most rules listed only `/foo` or only `/foo/`,
 *     so the other form fell through to a 404 or to Cloudflare's default
 *     handling instead of landing on the canonical target.
 *  2. **Redirect chains.** `/comparisons/x -> /compare/x/ -> /guides/compare/x/`
 *     made crawlers take two hops. `_redirects` does not follow chains
 *     server-side, so each hop is a real round trip.
 *  3. **Dead duplicate sources.** Cloudflare applies the *first* matching rule,
 *     so a second rule for the same source never fires — and several of those
 *     shadowed rules pointed somewhere different from the live one, which made
 *     the file misleading to read.
 *
 * This script rewrites the file so that every source resolves to its final
 * target in a single hop, every source has both slash variants, and no source
 * appears twice. Comments and rule ordering are preserved.
 *
 * Two rule shapes are deliberately left structurally alone:
 *   - Splat rules (`/*`, `:splat`), whose placeholders must not be reshaped.
 *   - Absolute-URL sources (the www -> apex rules), whose host is the whole
 *     point of the rule and must survive normalization.
 *
 * Usage:
 *   node scripts/ci/normalize-redirects.mjs            # rewrite in place
 *   node scripts/ci/normalize-redirects.mjs --check    # exit 1 if not canonical
 */
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const redirectsPath = path.join(repoRoot, 'public/_redirects')
const checkOnly = process.argv.includes('--check')

const MAX_CHAIN_HOPS = 10

function isAbsolute(value) {
  return /^https?:\/\//i.test(value)
}

/** True for rules whose placeholders must survive verbatim. */
function hasPlaceholder(value) {
  return value.includes('*') || value.includes(':splat') || /:[a-z]/i.test(value)
}

function parseUrl(value) {
  if (!isAbsolute(value)) return { origin: '', pathname: value }
  try {
    const url = new URL(value)
    return { origin: url.origin, pathname: url.pathname }
  } catch {
    return null
  }
}

/** Trailing-slash-insensitive form of a URL path. */
function normalizePath(value) {
  if (!value || value === '/') return '/'
  return value.replace(/\/+$/, '') || '/'
}

/** True when a path's last segment looks like a file (`/feed.xml`). */
function isFilePath(value) {
  const last = normalizePath(value).split('/').pop() || ''
  return last.includes('.')
}

/** The canonical trailing-slash form of a path. Files keep their extension. */
function withTrailingSlash(value) {
  if (!value || value === '/') return '/'
  if (isFilePath(value)) return normalizePath(value)
  return `${normalizePath(value)}/`
}

/** Host-and-slash-insensitive identity of a URL, used for loop detection. */
function identity(value) {
  const parsed = parseUrl(value)
  if (!parsed) return value
  return `${parsed.origin}${normalizePath(parsed.pathname)}`
}

/** A rule that only adds/removes a trailing slash is terminal, not a chain hop. */
function isSlashOnlyRule(rule) {
  return identity(rule.source) === identity(rule.target)
}

function parse(text) {
  return text.split(/\r?\n/).map((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return { kind: 'raw', line }
    const [source, target, status = '301'] = trimmed.split(/\s+/)
    if (!source || !target) return { kind: 'raw', line }
    return { kind: 'rule', source, target, status }
  })
}

/**
 * Chain lookup index. Keyed on the path only, because a chain hop is about
 * which rule fires next for the target path once the host is already canonical.
 * First match wins, mirroring Cloudflare Pages.
 */
function buildIndex(rules) {
  const bySource = new Map()
  for (const rule of rules) {
    if (hasPlaceholder(rule.source) || isAbsolute(rule.source)) continue
    const key = normalizePath(rule.source)
    if (!bySource.has(key)) bySource.set(key, rule)
  }
  return bySource
}

/** Follow the chain from `target` to the URL a crawler actually lands on. */
function resolveTarget(target, bySource) {
  let current = target
  const seen = new Set([identity(current)])

  for (let hop = 0; hop < MAX_CHAIN_HOPS; hop += 1) {
    const parsed = parseUrl(current)
    if (!parsed) break

    const next = bySource.get(normalizePath(parsed.pathname))
    if (!next || isSlashOnlyRule(next) || hasPlaceholder(next.target)) break

    // Keep the origin when the chain started on an absolute URL.
    const candidate =
      parsed.origin && !isAbsolute(next.target) ? `${parsed.origin}${next.target}` : next.target

    if (seen.has(identity(candidate))) break
    seen.add(identity(candidate))
    current = candidate
  }

  return current
}

function canonicalTarget(target) {
  if (hasPlaceholder(target)) return target
  const parsed = parseUrl(target)
  if (!parsed || !parsed.pathname.startsWith('/')) return target
  return `${parsed.origin}${withTrailingSlash(parsed.pathname)}`
}

/** Both slash variants of a source, in `/foo` then `/foo/` order. */
function sourceVariants(source) {
  const parsed = parseUrl(source)
  if (!parsed || !parsed.pathname.startsWith('/')) return [source]
  const bare = normalizePath(parsed.pathname)
  if (bare === '/' || isFilePath(bare)) return [`${parsed.origin}${bare}`]
  return [`${parsed.origin}${bare}`, `${parsed.origin}${bare}/`]
}

function normalize(text) {
  const nodes = parse(text)
  const rules = nodes.filter((node) => node.kind === 'rule')
  const bySource = buildIndex(rules)

  const emitted = new Set()
  const out = []

  for (const node of nodes) {
    if (node.kind === 'raw') {
      out.push(node.line)
      continue
    }

    const { source, status } = node

    // Dead duplicate: an earlier rule already claimed this source.
    const sourceKey = identity(source)
    if (emitted.has(sourceKey)) continue
    emitted.add(sourceKey)

    const target = hasPlaceholder(node.target)
      ? node.target
      : canonicalTarget(resolveTarget(node.target, bySource))

    if (hasPlaceholder(source) || hasPlaceholder(target)) {
      out.push(`${source} ${target} ${status}`)
      continue
    }

    // Emit both slash variants so either form reaches the canonical target in a
    // single hop. The variant that *is* the target is skipped — that is what
    // makes a slash-only rule (`/safety-checker -> /safety-checker/`) come out
    // as one canonicalization rule rather than a self-referential loop.
    for (const variant of sourceVariants(source)) {
      if (variant === target) continue
      out.push(`${variant} ${target} ${status}`)
    }
  }

  return `${out.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`
}

const original = fs.readFileSync(redirectsPath, 'utf8')
const normalized = normalize(original)

const countRules = (text) =>
  text.split('\n').filter((line) => line.trim() && !line.trim().startsWith('#')).length

if (checkOnly) {
  if (original !== normalized) {
    console.error(
      '[normalize-redirects] public/_redirects is not canonical.\n' +
        'Run `npm run redirects:normalize` to flatten chains, drop shadowed sources,\n' +
        'and add the missing trailing-slash variants.',
    )
    process.exit(1)
  }
  console.log(`[normalize-redirects] OK: ${countRules(normalized)} canonical rules`)
} else {
  fs.writeFileSync(redirectsPath, normalized)
  console.log(
    `[normalize-redirects] rewrote public/_redirects: ${countRules(original)} → ${countRules(normalized)} rules`,
  )
}
