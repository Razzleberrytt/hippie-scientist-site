import type { Metadata } from 'next'
import Link from 'next/link'
import { getEvidenceDigestEdition } from '@/content/evidenceDigest'
import { buildPageMetadata, SITE_URL } from '@/src/lib/seo'
import { SafetyDisclaimerBox } from '@/components/monetization/SafetyDisclaimerBox'

const SLUG = '2026-08-evidence-literacy'
const edition = getEvidenceDigestEdition(SLUG)

if (!edition) throw new Error(`Missing evidence digest edition: ${SLUG}`)

const PATH = `/evidence/evidence-digest/${SLUG}/`
const SHARE_SUBJECT = encodeURIComponent(edition.title)
const SHARE_BODY = encodeURIComponent(`Worth reading: ${edition.title}\n\n${SITE_URL}${PATH}`)

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: edition.title,
    description: edition.description,
    path: PATH,
    openGraphType: 'article',
  }),
  robots: {
    index: edition.indexable && edition.editorialStatus === 'verified',
    follow: true,
  },
}

export default function EvidenceLiteracyDigestEditionPage() {
  return (
    <article className='container-page mx-auto max-w-4xl space-y-8 py-10'>
      <nav aria-label='Breadcrumb' className='flex flex-wrap gap-2 text-sm font-semibold text-brand-800'>
        <Link href='/'>Home</Link>
        <span aria-hidden='true'>/</span>
        <Link href='/evidence/evidence-digest/'>Evidence Digest</Link>
        <span aria-hidden='true'>/</span>
        <span aria-current='page'>Evidence literacy</span>
      </nav>

      <header className='rounded-[2rem] border border-brand-900/10 bg-white/95 p-6 shadow-sm sm:p-9'>
        <p className='eyebrow-label'>Biweekly Evidence Digest</p>
        <h1 className='mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl'>{edition.title}</h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>{edition.description}</p>
        <div className='mt-5 flex flex-wrap gap-3 text-xs font-semibold text-muted'>
          <span>Published {edition.publishedAt}</span>
          <span aria-hidden='true'>•</span>
          <span>Editorial status: {edition.editorialStatus}</span>
        </div>
      </header>

      {edition.sections.map((section) => (
        <section key={section.heading} className='rounded-2xl border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
          <h2 className='text-2xl font-bold tracking-tight text-ink'>{section.heading}</h2>
          <div className='mt-4 space-y-4 text-base leading-8 text-muted'>
            {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          {section.href && section.linkLabel ? (
            <Link href={section.href} className='mt-5 inline-flex font-semibold text-brand-800 hover:underline'>
              {section.linkLabel} →
            </Link>
          ) : null}
        </section>
      ))}

      <section className='rounded-2xl border border-emerald-900/15 bg-emerald-50/65 p-6 sm:p-8'>
        <h2 className='text-2xl font-bold text-ink'>Useful? Forward it.</h2>
        <p className='mt-3 text-sm leading-7 text-muted'>
          The easiest growth loop for the digest is a useful issue sent to one person who would genuinely benefit from the same research workflow.
        </p>
        <div className='mt-5 flex flex-wrap gap-3'>
          <a
            href={`mailto:?subject=${SHARE_SUBJECT}&body=${SHARE_BODY}`}
            className='inline-flex min-h-11 items-center rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-900'
          >
            Forward this digest
          </a>
          <Link
            href='/info/newsletter/'
            className='inline-flex min-h-11 items-center rounded-full border border-brand-900/10 bg-white px-5 py-2.5 text-sm font-bold text-ink hover:bg-brand-50'
          >
            Get future editions
          </Link>
        </div>
      </section>

      <SafetyDisclaimerBox />
    </article>
  )
}
