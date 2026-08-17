import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import type { Metadata } from 'next'

import { SITE_URL } from '@/src/lib/site'

/**
 * Metadata corrections for routes that are also redirect sources.
 *
 * `public/_redirects` 301s some legacy paths at the CDN edge, but the static
 * export still builds a page at the same path. Those pages declared themselves
 * canonical, so one piece of content existed at two URLs each claiming to be
 * the original — with only the edge rule preventing duplicate indexation.
 * `/articles/ashwagandha` is the clearest case: the content file exists and is
 * redirected away from its own URL.
 *
 * A redirected page is not the canonical home of its content. It is marked
 * `noindex` and pointed at the destination, which consolidates signals without
 * deleting anything: if the edge rule ever fails the page still renders and
 * still tells crawlers where the real version lives.
 */

let cachedRedirects: Map<string, string> | null = null

function normalize(pathname: string): string {
  const trimmed = pathname.trim().replace(/\/+$/, '')
  return trimmed || '/'
}

function loadRedirectMap(): Map<string, string> {
  if (cachedRedirects) return cachedRedirects

  const map = new Map<string, string>()
  const file = path.join(process.cwd(), 'public', '_redirects')
  if (!existsSync(file)) {
    cachedRedirects = map
    return map
  }

  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [source, destination] = trimmed.split(/\s+/)
    if (!source || !destination) continue
    // Wildcards and placeholders do not map to a single built path.
    if (source.includes('*') || source.includes(':')) continue
    // Trailing-slash normalization is the same page, not a duplicate.
    if (normalize(source) === normalize(destination)) continue
    map.set(normalize(source), destination)
  }

  cachedRedirects = map
  return map
}

/**
 * The destination this path redirects to, or null when it is not a redirect
 * source.
 */
export function redirectDestinationFor(pathname: string): string | null {
  return loadRedirectMap().get(normalize(pathname)) ?? null
}

/**
 * Apply redirect-source corrections to a page's metadata.
 *
 * Returns the metadata unchanged when the path is not redirected, so callers
 * can wrap unconditionally.
 */
export function withRedirectSourceMetadata(metadata: Metadata, pathname: string): Metadata {
  const destination = redirectDestinationFor(pathname)
  if (!destination) return metadata

  const absolute = destination.startsWith('http') ? destination : `${SITE_URL}${destination}`
  return {
    ...metadata,
    alternates: { ...metadata.alternates, canonical: absolute },
    robots: { index: false, follow: true },
  }
}
