import type { ReactNode } from 'react'
import KeyDetailsBox from './KeyDetailsBox'
import RelatedArticles from './RelatedArticles'
import type { KeyDetailsBoxProps } from './KeyDetailsBox'
import type { RelatedArticle } from './RelatedArticles'

interface ArticleLayoutProps {
  children: ReactNode;
  /** Explicit TOC node (e.g. <TableOfContents headings={…} /> or <TableOfContentsAuto />).
   *  Omit to render the article full-width with no sidebar. */
  toc?: ReactNode;
  zone?: 'supplement' | 'harm-reduction';
  /** Renders a KeyDetailsBox above the article body when provided. */
  keyDetails?: KeyDetailsBoxProps;
  /** Renders a RelatedArticles section below the article body when provided. */
  relatedArticles?: RelatedArticle[];
}

export default function ArticleLayout({
  children,
  toc,
  zone,
  keyDetails,
  relatedArticles,
}: ArticleLayoutProps) {
  return (
    <div
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10"
      data-zone={zone}
    >
      {toc && (
        <div className="mb-6 lg:hidden">
          {toc}
        </div>
      )}
      <div className={toc ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start lg:gap-10' : undefined}>
        <div className="min-w-0">
          {keyDetails && (
            <div className="mb-6">
              <KeyDetailsBox {...keyDetails} zone={zone} />
            </div>
          )}
          <article className="article-body">
            {children}
          </article>
          {relatedArticles && relatedArticles.length > 0 && (
            <div className="mt-10">
              <RelatedArticles articles={relatedArticles} />
            </div>
          )}
        </div>
        {toc && (
          <aside aria-label="Page navigation" className="hidden lg:block">
            <div className="sticky top-20 rounded-xl border border-brand-800/10 bg-white/95 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-brand-950/60">
              {toc}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
