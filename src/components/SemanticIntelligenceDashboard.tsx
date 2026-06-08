import Link from 'next/link'
import type { GraphNode } from '../types/graph'
import { getEvidenceConfidence } from '../../lib/evidence-confidence'
import { getAlternatives } from '../../lib/semantic-relationship-engine'
import { rankEntitiesForGoal } from '../../lib/goal-matching-engine'
import { getRelatedPageSuggestions } from '../../lib/semantic-seo'

type Props = {
  node: GraphNode
}

const SUPPORTED_GOALS = ['sleep', 'stress', 'anxiety', 'focus', 'energy', 'inflammation', 'pain', 'cognition', 'longevity']

export function SemanticIntelligenceDashboard({ node }: Props) {
  const conf = getEvidenceConfidence(node)
  const alternatives = getAlternatives(node.slug).slice(0, 3)
  
  // Find top goal matches for this specific entity
  const goalMatches = SUPPORTED_GOALS
    .map((goal) => {
      const matches = rankEntitiesForGoal(goal)
      const match = matches.find((m) => m.slug === node.slug)
      return match ? { goal, ...match } : null
    })
    .filter(Boolean)
    .sort((a, b) => (b?.score || 0) - (a?.score || 0))
    .slice(0, 3)

  const seoPages = getRelatedPageSuggestions(node.slug).filter(p => p.type === 'comparison').slice(0, 3)

  return (
    <div className="card-premium p-6 sm:p-8 space-y-8 bg-white border border-brand-900/10 rounded-2xl">
      <div className="space-y-2">
        <p className="eyebrow-label">Intelligence Report</p>
        <h3 className="text-2xl font-semibold tracking-tight text-ink">Semantic Intelligence & Decision Metrics</h3>
        <p className="text-sm leading-6 text-muted">
          Real-time cross-referenced relationship engine scores, evidence grading, and structured decision context.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Evidence Confidence Grading Card */}
        <div className="border border-brand-900/10 rounded-xl p-5 bg-[#fffdf7]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-900/60">Evidence Confidence</span>
            <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-emerald-50 text-emerald-700 border border-emerald-700/10">
              {conf.confidenceLabel}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-ink">{(conf.evidenceWeight * 100).toFixed(0)}%</span>
              <span className="text-xs text-muted">Confidence Index</span>
            </div>
            <p className="text-sm leading-6 text-[#33443a]">{conf.evidenceExplanation}</p>
            {conf.downgradeReasons.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-brand-900/5">
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-amber-700/80">Context Limitations:</span>
                <ul className="list-disc pl-4 text-xs text-muted leading-relaxed space-y-1">
                  {conf.downgradeReasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Top Goal Alignments */}
        <div className="border border-brand-900/10 rounded-xl p-5 bg-[#fffdf7]">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-900/60 block mb-3">Goal Alignments</span>
          <div className="space-y-4">
            {goalMatches.length > 0 ? (
              goalMatches.map((m: any) => (
                <div key={m.goal} className="space-y-1">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span className="capitalize text-ink">{m.goal}</span>
                    <span className="text-emerald-700">{(m.score * 100).toFixed(0)}% match</span>
                  </div>
                  <div className="w-full bg-brand-900/5 rounded-full h-1.5">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${m.score * 100}%` }}></div>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{m.reasons[0]}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">No prominent goal matches mapped for this entity.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 pt-6 border-t border-brand-900/10">
        {/* Mechanistically Similar */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-900/60 block">Mechanistic Alternatives</span>
          <div className="space-y-2">
            {alternatives.length > 0 ? (
              alternatives.map((alt) => (
                <Link
                  key={alt.relatedSlug}
                  href={`/${node.type === 'herb' ? 'herbs' : 'compounds'}/${alt.relatedSlug}`}
                  className="flex items-center justify-between rounded-xl border border-brand-900/10 bg-white px-4 py-3 text-sm font-semibold text-[#33443a] transition hover:border-brand-700/25 hover:text-brand-800"
                >
                  <span className="capitalize">{alt.relatedSlug.replace('-', ' ')}</span>
                  <span className="text-xs text-muted font-normal">{(alt.score * 100).toFixed(0)}% overlap</span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted">No mechanistically similar alternatives mapped.</p>
            )}
          </div>
        </div>

        {/* SEO Cross-linking suggestions */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-900/60 block">Suggested Comparisons</span>
          <div className="space-y-2">
            {seoPages.length > 0 ? (
              seoPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="flex items-center justify-between rounded-xl border border-brand-900/10 bg-white px-4 py-3 text-sm font-semibold text-[#33443a] transition hover:border-brand-700/25 hover:text-brand-800"
                >
                  <span>{page.label}</span>
                  <span className="text-xs text-muted font-normal">Compare →</span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted">No comparison views generated yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
