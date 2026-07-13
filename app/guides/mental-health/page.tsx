import type { Metadata } from 'next'
import Link from 'next/link'

import {
  getMentalHealthArticlesByCluster,
  mentalHealthArticles,
  type MentalHealthArticle,
} from '@/lib/mental-health-articles'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Mental Health Guides: OCD and Personality Disorders',
  description: 'Citation-rich, evidence-based guides to OCD, BPD, and all ten DSM-5-TR personality disorders, with diagnosis, differential diagnosis, treatment, safety, and stigma context.',
  path: '/guides/mental-health',
  keywords: [
    'OCD guide',
    'BPD guide',
    'personality disorders',
    'OCD vs OCPD',
    'mental health treatment evidence',
  ],
})

const FEATURED_SLUGS = [
  'personality-disorders-overview',
  'obsessive-compulsive-disorder',
  'borderline-personality-disorder',
]

function articleBySlug(slug: string): MentalHealthArticle {
  const article = mentalHealthArticles.find((candidate) => candidate.slug === slug)
  if (!article) throw new Error(`Missing mental health article: ${slug}`)
  return article
}

function ArticleCard({ article, featured = false }: { article: MentalHealthArticle; featured?: boolean }) {
  return (
    <Link
      href={`/guides/mental-health/${article.slug}/`}
      className={`block rounded-2xl border border-brand-900/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-700/30 hover:shadow-sm ${featured ? 'sm:p-6' : ''}`}
    >
      <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-bold uppercase tracking-wider text-muted">
        <span>{article.category}</span>
        {article.cluster && <span>• {article.cluster}</span>}
        <span>• {article.readingTime}</span>
      </div>
      <h3 className={`${featured ? 'mt-3 text-xl' : 'mt-2 text-lg'} font-bold leading-snug text-ink`}>{article.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{article.description}</p>
      <span className="mt-4 inline-flex text-sm font-bold text-brand-700">Read guide →</span>
    </Link>
  )
}

function ClusterSection({ title, description, articles }: { title: string; description: string; articles: MentalHealthArticle[] }) {
  return (
    <section className="mt-12" aria-labelledby={`${title.toLowerCase().replace(/\s+/g, '-')}-heading`}>
      <div className="max-w-3xl">
        <h2 id={`${title.toLowerCase().replace(/\s+/g, '-')}-heading`} className="text-2xl font-bold text-ink">{title}</h2>
        <p className="mt-2 leading-7 text-muted">{description}</p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {articles.map((article) => <ArticleCard key={article.slug} article={article} />)}
      </div>
    </section>
  )
}

export default function MentalHealthGuidesHub() {
  const featured = FEATURED_SLUGS.map(articleBySlug)

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/guides/" className="hover:text-ink">Guides</Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink">Mental Health</span>
      </nav>

      <header className="max-w-4xl">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Evidence-based mental health library</span>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">OCD and Personality Disorder Guides</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
          Citation-rich guides to obsessive-compulsive disorder, borderline personality disorder, and every named DSM-5-TR personality disorder. Each page separates established evidence from clinical uncertainty and avoids reducing people to stereotypes.
        </p>
      </header>

      <section className="mt-7 rounded-2xl border border-brand-900/10 bg-brand-50/60 p-5 sm:p-6" aria-labelledby="editorial-standard">
        <h2 id="editorial-standard" className="text-lg font-bold text-ink">How these pages were verified</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-muted">
          Claims are cited inline and linked to full references. Sources prioritize official clinical guidance, government health agencies, DSM-5-TR and ICD-11 materials, systematic reviews, meta-analyses, randomized trials, and peer-reviewed clinical reviews. All evidence was reviewed July 13, 2026.
        </p>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-muted">
          These pages are educational and cannot diagnose the reader or an absent third party. They also do not present herbs or supplements as replacements for psychotherapy, psychiatric care, or crisis treatment.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="start-here">
        <h2 id="start-here" className="text-2xl font-bold text-ink">Start here</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {featured.map((article) => <ArticleCard key={article.slug} article={article} featured />)}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-amber-700/20 bg-amber-50/70 p-5 sm:p-6" aria-labelledby="ocd-note">
        <h2 id="ocd-note" className="text-lg font-bold text-ink">Why OCD appears in this library</h2>
        <p className="mt-2 leading-7 text-muted">
          OCD is not a personality disorder. It is included because it was part of this project and because obsessive-compulsive personality disorder is frequently confused with OCD. The dedicated OCPD guide compares them directly.
        </p>
      </section>

      <ClusterSection
        title="Cluster A"
        description="Paranoid, schizoid, and schizotypal personality disorders. Research is comparatively sparse, so these pages make uncertainty and classification differences explicit."
        articles={getMentalHealthArticlesByCluster('Cluster A')}
      />
      <ClusterSection
        title="Cluster B"
        description="Antisocial, borderline, histrionic, and narcissistic personality disorders. The guides separate diagnosis from internet labels, stigma, and assumptions about abuse or dangerousness."
        articles={getMentalHealthArticlesByCluster('Cluster B')}
      />
      <ClusterSection
        title="Cluster C"
        description="Avoidant, dependent, and obsessive-compulsive personality disorders, with detailed comparisons to social anxiety, realistic dependence, OCD, autism, and other overlapping presentations."
        articles={getMentalHealthArticlesByCluster('Cluster C')}
      />

      <section className="mt-14 rounded-2xl border border-brand-900/10 bg-white p-6 sm:p-8" aria-labelledby="using-guides">
        <h2 id="using-guides" className="text-2xl font-bold text-ink">Use the guides as a map, not a verdict</h2>
        <p className="mt-3 max-w-4xl leading-7 text-muted">
          Similar symptoms can arise from trauma, mood disorders, neurodevelopmental conditions, substance effects, medical illness, unsafe environments, or ordinary personality traits. A responsible assessment looks at the pattern over time, across settings, and in the person’s cultural and developmental context.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/info/methodology/" className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800">Read our methodology</Link>
          <Link href="/info/disclaimer/" className="rounded-full border border-brand-700 px-5 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50">Medical disclaimer</Link>
        </div>
      </section>
    </main>
  )
}
