import type { ReactNode } from 'react'

import {
  safeCandidates,
  safeObject,
  safeText,
  shouldRenderSemanticSection,
} from '@/lib/runtime-render-guards'

type SemanticSectionBoundaryProps = {
  source: unknown
  candidates: unknown
  children: ReactNode
  fallback?: ReactNode
  minCandidates?: number
}

export function SemanticSectionBoundary({
  source,
  candidates,
  children,
  fallback = null,
  minCandidates = 1,
}: SemanticSectionBoundaryProps) {
  const record = safeObject(source)
  const safeCandidateList = safeCandidates(candidates)

  const canRender =
    shouldRenderSemanticSection(record, safeCandidateList) &&
    safeText(record.slug).length > 0 &&
    safeCandidateList.length >= minCandidates

  if (!canRender) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export function SemanticSectionFallback({
  title = 'More educational pathways coming soon',
  description = 'This section is being expanded as more semantic relationships become available.',
}: {
  title?: string
  description?: string
}) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white/70 p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
          Semantic Discovery
        </p>

        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h2>

        <p className="max-w-3xl text-sm leading-7 text-muted">
          {description}
        </p>
      </div>
    </section>
  )
}
