import type { ReactNode } from 'react'

interface ArticleLayoutProps {
  children: ReactNode;
  toc?: ReactNode;
  zone?: 'supplement' | 'harm-reduction';
}

export default function ArticleLayout({ children, toc, zone }: ArticleLayoutProps) {
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
        <article className="article-body min-w-0">
          {children}
        </article>
        {toc && (
          <aside aria-label="Page navigation" className="hidden lg:block">
            <div className="sticky top-20 rounded-xl border border-brand-900/10 bg-white/90 p-4 shadow-sm">
              {toc}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
