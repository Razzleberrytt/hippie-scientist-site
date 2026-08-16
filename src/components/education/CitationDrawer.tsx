'use client'

import { useState, useEffect } from 'react'

export interface CitationDetail {
  id: string
  title: string
  authors?: string
  journal?: string
  year?: string
  pmid?: string
  design: 'RCT' | 'Systematic Review' | 'Meta-Analysis' | 'Cohort Study' | 'Preclinical' | string
  sampleSize?: number | string
  grade: 'A' | 'B' | 'C' | 'D' | string
  bias: 'Low' | 'Moderate' | 'High' | string
  takeaway: string
  url?: string
}

// Global helper to trigger the citation drawer with real source metadata supplied
// by the calling evidence component.
export function triggerCitation(detail: CitationDetail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-citation-drawer', { detail }))
  }
}

export default function CitationDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [detail, setDetail] = useState<CitationDetail | null>(null)

  useEffect(() => {
    function handleOpen(event: Event) {
      const customEvent = event as CustomEvent<CitationDetail>
      if (customEvent.detail) {
        setDetail(customEvent.detail)
        setIsOpen(true)
      }
    }

    window.addEventListener('open-citation-drawer', handleOpen)
    return () => window.removeEventListener('open-citation-drawer', handleOpen)
  }, [])

  if (!isOpen || !detail) return null

  // Evidence-grade colors are semantic rather than generic brand styling.
  const getGradeClass = (grade: string) => {
    switch (grade.toUpperCase()) {
      case 'A': return 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
      case 'B': return 'bg-blue-50 text-blue-700 border-blue-200/50'
      case 'C': return 'bg-amber-50 text-amber-700 border-amber-200/50'
      default: return 'bg-[var(--surface-subtle)] text-muted border-brand-900/10'
    }
  }

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="flex w-screen max-w-md transform flex-col justify-between border-l border-[var(--border-soft)] bg-[var(--surface-card-strong)] p-6 shadow-2xl transition-all duration-300 ease-in-out dark:bg-[var(--surface-card-strong)]">
          <div className="space-y-6 overflow-y-auto pr-1">
            <div className="flex items-start justify-between border-b border-brand-900/10 pb-4">
              <h2 className="text-lg font-bold text-ink">Evidence Verification</h2>
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="text-sm font-semibold text-muted/60 hover:text-ink"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2">
              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getGradeClass(detail.grade)}`}>
                GRADE {detail.grade} EVIDENCE
              </span>
              <h3 className="text-base font-bold leading-snug text-ink">{detail.title}</h3>
              {detail.authors && (
                <p className="text-xs font-medium text-muted">{detail.authors} ({detail.year || 'n/d'})</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-brand-900/10 bg-[var(--surface-subtle)] p-4 text-xs">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted/70">Study Design</p>
                <p className="mt-0.5 font-semibold text-ink">{detail.design}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted/70">Cohort Size</p>
                <p className="mt-0.5 font-semibold text-ink">{detail.sampleSize || 'N/A'}</p>
              </div>
              <div className="mt-2">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted/70">Risk of Bias</p>
                <p className="mt-0.5 font-semibold text-ink">{detail.bias} Bias</p>
              </div>
              <div className="mt-2">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted/70">Journal</p>
                <p className="mt-0.5 truncate font-semibold text-ink">{detail.journal || 'Source not specified'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Evidence Takeaway</h4>
              <p className="rounded-xl border border-brand-900/10 bg-brand-50/30 p-3 text-xs leading-relaxed text-muted">
                {detail.takeaway}
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3 border-t border-brand-900/10 pt-4">
            {(detail.pmid || detail.url) && (
              <a
                href={detail.url || `https://pubmed.ncbi.nlm.nih.gov/${detail.pmid}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl bg-brand-800 py-3 text-center text-xs font-bold text-white transition hover:bg-brand-700"
              >
                {detail.pmid ? `Open in PubMed (PMID: ${detail.pmid})` : 'Open source'}
              </a>
            )}
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="rounded-xl bg-[var(--surface-subtle)] px-4 py-3 text-xs font-semibold text-muted transition hover:text-ink"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
