import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getEducationArticleBySlug, getAllEducationArticles, parseMdxBlocks } from '@/lib/education'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import LastUpdatedBadge from '../../../src/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import TrialDesignInsight from '@/components/education/TrialDesignInsight'
import EvidenceGradeRationale from '@/components/education/EvidenceGradeRationale'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const articles = getAllEducationArticles()
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getEducationArticleBySlug(slug)
  if (!article) return {}

  return buildPageMetadata({
    title: article.title,
    description: article.description,
    path: `/education/${slug}`,
    openGraphType: 'article',
  })
}

// Inline markdown formatting helper
function inlineFormat(text: string): string {
  return text
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, (_match, label: string, href: string) => {
      const isExternal = /^https?:\/\//i.test(href)
      const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${href}"${attrs} class="font-semibold text-brand-700 hover:text-brand-800 hover:underline">${label}</a>`
    })
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="rounded bg-brand-50 px-1 py-0.5 font-mono text-sm text-brand-800">$1</code>')
}

export default async function EducationArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getEducationArticleBySlug(slug)
  if (!article) notFound()

  const blocks = parseMdxBlocks(article.content)

  return (
    <article className="container-page py-10 space-y-8 max-w-4xl mx-auto px-4" aria-labelledby="education-article-title">
      {/* Breadcrumbs */}
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: article.title },
        ]}
      />

      {/* Hero Header Area */}
      <header className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">
            Education
          </span>
          <span className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted capitalize">
            {article.evidenceFocus}
          </span>
          <span className="text-muted">·</span>
          <span className="text-muted">{article.readingTime}</span>
        </div>

        <h1 id="education-article-title" className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          {article.title}
        </h1>

        <div className="mt-3">
          <LastUpdatedBadge date={article.lastUpdated} label="Last updated" />
        </div>

        {article.description && (
          <p className="mt-4 text-base leading-7 text-[#46574d]">
            {article.description}
          </p>
        )}
      </header>

      {/* Article Content Body */}
      <div className="rounded-[1.25rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-6">
        {blocks.map((block, index) => {
          if (block.type === 'h2') {
            const id = block.text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            return (
              <h2
                key={index}
                id={id}
                className="mt-8 mb-3 text-2xl font-semibold tracking-tight text-ink border-b border-brand-900/5 pb-2 first:mt-0"
                dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }}
              />
            )
          }

          if (block.type === 'h3') {
            return (
              <h3
                key={index}
                className="mt-6 mb-2 text-xl font-semibold tracking-tight text-ink"
                dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }}
              />
            )
          }

          if (block.type === 'h4') {
            return (
              <h4
                key={index}
                className="mt-4 mb-2 text-base font-semibold text-ink"
                dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }}
              />
            )
          }

          if (block.type === 'blockquote') {
            return (
              <blockquote
                key={index}
                className="my-4 border-l-4 border-brand-700/40 bg-brand-50/60 py-3 pl-5 pr-4 text-sm leading-7 text-brand-900/80 italic rounded-r-lg"
                dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }}
              />
            )
          }

          if (block.type === 'hr') {
            return <hr key={index} className="my-6 border-brand-900/10" />
          }

          if (block.type === 'ul' || block.type === 'ol') {
            const Tag = block.type
            return (
              <Tag key={index} className={`ml-6 space-y-2 ${block.type === 'ul' ? 'list-disc' : 'list-decimal'}`}>
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="text-sm leading-7 text-[#46574d]"
                    dangerouslySetInnerHTML={{ __html: inlineFormat(item) }}
                  />
                ))}
              </Tag>
            )
          }

          if (block.type === 'table') {
            return (
              <div key={index} className="my-6">
                <ResponsiveTable label="Education data table">
                  <table className="min-w-[760px] w-full text-sm">
                    <caption className="sr-only">
                      Structured evidence table for {article.title}
                    </caption>
                    <thead>
                      <tr className="border-b border-brand-900/10">
                        {block.headers.map((header, j) => (
                          <th
                            key={j}
                            scope="col"
                            className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted"
                            dangerouslySetInnerHTML={{ __html: inlineFormat(header) }}
                          />
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-900/5">
                      {block.rows.map((row, rIndex) => (
                        <tr key={rIndex} className="align-top">
                          {row.map((cell, cIndex) => (
                            cIndex === 0 ? (
                              <th
                                key={cIndex}
                                scope="row"
                                className="py-3 pr-4 text-left align-top font-semibold leading-6 text-ink"
                                dangerouslySetInnerHTML={{ __html: inlineFormat(cell) }}
                              />
                            ) : (
                              <td
                                key={cIndex}
                                className="py-3 pr-4 leading-6 text-[#46574d]"
                                dangerouslySetInnerHTML={{ __html: inlineFormat(cell) }}
                              />
                            )
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ResponsiveTable>
              </div>
            )
          }

          if (block.type === 'TrialDesignInsight') {
            return (
              <TrialDesignInsight key={index} {...block.props}>
                <div className="space-y-2" dangerouslySetInnerHTML={{ __html: inlineFormat(block.content) }} />
              </TrialDesignInsight>
            )
          }

          if (block.type === 'EvidenceGradeRationale') {
            return (
              <EvidenceGradeRationale key={index} {...block.props}>
                <div className="space-y-2" dangerouslySetInnerHTML={{ __html: inlineFormat(block.content) }} />
              </EvidenceGradeRationale>
            )
          }

          return (
            <p
              key={index}
              className="text-sm leading-[1.8] text-[#46574d]"
              dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }}
            />
          )
        })}
      </div>

      {/* Footer / Navigation */}
      <footer className="flex justify-between items-center pt-4 border-t border-brand-900/10" aria-label="Education article navigation">
        <Link href="/education" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
          ← Back to Education Index
        </Link>
      </footer>
    </article>
  )
}
