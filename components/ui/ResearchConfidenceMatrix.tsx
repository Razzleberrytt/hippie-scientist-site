import type { TopicConfidenceSummary } from '@/lib/research-intelligence'

const confidenceClasses: Record<string, string> = {
  Moderate: 'border-emerald-700/15 bg-emerald-50 text-emerald-800',
  Preliminary: 'border-amber-700/20 bg-amber-50 text-amber-800',
  Limited: 'border-stone-300 bg-paper-100 text-[#5d5548]',
}

export default function ResearchConfidenceMatrix({ topics = [] }: { topics?: TopicConfidenceSummary[] }) {
  const visible = topics.filter(item => item.topic && item.confidence).slice(0, 5)
  if (visible.length < 2) return null

  return (
    <div className="card-premium p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow-label">Topic confidence</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">Research confidence matrix</h3>
        </div>
        <p className="max-w-md text-sm leading-6 text-[#46574d]">Confidence is inferred only from recurring profile signals, evidence tier language, PubMed IDs, claims, and mechanisms.</p>
      </div>

      <div className="mt-5 grid gap-3">
        {visible.map(item => (
          <div key={item.topic} className="surface-subtle rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-ink">{item.topic}</h4>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${confidenceClasses[item.confidence] || confidenceClasses.Limited}`}>
                {item.confidence}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#46574d]">{item.rationale}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
