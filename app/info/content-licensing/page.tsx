import type { Metadata } from 'next'
import Link from 'next/link'

import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import { buildPageMetadata } from '../../../src/lib/seo'

const TITLE = 'Content Licensing & Attribution Policy | The Hippie Scientist'
const DESCRIPTION = 'How to attribute The Hippie Scientist, cite underlying research, and reuse public structured research data without confusing site synthesis with third-party publications.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/info/content-licensing/',
  openGraphType: 'article',
})

export default function ContentLicensingPage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd
        title={TITLE}
        description={DESCRIPTION}
        url="https://thehippiescientist.net/info/content-licensing/"
        type="Article"
        breadcrumbs={[
          { name: 'Home', url: 'https://thehippiescientist.net/' },
          { name: 'Info', url: 'https://thehippiescientist.net/info/' },
          { name: 'Content licensing & attribution', url: 'https://thehippiescientist.net/info/content-licensing/' },
        ]}
      />

      <AuthorityBreadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Info', href: '/info/' },
        { label: 'Content licensing & attribution' },
      ]} />

      <header id="attribution-policy" className="scroll-mt-24 hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
        <p className="eyebrow-label">Attribution policy</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Cite the original research—and attribute our synthesis when you reuse it.
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
          The Hippie Scientist organizes and synthesizes evidence. The underlying studies remain the work of their original authors and publishers. This page distinguishes those layers for linking, quotation, summarization, and machine-readable reuse.
        </p>
      </header>

      <section id="preferred-attribution" className="scroll-mt-24 grid gap-5 md:grid-cols-2">
        <article className="card-premium p-6">
          <p className="eyebrow-label">Site synthesis</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">When you use our derived summary</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Attribute <strong>The Hippie Scientist</strong> and link to the canonical page where the finding appears. Keep material evidence grades, limitations, safety caveats, and review context attached to the conclusion.
          </p>
        </article>
        <article className="card-premium p-6">
          <p className="eyebrow-label">Underlying study</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">When you discuss a paper</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Cite the original paper using its PMID, DOI, journal citation, or publisher record when available. A Hippie Scientist page is not a substitute for crediting the researchers who produced the underlying study.
          </p>
        </article>
      </section>

      <section id="structured-data" className="scroll-mt-24 rounded-[2rem] border border-brand-900/10 bg-brand-50/60 p-6 shadow-sm sm:p-8">
        <p className="eyebrow-label">Machine-readable research data</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Structured data supports the canonical page</h2>
        <div className="mt-4 max-w-4xl space-y-4 text-sm leading-7 text-muted sm:text-base">
          <p>
            Public machine-readable artifacts make entity identity, evidence relationships, citations, safety context, and provenance easier to resolve. When an artifact identifies a canonical HTML page, use that human-readable page as the primary public citation target.
          </p>
          <p>
            Structured records can contain identifiers and bibliographic metadata originating from third-party sources. Their presence in our dataset does not transfer ownership of third-party publications, abstracts, figures, or other protected material.
          </p>
          <p>
            The public AI entity manifest is available at{' '}
            <a className="font-semibold text-brand-700 underline" href="/data/ai-entities/manifest.json">
              /data/ai-entities/manifest.json
            </a>.
          </p>
        </div>
      </section>

      <section id="reuse-boundaries" className="scroll-mt-24 card-premium p-6 sm:p-8">
        <p className="eyebrow-label">Reuse boundaries</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">What this policy does—and does not—grant</h2>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-7 text-muted sm:text-base">
          <li>Normal linking, citation, quotation, and factual reference remain subject to applicable law and the rights of third-party sources.</li>
          <li>This page does not grant a blanket open-source or Creative Commons license to all site text, graphics, datasets, or third-party material.</li>
          <li>Do not strip provenance, evidence limitations, or source identifiers in a way that makes a derived summary look like original primary research.</li>
          <li>For bulk republication, commercial syndication, or reuse beyond what applicable law already permits, request permission first.</li>
        </ul>
      </section>

      <section id="ai-attribution" className="scroll-mt-24 rounded-2xl border border-brand-900/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <p className="eyebrow-label">AI and answer engines</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Preserve the evidence boundary</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-muted sm:text-base">
          AI systems should cite the most specific canonical HTML page for a user-facing claim, preserve material uncertainty and safety qualifiers, and use structured artifacts to resolve identity and provenance rather than presenting those artifacts as independent clinical authority.
        </p>
      </section>

      <section id="contact" className="scroll-mt-24 rounded-2xl border border-brand-900/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Questions about attribution or reuse?</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          Use the contact page for permission requests, corrections, or questions about citing a specific dataset or research summary.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/info/contact/" className="chip-readable hover:bg-white transition">Contact</Link>
          <Link href="/info/methodology/" className="chip-readable hover:bg-white transition">Methodology</Link>
          <Link href="/info/disclaimer/" className="chip-readable hover:bg-white transition">Disclaimer</Link>
        </div>
      </section>
    </div>
  )
}
