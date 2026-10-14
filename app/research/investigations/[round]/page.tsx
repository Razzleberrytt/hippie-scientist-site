import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buildPageMetadata } from '@/lib/seo'
import { DEEP_ENRICHMENT_ROUND_NUMBERS, getDeepEnrichmentRounds, getDeepEnrichmentSourceOccurrences } from '@/lib/research-deep-enrichment-public'

type RoundParams = { params: Promise<{ round: string }> }

export const dynamic = 'force-static'

export function generateStaticParams() {
  return DEEP_ENRICHMENT_ROUND_NUMBERS.map((round) => ({ round: String(round) }))
}

export async function generateMetadata({ params }: RoundParams): Promise<Metadata> {
  const { round } = await params
  if (!DEEP_ENRICHMENT_ROUND_NUMBERS.includes(Number(round))) return {}
  return buildPageMetadata({
    title: `Deep Enrichment ${round} | Original Research Notes`,
    description: `Read the original ten research investigations from Deep Enrichment ${round}, with primary PubMed source links and clear scientific-review status.`,
    path: `/research/investigations/${round}/`,
    // Raw research intake is accessible on the website, but incomplete
    // independent scientific review means it must not be advertised to
    // search engines as approved consumer medical content.
    robots: { index: false, follow: true },
  })
}

export default async function DeepEnrichmentRoundPage({ params }: RoundParams) {
  const { round: roundParam } = await params
  const rounds = getDeepEnrichmentRounds()
  const doc = rounds.find((item) => String(item.round) === roundParam)
  if (!doc) notFound()
  const sourceOccurrences = getDeepEnrichmentSourceOccurrences(rounds)

  return (
    <div className='research-page-content mx-auto max-w-5xl space-y-7 px-4 py-8 sm:px-6 sm:py-10 lg:px-8'>
      <nav aria-label='Breadcrumb' className='flex flex-wrap items-center gap-2 text-sm text-muted'>
        <Link href='/research/' className='font-semibold text-brand-700 hover:underline'>Research</Link>
        <span aria-hidden='true'>/</span>
        <Link href='/research/investigations/' className='font-semibold text-brand-700 hover:underline'>Investigations</Link>
        <span aria-hidden='true'>/</span>
        <span>Round {doc.round}</span>
      </nav>

      <header className='rounded-[2rem] border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Deep Enrichment {doc.round} · Source notes</p>
        <h1 className='mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-5xl'>Ten research investigations</h1>
        <p className='mt-5 text-base leading-8 text-muted'>
          This page makes the original investigation notes publicly readable, including uncertainties, reported nulls and provenance.
          They were authored as <strong className='text-ink'>owner-authorized AI scientific editorial review</strong>,
          not as independently certified clinical conclusions. They are <strong className='text-ink'>not V_VERIFIED</strong>.
          Do not treat a preliminary appraisal as prescribing guidance or evidence that a product works.
        </p>
        <div className='mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold'>
          <a href={doc.sourceHref} target='_blank' rel='noopener noreferrer' className='text-brand-700 hover:underline'>Original merged Markdown on GitHub ↗</a>
          <Link href='/research/source-register/' className='text-brand-700 hover:underline'>Research-only source register →</Link>
          <Link href='/info/methodology/' className='text-brand-700 hover:underline'>Editorial methodology →</Link>
        </div>
      </header>

      <nav aria-label='Investigations in this round' className='rounded-2xl border border-brand-900/10 bg-brand-50/40 p-5'>
        <p className='text-sm font-semibold text-ink'>Jump to a question</p>
        <ol className='mt-3 grid gap-2 md:grid-cols-2'>
          {doc.investigations.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id.toLowerCase()}`} className='text-sm leading-6 text-brand-700 hover:underline'>
                {item.id} — {item.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {doc.investigations.map((item) => (
        <article key={item.id} id={item.id.toLowerCase()} className='scroll-mt-24 rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm sm:p-7'>
          <p className='eyebrow-label'>{item.id} · Research-only / awaiting independent review</p>
          <h2 className='mt-2 text-2xl font-semibold tracking-tight text-ink'>{item.title}</h2>
          <h3 className='mt-5 text-sm font-bold text-ink'>Linked PubMed research sources</h3>
          <p className='mt-1 text-xs leading-5 text-muted'>Some citations are research syntheses that combine earlier studies; they are not additional independent clinical trials. Check each investigation for its source type and limitations.</p>
          <ul className='mt-3 flex flex-wrap gap-2'>
            {item.sourcePmids.map((pmid) => (
              <li key={pmid} className='flex flex-wrap items-center gap-2'>
                <a href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`} target='_blank' rel='noopener noreferrer' className='inline-flex min-h-10 items-center rounded-full border border-brand-700/25 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100'>
                  PMID {pmid} ↗
                </a>
                {(sourceOccurrences.get(pmid)?.length ?? 0) > 1 ? (
                  <span className='text-xs text-muted'>Same PubMed paper reused, not another independent study.</span>
                ) : null}
                {(sourceOccurrences.get(pmid) ?? [])
                  .filter((entry) => entry.id !== item.id)
                  .map((entry) => (
                    <Link key={entry.id} href={`/research/investigations/${entry.round}/#${entry.id.toLowerCase()}`} className='text-xs font-medium text-muted underline-offset-2 hover:underline'>
                      Also cited in {entry.id}
                    </Link>
                  ))}
              </li>
            ))}
          </ul>
          <details className='mt-5 border-t border-brand-900/10 pt-4'>
            <summary className='cursor-pointer text-sm font-semibold text-brand-700 hover:underline'>
              Read complete research-intake notes (original Markdown)
            </summary>
            <p className='mt-3 text-xs leading-6 text-muted'>
              Original notes reproduced from the merged research dossier without converting preliminary interpretations into approved medical recommendations.
              Source links are provided above. Other limitations in the full text still apply.
            </p>
            <pre className='mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-brand-50/40 p-4 font-mono text-xs leading-6 text-ink sm:p-5'>
              {item.body}
            </pre>
          </details>
        </article>
      ))}

      {doc.sharedDossierNotes ? (
        <section id='round-governance' className='scroll-mt-24 rounded-2xl border border-brand-900/10 bg-brand-50/35 p-5 sm:p-7'>
          <h2 className='text-xl font-semibold text-ink'>Whole-round source integrity and editorial gates</h2>
          <p className='mt-3 text-sm leading-7 text-muted'>
            These original QA, deduplication, and release notes apply across the round. They are kept
            separate from the tenth investigation so a study-specific citation is not mistakenly
            attached to a whole-round governance statement. Scientific signoff is still pending.
          </p>
          <details className='mt-4'>
            <summary className='cursor-pointer text-sm font-semibold text-brand-700 hover:underline'>
              Read complete whole-round governance notes (original Markdown)
            </summary>
            <pre className='mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-white p-4 font-mono text-xs leading-6 text-ink sm:p-5'>
              {doc.sharedDossierNotes}
            </pre>
          </details>
        </section>
      ) : null}

      <footer className='rounded-2xl border border-brand-900/10 p-5 text-sm leading-7 text-muted'>
        These investigations are visible for accountability; <strong>source links do not mean clinical approval</strong>.
        Independent review, correct formulation/population mapping and exact citation deduplication are prerequisites for promotion into public treatment or safety advice.
        <div className='mt-3'>
          <Link href='/research/investigations/' className='font-semibold text-brand-700 hover:underline'>← Back to all research rounds</Link>
        </div>
      </footer>
    </div>
  )
}
