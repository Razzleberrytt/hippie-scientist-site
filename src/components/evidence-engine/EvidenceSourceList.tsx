import type { EvidenceEngineSource } from '@/lib/evidence-engine'

type EvidenceSourceListProps = {
  sources: EvidenceEngineSource[]
}

export default function EvidenceSourceList({ sources }: EvidenceSourceListProps) {
  return (
    <div className="mt-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Claim-specific sources</p>
      <ul className="mt-2 space-y-2 text-sm leading-6">
        {sources.map((source) => (
          <li key={source.source_id}>
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-800 hover:text-brand-700 hover:underline">
              {source.citation_label}
            </a>
            <span className="text-muted"> - {source.title} ({source.year})</span>
            {source.source_note ? <span className="block text-xs text-muted">{source.source_note}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
