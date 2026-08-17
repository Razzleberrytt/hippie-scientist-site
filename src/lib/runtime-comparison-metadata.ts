import type { Metadata } from 'next'

import { getUnifiedRuntimeRecords } from '@/src/lib/runtime-record-index'
import { buildPageMetadata } from '@/src/lib/seo'
import {
  canRenderRuntimeComparison,
  type RuntimeComparisonSideConfig,
} from '@/src/lib/runtime-comparison-resolution'

type RuntimeComparisonMetadataInput = {
  title: string
  description: string
  path: string
  left: RuntimeComparisonSideConfig
  right: RuntimeComparisonSideConfig
}

/**
 * Metadata for a runtime comparison page that tells the truth about whether the
 * page will actually render.
 *
 * These pages resolve both ingredients at request time and call `notFound()`
 * when either side is not publishable — correct behaviour, since a comparison
 * built on a record the site will not publish is not a page worth having. The
 * metadata, however, was static, so a page that 404s still declared
 * `index, follow` while Next's not-found boundary added its own `noindex`. Two
 * contradictory robots tags in one document, which search engines resolve by
 * taking the restrictive one.
 *
 * Two pages were in that state — lions-mane-vs-bacopa, whose `lions-mane`
 * record is NOINDEX, and magnesium-glycinate-vs-citrate, whose
 * `magnesium-citrate` record is NEEDS_REVIEW. Fifteen more pages share the
 * pattern and would join them the moment an ingredient is demoted.
 *
 * Availability is computed with the same resolver the renderer uses, so the two
 * cannot disagree.
 */
export async function buildRuntimeComparisonMetadata({
  title,
  description,
  path,
  left,
  right,
}: RuntimeComparisonMetadataInput): Promise<Metadata> {
  const base = buildPageMetadata({ title, description, path })
  const available = await canRenderRuntimeComparison(left, right, getUnifiedRuntimeRecords)
  if (available) return base

  return {
    ...base,
    robots: { index: false, follow: true },
  }
}
