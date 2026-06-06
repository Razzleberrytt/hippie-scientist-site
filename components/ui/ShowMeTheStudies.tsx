export interface Citation {
  title: string
  pmid?: string
  year?: number | string
  authors?: string
  studyType?: string
  sampleSize?: string | number
}

interface Props {
  citations: Citation[]
}

const STUDY_TYPE_ORDER = ['Randomized controlled trial', 'Systematic review', 'Meta-analysis', 'Observational', 'Mechanistic', 'Animal', 'In vitro']

function sortByStudyType(a: Citation, b: Citation) {
  const aIdx = STUDY_TYPE_ORDER.findIndex(t => a.studyType?.toLowerCase().includes(t.toLowerCase()))
  const bIdx = STUDY_TYPE_ORDER.findIndex(t => b.studyType?.toLowerCase().includes(t.toLowerCase()))
  const aRank = aIdx === -1 ? STUDY_TYPE_ORDER.length : aIdx
  const bRank = bIdx === -1 ? STUDY_TYPE_ORDER.length : bIdx
  return aRank - bRank
}

export default function ShowMeTheStudies({ citations }: Props) {
  if (!citations || citations.length === 0) return null

  const sorted = [...citations].sort(sortByStudyType)

  return (
    <details className="group">
      <summary className="flex cursor-pointer items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted select-none hover:text-ink transition-colors">
        <span className="text-brand-500 group-open:rotate-90 transition-transform inline-block">▶</span>
        Show me the studies ({citations.length})
      </summary>
      <div className="mt-3 rounded-xl border border-brand-900/10 bg-white/70 p-3 space-y-2">
        <p className="text-[11px] leading-5 text-muted">
          Research sources informing this profile. Study type ordering: RCTs and reviews first, then observational and mechanistic work.
        </p>
        <div className="space-y-2">
          {sorted.map((c, i) => {
            const pubmedUrl = c.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${c.pmid}/` : null
            return (
              <div
                key={c.pmid || c.title || i}
                className="rounded-lg border border-brand-900/10 bg-white/90 p-3 space-y-1.5"
              >
                <p className="text-[12px] font-semibold text-ink leading-snug">
                  {pubmedUrl ? (
                    <a
                      href={pubmedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline hover:text-brand-700"
                    >
                      {c.title}
                    </a>
                  ) : (
                    c.title
                  )}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {c.authors && (
                    <span className="text-[11px] text-muted">{c.authors}{c.year ? ` (${c.year})` : ''}</span>
                  )}
                  {!c.authors && c.year && (
                    <span className="text-[11px] text-muted">{c.year}</span>
                  )}
                  {c.studyType && (
                    <span className="text-[11px] font-medium text-brand-700">{c.studyType}</span>
                  )}
                  {c.sampleSize && (
                    <span className="text-[11px] text-muted">n={c.sampleSize}</span>
                  )}
                  {pubmedUrl && (
                    <a
                      href={pubmedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-medium text-brand-700 hover:underline"
                    >
                      PubMed →
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </details>
  )
}
