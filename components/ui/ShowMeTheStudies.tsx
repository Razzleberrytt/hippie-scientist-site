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
const VISIBLE_ROWS = 6

function StudyTypeBadge({ type }: { type: string }) {
  const lower = type.toLowerCase()
  let classes = 'border-stone-300/50 bg-stone-50 text-stone-700 dark:border-stone-200/20 dark:bg-stone-300/10 dark:text-stone-100'

  if (lower.includes('randomized') || lower.includes('rct') || lower.includes('placebo-controlled')) {
    classes = 'border-emerald-600/25 bg-emerald-50 text-emerald-800 dark:border-emerald-200/20 dark:bg-emerald-300/10 dark:text-emerald-100'
  } else if (
    lower.includes('meta-analysis') ||
    lower.includes('meta analysis') ||
    lower.includes('systematic review')
  ) {
    classes = 'border-blue-600/25 bg-blue-50 text-blue-800 dark:border-blue-200/20 dark:bg-blue-300/10 dark:text-blue-100'
  } else if (
    lower.includes('observational') ||
    lower.includes('cohort') ||
    lower.includes('cross-sectional')
  ) {
    classes = 'border-violet-600/25 bg-violet-50 text-violet-800 dark:border-violet-200/20 dark:bg-violet-300/10 dark:text-violet-100'
  } else if (lower.includes('human') || lower.includes('clinical trial')) {
    classes = 'border-emerald-500/20 bg-emerald-50/70 text-emerald-700 dark:border-emerald-200/20 dark:bg-emerald-300/10 dark:text-emerald-100'
  } else if (
    lower.includes('mechanistic') ||
    lower.includes('in vitro') ||
    lower.includes('cell')
  ) {
    classes = 'border-amber-500/30 bg-amber-50 text-amber-800 dark:border-amber-200/20 dark:bg-amber-300/10 dark:text-amber-100'
  } else if (
    lower.includes('animal') ||
    lower.includes('rodent') ||
    lower.includes('in vivo') ||
    lower.includes('murine')
  ) {
    classes = 'border-orange-400/30 bg-orange-50/70 text-orange-700 dark:border-orange-200/20 dark:bg-orange-300/10 dark:text-orange-100'
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${classes}`}
    >
      {type}
    </span>
  )
}

function sortByStudyType(a: Citation, b: Citation) {
  const aIdx = STUDY_TYPE_ORDER.findIndex(t => a.studyType?.toLowerCase().includes(t.toLowerCase()))
  const bIdx = STUDY_TYPE_ORDER.findIndex(t => b.studyType?.toLowerCase().includes(t.toLowerCase()))
  const aRank = aIdx === -1 ? STUDY_TYPE_ORDER.length : aIdx
  const bRank = bIdx === -1 ? STUDY_TYPE_ORDER.length : bIdx
  return aRank - bRank
}

function StudyRow({ citation, index }: { citation: Citation; index: number }) {
  const pubmedUrl = citation.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}/` : null

  return (
    <tr
      key={citation.pmid || citation.title || index}
      className="border-t border-brand-900/10 dark:border-white/10"
    >
      <td className="px-3 py-3 align-top sm:px-4">
        <p className="text-[13px] font-semibold leading-snug text-ink">
          {pubmedUrl ? (
            <a
              href={pubmedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-700 hover:underline dark:hover:text-brand-100"
            >
              {citation.title}
            </a>
          ) : (
            citation.title
          )}
        </p>
        {(citation.authors || citation.year) && (
          <p className="mt-0.5 text-[11px] text-muted">
            {citation.authors}
            {citation.year ? ` (${citation.year})` : ''}
          </p>
        )}
      </td>
      <td className="px-3 py-3 align-top sm:px-4">
        {citation.studyType ? <StudyTypeBadge type={citation.studyType} /> : <span className="text-xs text-muted">—</span>}
      </td>
      <td className="whitespace-nowrap px-3 py-3 align-top text-[12px] text-muted sm:px-4">
        {citation.sampleSize ? `n=${citation.sampleSize}` : '—'}
      </td>
      <td className="px-3 py-3 text-right align-top sm:px-4">
        {pubmedUrl ? (
          <a
            href={pubmedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-semibold text-brand-700 hover:underline dark:text-brand-100"
          >
            PubMed →
          </a>
        ) : (
          <span className="text-xs text-muted">—</span>
        )}
      </td>
    </tr>
  )
}

export default function ShowMeTheStudies({ citations }: Props) {
  if (!citations || citations.length === 0) return null

  const sorted = [...citations].sort(sortByStudyType)
  const visible = sorted.slice(0, VISIBLE_ROWS)
  const overflow = sorted.slice(VISIBLE_ROWS)

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-brand-900/10 dark:border-white/10">
      <div className="border-b border-brand-900/10 bg-brand-50/70 px-4 py-3 dark:border-white/10 dark:bg-[var(--surface-subtle)]">
        <h3 className="text-sm font-bold text-ink">Clinical Study Summaries</h3>
        <p className="mt-0.5 text-[11px] leading-5 text-muted">
          {citations.length} cited stud{citations.length === 1 ? 'y' : 'ies'} informing this profile. RCTs and reviews shown first.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-[var(--surface-card)] text-[10px] font-bold uppercase tracking-wider text-muted">
              <th className="px-3 py-2 sm:px-4">Study</th>
              <th className="px-3 py-2 sm:px-4">Type</th>
              <th className="px-3 py-2 sm:px-4">Sample</th>
              <th className="px-3 py-2 text-right sm:px-4">Source</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((citation, index) => (
              <StudyRow key={citation.pmid || citation.title || index} citation={citation} index={index} />
            ))}
          </tbody>
        </table>
      </div>
      {overflow.length > 0 && (
        <details className="group border-t border-brand-900/10 dark:border-white/10">
          <summary className="flex cursor-pointer select-none items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-100 dark:hover:text-white">
            <span aria-hidden="true" className="inline-block transition-transform group-open:rotate-90">▶</span>
            Show {overflow.length} more stud{overflow.length === 1 ? 'y' : 'ies'}
          </summary>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <tbody>
                {overflow.map((citation, index) => (
                  <StudyRow key={citation.pmid || citation.title || index} citation={citation} index={index} />
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  )
}
