import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { getResearchSourceRegister } from '@/lib/research-source-register'
import { getPublicEvidenceDataset } from '@/lib/public-evidence-dataset'
import { buildResearchSemanticNetwork } from '@/lib/research-semantic-network'
import SourceRegisterClient from './SourceRegisterClient'

export const metadata: Metadata = buildPageMetadata({
  title: 'PubMed Research Source Register | The Hippie Scientist',
  description: 'Browse research-only PubMed references, exact-verified source titles, research topics and primary-source links. Not a clinical evidence grade or recommendation.',
  path: '/research/source-register/',
  robots: { index: false, follow: true },
})

export default async function SourceRegisterPage() {
  const data = getResearchSourceRegister()
  const publicEvidence = await getPublicEvidenceDataset()
  const semantic = buildResearchSemanticNetwork(
    data.records,
    publicEvidence.ingredients.map(item => ({ name: item.name, href: item.path })),
    publicEvidence.studies.map(study => ({ pmid: study.pmid, id: study.id })),
  )
  const publicRecords = data.records.map(record => ({
    wave: record.wave,
    pmid: record.pmid,
    title: record.title,
    journal: record.journal,
    year: record.year,
    category: record.category,
    doi: record.doi,
  }))
  // Show the conceptual map immediately; load the detailed paper graph separately.
  const semanticSummary = { concepts: semantic.concepts, bridges: semantic.bridges, summary: semantic.summary }

  return (
    <div className='research-page-content mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8'>
      <nav aria-label='Breadcrumb' className='text-sm text-muted'>
        <Link href='/research/' className='font-semibold text-brand-700 hover:underline'>Research</Link>
        <span aria-hidden='true' className='mx-2'>/</span>
        <span>Source register</span>
      </nav>

      <section className='overflow-hidden rounded-[2rem] border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Transparent research inventory</p>
        <h1 className='mt-3 max-w-4xl font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl'>
          Follow the sources, not just the headline.
        </h1>
        <p className='mt-5 max-w-3xl text-base leading-8 text-muted'>
          Search the actual PubMed identities behind our enrichment work. This source register is separate from the
          editorial evidence database: a verified paper is <strong className='text-ink'>not</strong> automatically a validated
          treatment claim, ingredient relationship, safety conclusion, or recommendation.
        </p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/learn/citation-explorer/' className='inline-flex min-h-11 items-center rounded-full bg-brand-800 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700'>
            Explore published evidence →
          </Link>
          <Link href='/info/methodology/' className='inline-flex min-h-11 items-center rounded-full border border-brand-900/15 px-5 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50'>
            Research methodology
          </Link>
        </div>
      </section>

      <section aria-labelledby='source-coverage-heading' className='space-y-4'>
        <div>
          <p className='eyebrow-label'>Research ledger · through wave {data.throughWave.toLocaleString()}</p>
          <h2 id='source-coverage-heading' className='mt-2 text-2xl font-semibold tracking-tight text-ink'>What the counts actually mean</h2>
        </div>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {[
            { count: data.totalIndexedPmids, label: 'Distinct indexed PubMed IDs', note: 'Research inventory identities, not published evidence grades' },
            { count: data.latestSourceVerified, label: 'Exact-verified source records', note: 'Latest batch · titles, abstracts, and identifiers checked' },
            { count: data.priorPmidOnly, label: 'Historical identifiers', note: 'Look up via PubMed · no invented metadata' },
            { count: 0, label: 'Automatically promoted claims', note: 'Ingredient grades and claims require a separate review' },
          ].map(item => (
            <div key={item.label} className='rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm'>
              <p className='text-3xl font-bold tabular-nums tracking-tight text-ink'>{item.count.toLocaleString()}</p>
              <h3 className='mt-2 text-sm font-semibold text-ink'>{item.label}</h3>
              <p className='mt-1 text-xs leading-5 text-muted'>{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <aside className='rounded-2xl border border-amber-700/20 bg-amber-50 p-5 text-sm leading-7 text-amber-950' aria-label='Source review disclosure'>
        <strong>Important review boundary:</strong> The enrichment ledger does not establish clinical efficacy,
        safety, human-study quality, or ingredient-specific conclusions. Semantic relationships here are text-matched, exploratory research-navigation links, not causal or clinical conclusions. Source verification checks metadata, not
        whether a study supports a particular claim. The <Link href='/learn/citation-explorer/' className='font-semibold underline'>Citation Explorer</Link> displays
        separately reviewed, indexable runtime evidence. Counts from these two systems must not be added together.
      </aside>

      <SourceRegisterClient records={publicRecords} previousCount={data.priorPmidOnly} categories={data.categories} networkSummary={semanticSummary} />

      <p className='text-xs leading-6 text-muted'>
        Provenance: SHA-pinned NCBI EFetch receipts for waves 7001–7500 and the authoritative cumulative PMID index.
        Search results offer bibliographic metadata and provenance-labeled semantic discovery, never unreviewed clinical interpretations. This inventory is intentionally excluded from search indexing
        until the editorial and publication policy is separately reviewed.
      </p>
    </div>
  )
}
