import type { Metadata } from 'next'
import { buildPageMetadata } from '../src/lib/seo'
import { formatDisplayLabel } from '@/lib/display-utils'

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

export function buildEntityMetadata(entity: Entity, opts: { kind: 'herb'|'compound'; path: string; canIndex: boolean }): Metadata {
  const display = formatDisplayLabel(entity.name || entity.slug || opts.kind)
  const title = `${display} ${opts.kind === 'herb' ? 'Herb Profile' : 'Compound Profile'} | The Hippie Scientist`
  const snippets = [entity.summary, entity.description, entity.scientific_name, entity.evidence_tier, entity.safety_level].filter(Boolean).join(' • ')
  const description = snippets.slice(0, 158) || `${display} evidence, mechanisms, effects, and safety context.`

  return buildPageMetadata({
    title,
    description,
    path: opts.path,
    openGraphType: 'article',
    robots: opts.canIndex ? undefined : { index: false, follow: true },
  })
}
