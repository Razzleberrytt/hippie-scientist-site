import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { blogJsonLd, breadcrumbJsonLd, buildPageMetadata, faqPageJsonLd, SITE_URL } from '@/lib/seo'
import { getGoalArticle, getGoalCluster, getRelatedGoalArticles } from '@/lib/goal-clusters'
import { getSleepArticleContent } from '@/lib/sleep-cluster-content'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import EvidenceMeter from '../EvidenceMeter'
import EvidenceLegend from '../EvidenceLegend'
import PathwayDiagram from '../PathwayDiagram'
import NewsletterSignup from '../NewsletterSignup'
import RecommendedProduct from '../RecommendedProduct'

type GoalClusterArticlePageProps = {
  slug: string
}

export function goalClusterArticleMetadata(slug: string): Metadata {
  const article = getGoalArticle(slug)
  if (!article) {
    return {
      title: 'Article | The Hippie Scientist',
      description: 'Evidence-first supplement article.',
    }
  }

  return buildPageMetadata({
    title: article.seoTitle,
    description: article.description,
    path: `/articles/${article.slug}/`,
    openGraphType: 'article',
  })
}

export default function GoalClusterArticlePage({ slug }: GoalClusterArticlePageProps) {
  const article = getGoalArticle(slug)
  if (!article || article.category !== 'sleep') {
    notFound()
  }

  const cluster = getGoalCluster(article.category)
  const content = getSleepArticleContent(slug)
  const relatedArticles = getRelatedGoalArticles(slug, 5)
  const articlePath = `/articles/${article.slug}/`
  const canonicalUrl = `${SITE_URL}${articlePath}`
  const faqSchema = faqPageJsonLd({ pagePath: articlePath, questions: content.faq })
  const schemas = [
    blogJsonLd(
      {
        title: article.title,
        slug: article.slug,
        date: '2026-06-12',
        description: article.description,
      },
      articlePath,
    ),
    breadcrumbJsonLd([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Articles', url: `${SITE_URL}/articles/` },
      { name: cluster?.title ?? 'Goal Cluster', url: `${SITE_URL}${cluster?.goalHref ?? '/goals/'}` },
      { name: article.title, url: canonicalUrl },
    ]),
    faqSchema,
  ].filter((schema): schema is Exclude<typeof schema, null> => schema !== null)

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {schemas.map((schema, index) => (
        <SchemaGraphScript key={`${article.slug}-schema-${index}`} graph={schema} />
      ))}

      <nav className="mb-6 flex flex-wrap gap-2 text-sm font-semibold text-brand-800" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-700 hover:underline">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/articles/" className="hover:text-brand-700 hover:underline">Articles</Link>
        <span aria-hidden="true">/</span>
        <Link href="/goals/sleep/" className="hover:text-brand-700 hover:underline">Sleep</Link>
      </nav>

      <article className="space-y-8">
        <header className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
          <p className="eyebrow-label">{content.eyebrow}</p>
          <h1 className="heading-premium mt-3 text-ink">{article.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted">{article.description}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-brand-800">
            <span className="rounded-full border border-brand-900/10 bg-brand-50 px-3 py-1">{article.readingTime}</span>
            <span className="rounded-full border border-brand-900/10 bg-brand-50 px-3 py-1">Educational only</span>
            <span className="rounded-full border border-brand-900/10 bg-brand-50 px-3 py-1">Updated June 12, 2026</span>
          </div>
        </header>

        <section className="card-premium p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-ink">TL;DR</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-muted">
            {content.tlDr.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-700" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="card-premium p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-ink">Evidence snapshot</h2>
            <div className="mt-5">
              <EvidenceMeter data={content.evidence} context={article.title} defaultOpen />
            </div>
          </div>
          <EvidenceLegend highlightTier={content.evidence.tier} defaultOpen />
        </section>

        <section className="card-premium p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-ink">Mechanism</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            Mechanisms are used here to explain plausibility, not to upgrade weak clinical evidence into strong claims.
          </p>
          <div className="mt-6">
            <PathwayDiagram data={content.pathway} />
          </div>
        </section>

        {content.comparisonRows ? (
          <section className="card-premium p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-ink">Decision table</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-900/10">
                    <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Option</th>
                    <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Evidence</th>
                    <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Typical dose</th>
                    <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Best fit</th>
                    <th className="py-3 text-xs font-bold uppercase tracking-wider text-ink">Caution</th>
                  </tr>
                </thead>
                <tbody>
                  {content.comparisonRows.map((row) => (
                    <tr key={row.name} className="border-b border-brand-900/5 align-top last:border-0">
                      <td className="py-3 pr-4 font-semibold text-ink">
                        {row.href ? (
                          <Link href={row.href} className="text-brand-800 hover:text-brand-700 hover:underline">
                            {row.name}
                          </Link>
                        ) : row.name}
                      </td>
                      <td className="py-3 pr-4 text-muted">{row.evidence}</td>
                      <td className="py-3 pr-4 text-muted">{row.dose}</td>
                      <td className="py-3 pr-4 text-muted">{row.bestFor}</td>
                      <td className="py-3 text-muted">{row.caution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {content.sections.map((section) => (
          <section key={section.heading} className="card-premium p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-ink">{section.heading}</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-muted">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}

        {content.productSlug ? (
          <RecommendedProduct
            slug={content.productSlug}
            title={article.kind === 'product-guide' ? 'Existing magnesium product data' : 'Product-quality starting points'}
            limit={3}
          />
        ) : null}

        <section className="card-premium p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-ink">FAQ</h2>
          <div className="mt-5 divide-y divide-brand-900/10">
            {content.faq.map((item) => (
              <details key={item.question} className="py-4" open>
                <summary className="cursor-pointer text-sm font-semibold text-ink">{item.question}</summary>
                <p className="mt-2 text-sm leading-7 text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl border border-emerald-800/15 bg-emerald-50/70 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-ink">{content.cta.title}</h2>
            <p className="mt-2 text-sm leading-7 text-muted">{content.cta.body}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/supplement-safety-checklist/"
                className="inline-flex min-h-11 items-center rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-900"
              >
                Get the safety checklist
              </Link>
              <Link
                href="/goals/sleep/"
                className="inline-flex min-h-11 items-center rounded-full border border-brand-900/10 bg-white px-5 py-2.5 text-sm font-bold text-ink hover:bg-brand-50"
              >
                Compare sleep options
              </Link>
            </div>
          </div>
          <NewsletterSignup
            title="Get weekly supplement evidence updates"
            description="One practical email a week on evidence quality, safety flags, and better supplement decisions. Includes the free safety checklist."
            ctaLabel="Get the checklist"
            location={`sleep-cluster-${article.slug}`}
            variant="card"
          />
        </section>

        <section className="card-premium p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-ink">Related sleep articles</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {relatedArticles.map((related) => (
              <Link
                key={related.slug}
                href={`/articles/${related.slug}/`}
                className="rounded-2xl border border-brand-900/10 bg-white/70 p-4 transition hover:border-brand-700/20 hover:bg-white"
              >
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">{related.kind.replace('-', ' ')}</span>
                <span className="mt-1 block text-sm font-semibold text-ink">{related.title}</span>
                <span className="mt-2 block text-xs leading-5 text-muted">{related.description}</span>
              </Link>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/articles/magnesium-for-adhd/" className="text-brand-800 hover:text-brand-700 hover:underline">
              ADHD-adjacent magnesium guide →
            </Link>
            <Link href="/articles/l-theanine-for-adhd/" className="text-brand-800 hover:text-brand-700 hover:underline">
              L-theanine and focus guide →
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-brand-900/10 bg-white/70 p-5">
          <h2 className="text-base font-semibold text-ink">References</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            {content.references.map((reference) => (
              <li key={reference.href}>
                <a
                  href={reference.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-800 hover:text-brand-700 hover:underline"
                >
                  {reference.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  )
}
