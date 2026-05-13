'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PathwayVisualChip from '@/components/pathway-visual-chip'
import {
  getSemanticSessionMemory,
  getSemanticSessionSummary,
  clearSemanticSessionMemory,
  type SemanticSessionItem,
} from '@/lib/semantic-session-memory'

export default function SemanticSessionContinuity() {
  const [items, setItems] = useState<SemanticSessionItem[]>([])

  useEffect(() => {
    setItems(getSemanticSessionMemory())
  }, [])

  const summary = getSemanticSessionSummary(items)

  if (!summary.hasMemory) return null

  return (
    <section className="compact-section section-rhythm-balanced overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow-label">Continue Exploring</p>
          <h2 className="compact-heading mt-2">
            Resume your semantic exploration.
          </h2>
          <p className="compact-copy mt-2">
            Your recent pathway exploration is stored locally on this device to help continue semantic discovery without accounts or tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            clearSemanticSessionMemory()
            setItems([])
          }}
          className="button-secondary rounded-full px-4 py-2 text-sm"
        >
          Clear local history
        </button>
      </div>

      {summary.latest ? (
        <article className="compact-card section-rhythm-compact border-brand-700/20 bg-brand-50/40">
          <div className="flex flex-wrap gap-2">
            <span className="identity-kicker">Latest exploration</span>
            <span className="chip-readable">{summary.latest.type}</span>
          </div>

          <div className="space-y-2">
            <h3 className="max-w-none text-xl font-semibold tracking-tight text-ink">
              {summary.latest.title}
            </h3>

            <p className="text-sm leading-6 text-[#46574d]">
              Continue the semantic thread where you left off.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-brand-900/10 pt-3">
            {(summary.latest.signals || []).slice(0, 4).map((signal) => (
              <PathwayVisualChip key={signal} pathway={signal} />
            ))}
          </div>

          <Link href={summary.latest.href} className="text-sm font-semibold text-brand-800 hover:text-brand-700">
            Resume exploration →
          </Link>
        </article>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {items.slice(1, 7).map((item) => (
          <Link
            key={`${item.href}-${item.viewedAt}`}
            href={item.href}
            className="compact-card group section-rhythm-compact"
          >
            <div className="flex flex-wrap gap-2">
              <span className="chip-readable">{item.type}</span>
            </div>

            <div className="space-y-2">
              <h3 className="max-w-none text-lg font-semibold tracking-tight text-ink group-hover:text-brand-700">
                {item.title}
              </h3>

              <p className="text-sm leading-6 text-[#46574d]">
                Continue adjacent semantic exploration and pathway traversal.
              </p>
            </div>

            {(item.signals || []).length > 0 ? (
              <div className="flex flex-wrap gap-2 border-t border-brand-900/10 pt-3">
                {item.signals!.slice(0, 3).map((signal) => (
                  <PathwayVisualChip key={signal} pathway={signal} />
                ))}
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  )
}
