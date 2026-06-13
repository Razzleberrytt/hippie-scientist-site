import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata, SEO_YEAR } from '@/lib/seo'
import type { StandardEvidenceLabel } from '@/lib/decision-primitives'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import LastUpdatedBadge from '@/components/editorial/LastUpdatedBadge'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import {
  evidenceDigestIssues,
  evidenceDigestEntryCount,
  evidenceDigestLatestDate,
  type DigestEntry,
} from '@/data/evidence-digest'

export const metadata: Metadata = buildPageMetadata({
  title: `Evidence Digest ${SEO_YEAR} — Human-Trial Summaries by Goal`,
  description:
    'A conservative, recurring digest of what controlled human research actually supports — graded honestly and linked to goal pathways and full profiles. No hype.',
  path: '/evidence-digest',
  openGraphType: 'website',
})

const GRADE_STYLES: Partial<Record<StandardEvidenceLabel, string>> = {
  'Strong evidence': 'bg-emerald-100 text-emerald-900 border-emerald-300',
  'Moderate evidence': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Limited evidence': 'bg-amber-50 text-amber-800 border-amber-200',
  'Preliminary evidence': 'bg-amber-50 text-amber-900 border-amber-200',
  'Insufficient evidence': 'bg-rose-50 text-rose-800 border-rose-200',
}

function GradePill({ grade }: { grade: StandardEvidenceLabel }) {
  const cls = GRADE_STYLES[grade] ?? 'bg-brand-50 text-brand-900 border-brand-900/10'
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {grade}
    </span>
  )
}

function EntryCard({ entry }: { entry: DigestEntry }) {
  return (
    <article className="card-premium p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-ink">{entry.title}</h3>
        <GradePill grade={entry.grade} />
      </div>

      <p className="mt-3 text-sm font-medium leading-7 text-ink/90">{entry.takeaway}</p>

      <dl className="mt-4 grid gap-3 text-sm leading-6 sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700">Study type</dt>
          <dd className="mt-0.5 text-muted">{entry.studyType}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700">Population</dt>
          <dd className="mt-0.5 text-muted">{entry.population}</dd>
        </div>
      </dl>

      <div className="mt-4 space-y-2 text-sm leading-7">
        <p className="text-muted">
          <span className="font-semibold text-ink">What the evidence shows: </span>
          {entry.finding}
        </p>
        <p className="rounded-xl border border-amber-600/10 bg-amber-50/50 px-3 py-2 text-amber-950">
          <span className="font-semibold">Honest limitation: </span>
          {entry.limitation}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-brand-900/5 pt-4 text-xs font-semibold">
        <Link
          href={`/goals/${entry.goalSlug}`}
          className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-brand-800 transition hover:bg-brand-100"
        >
          Goal: {entry.goalLabel} →
        </Link>
        {entry.profileHref ? (
          <Link href={entry.profileHref} className="text-emerald-700 hover:underline">
            Full profile & citations →
          </Link>
        ) : null}
        {entry.sources.map((source) => (
          <a
            key={source.href}
            href={source.href}
            target={source.href.startsWith('http') ? '_blank' : undefined}
            rel={source.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="text-muted hover:text-ink hover:underline"
          >
            {source.label} ↗
          </a>
        ))}
      </div>
    </article>
  )
}

export default function EvidenceDigestPage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd
        title="Evidence Digest"
        description="A recurring, conservatively graded digest of human-trial evidence summaries, organized by health goal."
        url="https://thehippiescientist.net/evidence-digest"
        type="CollectionPage"
      />

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Evidence Digest' },
        ]}
      />

      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Compounding evidence log</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">The Evidence Digest</h1>
        <p className="mt-4 max-w-3xl text-muted">
          A running log of what controlled human research actually supports — graded conservatively,
          connected to the goal pathways, and pointed at the full profiles that carry the citations.
          We summarize the <em>state of the evidence</em>, not marketing claims. Interesting does not
          mean recommended.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <LastUpdatedBadge date={evidenceDigestLatestDate} />
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-900/10 bg-white/80 px-3 py-1 text-xs font-semibold text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
            {evidenceDigestEntryCount} human-evidence summaries
          </span>
          <Link href="/methodology" className="text-xs font-semibold text-emerald-700 hover:underline">
            How we grade evidence →
          </Link>
        </div>
      </section>

      {evidenceDigestIssues.map((issue) => (
        <section key={issue.number} id={`issue-${issue.number}`} className="scroll-mt-24 space-y-5">
          <div className="flex flex-col gap-2 border-b border-brand-900/10 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">{issue.title}</h2>
              <LastUpdatedBadge date={issue.date} label="Reviewed" />
            </div>
            <p className="max-w-3xl text-sm leading-7 text-muted">{issue.intro}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {issue.entries.map((entry) => (
              <EntryCard key={entry.title} entry={entry} />
            ))}
          </div>
        </section>
      ))}

      <section className="card-premium p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-ink">How to use the digest</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Treat each summary as a triage note, not a prescription. Start from the grade, read the honest
          limitation, then open the full profile before deciding anything. Always review medications,
          health conditions, and pregnancy status with a qualified clinician.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/methodology" className="text-emerald-700 hover:underline">Evidence grading methodology →</Link>
          <Link href="/safety-checker" className="text-emerald-700 hover:underline">Run the safety checker →</Link>
          <Link href="/goals" className="text-emerald-700 hover:underline">Browse goal pathways →</Link>
        </div>
      </section>

      <NewsletterCtaBlock
        title="Get each new Evidence Digest"
        description="Concise, conservatively graded human-evidence summaries — no hype, unsubscribe anytime."
        location="evidence-digest"
      />

      <footer className="rounded-2xl border border-brand-900/10 bg-brand-950/[0.02] p-5 text-xs leading-6 text-muted">
        Educational only. Not medical advice. Evidence grades reflect the strength and consistency of
        controlled human research at the time of review and can change as new trials are published.
      </footer>
    </div>
  )
}
