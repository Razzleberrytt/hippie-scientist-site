import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { getDeepEnrichmentRounds } from '@/lib/research-deep-enrichment-public'

export const metadata: Metadata = buildPageMetadata({
  title: 'Research Investigations | PubMed Research Source Trails',
  description: 'Browse the Deep Enrichment research archive with linked PubMed trials, reviews, and explicit independent-review status.',
  path: '/research/investigations/',
})

export default function ResearchInvestigationsPage() {
  const rounds = getDeepEnrichmentRounds()
  const investigations = rounds.flatMap((round) => round.investigations)
  const uniquePmids = new Set(investigations.flatMap((item) => item.sourcePmids))

  return (
    <div className='research-page-content mx-auto max-w-6xl space-y-9 px-4 py-8 sm:px-6 sm:py-10 lg:px-8'>
      <nav aria-label='Breadcrumb' className='text-sm text-muted'>
        <Link href='/research/' className='font-semibold text-brand-700 hover:underline'>Research</Link>
        <span aria-hidden='true' className='mx-2'>/</span>
        <span>Investigations</span>
      </nav>

      <header className='rounded-[2rem] border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>PubMed source transparency · Living research archive</p>
        <h1 className='mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-5xl'>Open research investigations</h1>
        <p className='mt-5 max-w-3xl text-base leading-8 text-muted'>
          See what our researchers are investigating, including null findings, contradictory trials, formulation questions and safety flags.
          These are <strong className='text-ink'>research-intake notes, not independently signed-off clinical reviews</strong>.
          A paper appearing here does not make its conclusions approved medical guidance, an ingredient evidence grade, or a product endorsement.
        </p>
        <dl className='mt-6 grid gap-3 sm:grid-cols-3'>
          {[
            { count: rounds.length, label: 'Available research rounds' },
            { count: investigations.length, label: 'Investigation topics' },
            { count: uniquePmids.size, label: 'Distinct linked PMIDs in these dossiers' },
          ].map((metric) => (
            <div key={metric.label} className='rounded-xl border border-brand-900/10 bg-brand-50/40 p-4'>
              <dt className='text-xs font-medium leading-5 text-muted'>{metric.label}</dt>
              <dd className='mt-1 text-3xl font-bold tabular-nums text-ink'>{metric.count.toLocaleString()}</dd>
            </div>
          ))}
        </dl>
        <p className='mt-4 max-w-3xl text-xs leading-6 text-muted'>
          Linked PMIDs count unique source identifiers within the listed research documents. They may already exist elsewhere in our research ledger;
          they are <strong>not</strong> additional admitted studies or new canonical citations.
        </p>
        <div className='mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold'>
          <a href='/research/investigations/sources.json' className='text-brand-700 hover:underline'>Download source inventory (JSON) →</a>
          <Link href='/research/source-register/' className='text-brand-700 hover:underline'>Research source register →</Link>
          <Link href='/info/methodology/' className='text-brand-700 hover:underline'>Methodology and review standards →</Link>
          <Link href='/research/operations/' className='text-brand-700 hover:underline'>Research operations →</Link>
        </div>
      </header>

      <section aria-labelledby='review-limits-heading' className='rounded-2xl border border-brand-900/15 bg-brand-50/35 p-5 sm:p-7'>
        <h2 id='review-limits-heading' className='text-xl font-semibold text-ink'>What is public—and what is not approved</h2>
        <p className='mt-3 text-sm leading-7 text-muted'>
          Every available investigation title, source link, and original research note can be opened below.
          Editorial promotion remains separate: each claim still needs an exact PMID/DOI duplicate check, population and
          preparation matching, contradiction review, qualified independent scientific signoff, and publication QA.
          The raw research appendices are openly accessible but not indexed as consumer clinical advice.
        </p>
      </section>

      <nav aria-label='Jump to research round' className='flex flex-wrap gap-2'>
        {rounds.map(({ round }) => (
          <a key={round} href={`#round-${round}`} className='rounded-full border border-brand-900/15 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50'>
            Round {round}
          </a>
        ))}
      </nav>

      {rounds.map(({ round, investigations: entries, sourceHref }) => (
        <section id={`round-${round}`} key={round} aria-labelledby={`round-${round}-heading`} className='scroll-mt-24 space-y-4'>
          <div className='flex flex-wrap items-end justify-between gap-3'>
            <div>
              <p className='eyebrow-label'>Deep Enrichment {round}</p>
              <h2 id={`round-${round}-heading`} className='mt-2 text-2xl font-semibold text-ink'>Ten investigation dossiers</h2>
            </div>
            <Link href={`/research/investigations/${round}/`} className='text-sm font-semibold text-brand-700 hover:underline'>
              Read complete round notes →
            </Link>
          </div>
          <div className='grid gap-3 md:grid-cols-2'>
            {entries.map((entry) => (
              <article key={entry.id} className='flex flex-col rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm'>
                <p className='text-xs font-bold uppercase tracking-wide text-brand-700'>{entry.id} · Research-only</p>
                <h3 className='mt-2 text-lg font-semibold leading-7 text-ink'>{entry.title}</h3>
                <p className='mt-2 text-xs text-muted'>{entry.sourcePmids.length} PubMed source link{entry.sourcePmids.length === 1 ? '' : 's'} in dossier · Study or synthesis type described in original notes · Independent review pending</p>
                <div className='mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-4 text-sm font-semibold'>
                  <Link href={`/research/investigations/${round}/#${entry.id.toLowerCase()}`} className='text-brand-700 hover:underline'>Investigation notes →</Link>
                  <a href={`https://pubmed.ncbi.nlm.nih.gov/${entry.sourcePmids[0]}/`} target='_blank' rel='noopener noreferrer' className='text-brand-700 hover:underline'>First PubMed record ↗</a>
                </div>
              </article>
            ))}
          </div>
          <a href={sourceHref} target='_blank' rel='noopener noreferrer' className='inline-flex text-xs font-semibold text-muted hover:underline'>
            See original merged dossier on GitHub ↗
          </a>
        </section>
      ))}

      <footer className='border-t border-brand-900/10 pt-6 text-sm leading-7 text-muted'>
        Research materials are supplied for transparency and further verification. This inventory does not authorize
        supplement use, medication changes, safety assurances or clinical claims. See the <Link href='/info/editorial-policy/' className='font-semibold text-brand-700 hover:underline'>editorial policy</Link>.
      </footer>
    </div>
  )
}
