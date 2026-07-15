import type { Metadata } from 'next'
import Link from 'next/link'

import JsonLd from '@/components/seo/JsonLd'
import {
  getMentalHealthArticlesByCluster,
  mentalHealthArticles,
  type MentalHealthArticle,
} from '@/lib/mental-health-articles'
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  canonicalUrl,
  collectionPageJsonLd,
  itemListJsonLd,
} from '@/src/lib/seo'

const HUB_PATH = '/guides/mental-health'
const HUB_TITLE = 'Mental Health Guides: OCD and Personality Disorders'
const HUB_DESCRIPTION = 'Citation-rich, evidence-based guides to OCD, BPD, and all ten DSM-5-TR personality disorders, with diagnosis, differential diagnosis, treatment, safety, and stigma context.'

const SOURCE_LINKS = {
  nimhOcd: 'https://www.nimh.nih.gov/health/topics/obsessive-compulsive-disorder-ocd',
  apaPersonalityDisorders: 'https://www.psychiatry.org/patients-families/personality-disorders/what-are-personality-disorders',
  whoIc11: 'https://www.who.int/publications/i/item/9789240077263',
} as const

const baseMetadata = buildPageMetadata({
  title: HUB_TITLE,
  description: HUB_DESCRIPTION,
  path: HUB_PATH,
  openGraphType: 'website',
  keywords: [
    'mental health guides',
    'OCD guide',
    'BPD guide',
    'personality disorders',
    'OCD vs OCPD',
    'mental health treatment evidence',
  ],
})

export const metadata: Metadata = {
  ...baseMetadata,
  category: 'Mental Health',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

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
      href={`${HUB_PATH}/${article.slug}/`}
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
  const hubUrl = canonicalUrl(HUB_PATH)
  const breadcrumbId = `${hubUrl}#breadcrumb`
  const itemListId = `${hubUrl}#guide-list`
  const collectionId = `${hubUrl}#collection`
  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Guides', url: canonicalUrl('/guides') },
    { name: 'Mental Health', url: hubUrl },
  ], { id: breadcrumbId })
  const itemListLd = itemListJsonLd({
    id: itemListId,
    name: 'Evidence-Based Mental Health Guides',
    path: HUB_PATH,
    items: mentalHealthArticles.map((article) => ({
      name: article.title,
      url: `${HUB_PATH}/${article.slug}/`,
    })),
  })
  const collectionLd = {
    ...collectionPageJsonLd({
      title: HUB_TITLE,
      description: HUB_DESCRIPTION,
      path: HUB_PATH,
      itemListId,
      breadcrumbId,
    }),
    '@id': collectionId,
    inLanguage: 'en-US',
    dateModified: '2026-07-15',
    about: [
      { '@type': 'MedicalCondition', name: 'Obsessive-compulsive disorder', alternateName: 'OCD' },
      { '@type': 'MedicalCondition', name: 'Borderline personality disorder', alternateName: 'BPD' },
      { '@type': 'MedicalCondition', name: 'Personality disorders' },
    ],
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <JsonLd schema={collectionLd} />
      <JsonLd schema={itemListLd} />
      <JsonLd schema={breadcrumbLd} />

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

      <section className="mt-7 rounded-2xl border border-brand-700/20 bg-brand-50/60 p-5 sm:p-6" aria-labelledby="quick-answer">
        <h2 id="quick-answer" className="text-xl font-bold text-ink">Quick answer: choose the guide that matches the question</h2>
        <p className="mt-3 max-w-4xl leading-7 text-muted">
          Start with the <Link href={`${HUB_PATH}/personality-disorders-overview/`} className="font-semibold text-brand-700 hover:underline">personality-disorders overview</Link> for classification and assessment basics. Use the <Link href={`${HUB_PATH}/obsessive-compulsive-disorder/`} className="font-semibold text-brand-700 hover:underline">OCD guide</Link> for intrusive obsessions, compulsions, and evidence-based treatment, or the <Link href={`${HUB_PATH}/obsessive-compulsive-personality-disorder/`} className="font-semibold text-brand-700 hover:underline">OCPD guide</Link> for enduring perfectionism, order, and control. OCD and OCPD are different diagnoses, although they can occur together.
        </p>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-muted">
          These guides can explain diagnostic concepts and treatment evidence. They cannot determine whether you or someone else has a disorder; diagnosis requires an individualized clinical assessment.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="key-differences">
        <div className="max-w-3xl">
          <h2 id="key-differences" className="text-2xl font-bold text-ink">OCD, OCPD, and personality disorders: key differences</h2>
          <p className="mt-2 leading-7 text-muted">The shortest useful distinction is what kind of pattern is being assessed—not whether someone is merely neat, difficult, anxious, or perfectionistic.</p>
        </div>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-brand-900/10 bg-white">
          <table className="min-w-[46rem] w-full border-collapse text-left text-sm">
            <thead className="bg-brand-50/70 text-ink">
              <tr>
                <th scope="col" className="px-4 py-3 font-bold">Topic</th>
                <th scope="col" className="px-4 py-3 font-bold">Core clinical focus</th>
                <th scope="col" className="px-4 py-3 font-bold">Best starting guide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/10 text-muted">
              <tr>
                <th scope="row" className="px-4 py-4 align-top font-bold text-ink">OCD</th>
                <td className="px-4 py-4 align-top leading-6">Unwanted, recurring obsessions, compulsions, or both that are time-consuming, distressing, or interfere with daily life. <a href={SOURCE_LINKS.nimhOcd} className="font-semibold text-brand-700 hover:underline">NIMH overview</a></td>
                <td className="px-4 py-4 align-top"><Link href={`${HUB_PATH}/obsessive-compulsive-disorder/`} className="font-semibold text-brand-700 hover:underline">OCD guide →</Link></td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-4 align-top font-bold text-ink">OCPD</th>
                <td className="px-4 py-4 align-top leading-6">An enduring personality pattern involving orderliness, perfectionism, and control. It is not the same diagnosis as OCD. <a href={SOURCE_LINKS.apaPersonalityDisorders} className="font-semibold text-brand-700 hover:underline">APA overview</a></td>
                <td className="px-4 py-4 align-top"><Link href={`${HUB_PATH}/obsessive-compulsive-personality-disorder/`} className="font-semibold text-brand-700 hover:underline">OCPD guide →</Link></td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-4 align-top font-bold text-ink">Personality disorders</th>
                <td className="px-4 py-4 align-top leading-6">Persistent patterns involving how a person experiences themselves and relates to others, assessed across time, settings, functioning, culture, and development. DSM-5-TR and ICD-11 organize these diagnoses differently.</td>
                <td className="px-4 py-4 align-top"><Link href={`${HUB_PATH}/personality-disorders-overview/`} className="font-semibold text-brand-700 hover:underline">Overview →</Link></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-7 rounded-2xl border border-brand-900/10 bg-brand-50/60 p-5 sm:p-6" aria-labelledby="editorial-standard">
        <h2 id="editorial-standard" className="text-lg font-bold text-ink">How these pages were verified</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-muted">
          Claims are cited inline and linked to full references. Sources prioritize official clinical guidance, government health agencies, DSM-5-TR and ICD-11 materials, systematic reviews, meta-analyses, randomized trials, and peer-reviewed clinical reviews. All evidence was reviewed July 15, 2026.
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

      <section className="mt-10 grid gap-6 lg:grid-cols-2" aria-label="Sources and related education">
        <div className="rounded-2xl border border-brand-900/10 bg-white p-6">
          <h2 className="text-xl font-bold text-ink">Authoritative starting sources</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Individual guides include claim-level citations and full reference lists. These primary sources anchor the library’s definitions and classification context.</p>
          <ul className="mt-4 space-y-3 text-sm leading-6">
            <li><a href={SOURCE_LINKS.nimhOcd} className="font-semibold text-brand-700 hover:underline">National Institute of Mental Health: OCD</a></li>
            <li><a href={SOURCE_LINKS.apaPersonalityDisorders} className="font-semibold text-brand-700 hover:underline">American Psychiatric Association: personality disorders</a></li>
            <li><a href={SOURCE_LINKS.whoIc11} className="font-semibold text-brand-700 hover:underline">World Health Organization: ICD-11 clinical descriptions and diagnostic requirements</a></li>
          </ul>
        </div>
        <div className="rounded-2xl border border-brand-900/10 bg-white p-6">
          <h2 className="text-xl font-bold text-ink">Related education</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Use these explainers to evaluate evidence and understand overlapping processes without treating neuroscience as a diagnosis.</p>
          <ul className="mt-4 space-y-3 text-sm leading-6">
            <li><Link href="/learn/evidence-literacy/" className="font-semibold text-brand-700 hover:underline">Evidence literacy: how to assess a health claim →</Link></li>
            <li><Link href="/learn/how-emotional-regulation-works/" className="font-semibold text-brand-700 hover:underline">How emotional regulation works →</Link></li>
            <li><Link href="/learn/why-studies-conflict/" className="font-semibold text-brand-700 hover:underline">Why studies conflict →</Link></li>
          </ul>
        </div>
      </section>
    </main>
  )
}
