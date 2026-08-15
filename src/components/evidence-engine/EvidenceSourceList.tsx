import type { EvidenceEngineSource } from '../../lib/evidence-engine'

type EvidenceSourceListProps = {
  sources: EvidenceEngineSource[]
}

export default function EvidenceSourceList({ sources }: EvidenceSourceListProps) {
  if (sources.length === 0) return null

  return (
    <section className="mt-4" aria-labelledby="claim-evidence-table-title">
      <p id="claim-evidence-table-title" className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
        Claim-specific evidence
      </p>
      <div className="mt-2 overflow-x-auto rounded-xl border border-brand-900/10">
        <table className="w-full min-w-[1120px] border-collapse text-left text-sm leading-6">
          <thead className="bg-brand-50/70 text-xs uppercase tracking-[0.08em] text-muted">
            <tr>
              <th scope="col" className="px-3 py-2 font-bold">Study</th>
              <th scope="col" className="px-3 py-2 font-bold">Design</th>
              <th scope="col" className="px-3 py-2 font-bold">N</th>
              <th scope="col" className="px-3 py-2 font-bold">Dose</th>
              <th scope="col" className="px-3 py-2 font-bold">Duration</th>
              <th scope="col" className="px-3 py-2 font-bold">Population</th>
              <th scope="col" className="px-3 py-2 font-bold">Outcome</th>
              <th scope="col" className="px-3 py-2 font-bold">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-900/10 bg-white/70 dark:bg-white/5">
            {sources.map((source) => (
              <tr key={source.source_id} className="align-top">
                <td className="px-3 py-3">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand-800 hover:text-brand-700 hover:underline"
                  >
                    {source.title || source.citation_label}
                  </a>
                  <span className="mt-1 block text-xs text-muted">{source.year || 'Year not recorded'}</span>
                  {source.source_note ? (
                    <span className="mt-1 block text-xs leading-5 text-muted">{source.source_note}</span>
                  ) : null}
                </td>
                <td className="px-3 py-3 text-muted">{source.source_type || '—'}</td>
                <td className="px-3 py-3 text-muted">
                  {typeof source.sample_size === 'number' && source.sample_size > 0
                    ? source.sample_size.toLocaleString()
                    : '—'}
                </td>
                <td className="px-3 py-3 text-muted">{source.dose || '—'}</td>
                <td className="px-3 py-3 text-muted">{source.duration || '—'}</td>
                <td className="px-3 py-3 text-muted">{source.population || '—'}</td>
                <td className="px-3 py-3 text-muted">{source.outcome || '—'}</td>
                <td className="px-3 py-3 text-muted">{source.result || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
