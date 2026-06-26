import type { Metadata } from 'next'
import { buildPageMetadata } from '../src/lib/seo'
import { formatDisplayLabel } from '@/lib/display-utils'

const TITLE_LIMIT = 60

type Entity = {
  slug?: string
  name?: string
  scientific_name?: string
  summary?: string
  description?: string
  evidence_tier?: string
  mechanisms?: string[]
  primary_effects?: string[]
  safety_level?: string
}

function shortenTitlePart(value: string, maxLength: number): string {
  const cleaned = value.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= maxLength) return cleaned
  const cutoff = cleaned.slice(0, maxLength - 1)
  const lastSpace = cutoff.lastIndexOf(' ')
  return `${(lastSpace > 24 ? cutoff.slice(0, lastSpace) : cutoff).trim()}…`
}

function entityTitle(display: string, kind: 'herb'|'compound'): string {
  const suffix = kind === 'herb' ? 'Herb Guide' : 'Compound Guide'
  const name = shortenTitlePart(display, TITLE_LIMIT - suffix.length - 1)
  return `${name} ${suffix}`
}

export function buildEntityMetadata(entity: Entity, opts: { kind: 'herb'|'compound'; path: string; canIndex: boolean }): Metadata {
  const display = formatDisplayLabel(entity.name || entity.slug || opts.kind)
  const title = entityTitle(display, opts.kind)
  const snippets = [entity.summary, entity.description, entity.scientific_name, entity.evidence_tier, entity.safety_level].filter(Boolean).join(' • ')
  const description = snippets.slice(0, 158) || `${display} reference profile.`

  return buildPageMetadata({
    title,
    description,
    path: opts.path,
    openGraphType: 'article',
    robots: opts.canIndex ? undefined : { index: false, follow: true },
  })
}
