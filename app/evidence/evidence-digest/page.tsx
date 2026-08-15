import type { Metadata } from 'next'
import Link from 'next/link'

import { SafetyDisclaimerBox } from '@/components/monetization/SafetyDisclaimerBox'
import { evidenceDigestEditions, evidenceDigestProgram } from '@/content/evidenceDigest'

export const metadata: Metadata = {
  title: 'Evidence Digest — Source Verification in Progress',
  description:
    'The Evidence Digest is being rebuilt around source-verified human research. Verified editorial editions remain available while study-level cards are re-audited.',
  alternates: { canonical: '/evidence/evidence-digest/' },
  robots: {
    index: false,
    follow: true,
  },
}

const VERIFIED_ROUTES = [
  {
    title: 'Evidence Report',
    href: '/evidence/evidence-report/',
    description: 'A broader evidence review with methodology and research context.',
  },
  {
    title: 'Evidence Lookup',
    href: '/evidence/evidence-checker/',
    description: 'Browse compounds by the evidence labels currently used in the structured library.',
  },
  {
    title: 'Sleep Guides',
    href: '/guides/sleep/',
    description: 'Current sleep evidence pages with source-specific limitations kept visible.',
  },
  {
    title: 'Methodology',
    href: '/info/methodology/',
    description: 'How evidence strength, safety language, and editorial conclusions are evaluated.',
  },
]

const verifiedEditions = evidenceDigestEditions.filter(
  (edition) => edition.editorialStatus === 'verified' && edition.indexable,
)

export default function EvidenceDigestPage() {
  return (
    <div className='container-page mx-auto max-w-4xl space-y-8 py-10'>
      <header className='hero-shell rounded-[2rem] border border-brand-900/10 bg-white/95 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Evidence integrity review</p>
        <h1 className='mt-2 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl'>
          Evidence Digest
        </h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted'>
          Study-level digest cards remain withdrawn while their identifiers, interventions, outcomes, and evidence labels are re-audited against the underlying publications.
        </p>
        <p className='mt-3 max-w-3xl text-sm leading-6 text-muted'>
          Verified editorial editions can still publish on the {evidenceDigestProgram.cadence} cadence when they do not depend on unresolved study-level claims. The quality gate is intentionally stricter than the publishing schedule.
        </p>
        <p className='mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700'>
          Review status: source verification in progress · Updated August 15, 2026
        </p>
      </header>

      {verifiedEditions.length > 0 ? (
        <section className='space-y-4' aria-labelledby='verified-digest-editions'>
          <div>
            <p className='eyebrow-label'>Verified editions</p>
            <h2 id='verified-digest-editions' className='mt-2 text-2xl font-bold tracking-tight text-ink'>
              Publish only what clears the evidence gate
            </h2>
            <p className='mt-2 text-sm leading-6 text-muted'>{evidenceDigestProgram.retentionPromise}</p>
          </div>
          {verifiedEditions.map((edition) => (
            <Link
              key={edition.slug}
              href={`/evidence/evidence-digest/${edition.slug}/`}
              className='block rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm transition hover:border-brand-700/25 hover:bg-brand-50/30'
            >
              <p className='text-xs font-bold uppercase tracking-[0.14em] text-brand-700'>{edition.publishedAt}</p>
              <h3 className='mt-2 text-xl font-bold text-ink'>{edition.title}</h3>
              <p className='mt-2 text-sm leading-6 text-muted'>{edition.description}</p>
              <span className='mt-4 inline-flex text-sm font-semibold text-brand-800'>Read edition →</span>
            </Link>
          ))}
        </section>
      ) : null}

      <section className='rounded-2xl border border-amber-900/15 bg-amber-50/55 p-5 sm:p-6'>
        <h2 className='text-xl font-bold text-ink'>What is being checked before study updates return</h2>
        <ul className='mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted'>
          <li>Every PMID or DOI must resolve to the study described on the card.</li>
          <li>Ingredient form, dose, duration, population, comparator, and sample size must match the publication.</li>
          <li>Outcome language must distinguish statistical findings from clinically meaningful effects.</li>
          <li>Limitations and conflicts of interest must stay visible when they affect interpretation.</li>
          <li>Evidence labels must reflect the broader body of evidence, not the existence of one positive trial.</li>
        </ul>
      </section>

      <section className='space-y-5' aria-labelledby='verified-research-routes'>
        <div>
          <p className='eyebrow-label'>Continue researching</p>
          <h2 id='verified-research-routes' className='mt-2 text-2xl font-bold tracking-tight text-ink'>
            Use the currently maintained evidence routes
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-muted'>
            These sections remain available while the digest is rebuilt. Individual pages can still change as new research is reviewed, so check their citations and last-reviewed context rather than treating any label as permanent.
          </p>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          {VERIFIED_ROUTES.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className='rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm transition hover:border-brand-700/25 hover:bg-brand-50/30'
            >
              <h3 className='font-bold text-ink'>{route.title}</h3>
              <p className='mt-2 text-sm leading-6 text-muted'>{route.description}</p>
              <span className='mt-4 inline-flex text-sm font-semibold text-brand-800'>Open →</span>
            </Link>
          ))}
        </div>
      </section>

      <SafetyDisclaimerBox />
    </div>
  )
}
