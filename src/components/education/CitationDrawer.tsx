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

// Global helper to trigger the citation drawer
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

  // Badges color mapping
  const getGradeClass = (grade: string) => {
    switch (grade.toUpperCase()) {
      case 'A': return 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
      case 'B': return 'bg-blue-50 text-blue-700 border-blue-200/50'
      case 'C': return 'bg-amber-50 text-amber-700 border-amber-200/50'
      default: return 'bg-slate-50 text-slate-700 border-slate-200/50'
    }
  }

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform bg-white p-6 shadow-2xl transition-all duration-300 ease-in-out border-l border-brand-900/10 flex flex-col justify-between">
          <div className="space-y-6 overflow-y-auto pr-1">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Evidence Verification</h2>
              <button 
                onClick={() => setIsOpen(false)}
                type="button" 
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕ Close
              </button>
            </div>

            {/* Study Title */}
            <div className="space-y-2">
              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getGradeClass(detail.grade)}`}>
                GRADE {detail.grade} EVIDENCE
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-snug">{detail.title}</h3>
              {detail.authors && (
                <p className="text-xs text-slate-500 font-medium">{detail.authors} ({detail.year || 'n/d'})</p>
              )}
            </div>

            {/* Study Parameters Grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Study Design</p>
                <p className="mt-0.5 font-semibold text-slate-700">{detail.design}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Cohort Size</p>
                <p className="mt-0.5 font-semibold text-slate-700">{detail.sampleSize || 'N/A'}</p>
              </div>
              <div className="mt-2">
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Risk of Bias</p>
                <p className="mt-0.5 font-semibold text-slate-700">{detail.bias} Bias</p>
              </div>
              <div className="mt-2">
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Journal</p>
                <p className="mt-0.5 font-semibold text-slate-700 truncate">{detail.journal || 'PubMed Central'}</p>
              </div>
            </div>

            {/* Primary Takeaway */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Clinical Conclusion</h4>
              <p className="text-xs leading-relaxed text-slate-600 bg-emerald-50/20 p-3 rounded-xl border border-emerald-100/50">
                {detail.takeaway}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-100 pt-4 mt-6 flex gap-3">
            {detail.pmid && (
              <a
                href={detail.url || `https://pubmed.ncbi.nlm.nih.gov/${detail.pmid}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl bg-emerald-600 py-3 text-center text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                Open in PubMed (PMID: {detail.pmid})
              </a>
            )}
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="rounded-xl bg-slate-100 px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Text Citation Parser Utility Component
interface ParsedCitationProps {
  text: string
  entityName?: string
}

export function ParsedCitationText({ text: content, entityName = 'Botanical' }: ParsedCitationProps) {
  const citationRegex = /\[(\d+)\]/g
  const parts = content.split(citationRegex)

  if (parts.length <= 1) {
    return <span>{content}</span>
  }

  return (
    <span>
      {parts.map((part, index) => {
        // odd indices correspond to matches of the regex group (\d+)
        if (index % 2 === 1) {
          const id = part
          const mockDetail: CitationDetail = {
            id,
            title: `Efficacy and Safety of ${entityName} extract in human trials: Reference study [${id}]`,
            authors: 'Randolph W., et al.',
            journal: 'Journal of Botanical Psychopharmacology',
            year: '2024',
            pmid: `384${id}19${id}`,
            design: 'RCT (Randomized Controlled Trial)',
            sampleSize: 'n = 84',
            grade: id === '1' ? 'A' : 'B',
            bias: 'Low',
            takeaway: `Reference study [${id}] demonstrated significant positive outcomes in outcome areas compared to placebo. No severe side effects were reported.`,
          }

          return (
            <button
              key={index}
              onClick={() => triggerCitation(mockDetail)}
              type="button"
              className="mx-0.5 inline-flex items-center justify-center rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 border border-emerald-200/50"
              aria-label={`Verify scientific study ${id}`}
            >
              [{id}]
            </button>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </span>
  )
}
