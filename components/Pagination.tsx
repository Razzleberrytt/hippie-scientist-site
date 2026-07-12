import Link from 'next/link'

type PaginationProps = {
  basePath: string
  currentPage: number
  totalPages: number
  itemLabel: string
}

function pageHref(basePath: string, page: number) {
  return page === 1 ? basePath : `${basePath}/page/${page}`
}

function visiblePages(currentPage: number, totalPages: number) {
  const pages = new Set([1, totalPages])
  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page > 0 && page <= totalPages) pages.add(page)
  }
  return [...pages].sort((a, b) => a - b)
}

export default function Pagination({ basePath, currentPage, totalPages, itemLabel }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = visiblePages(currentPage, totalPages)
  const linkClass = 'inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-3 text-sm font-semibold text-ink shadow-sm transition hover:border-brand-700/30 hover:bg-[var(--surface-card-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40'

  return (
    <nav
      aria-label={`${itemLabel} pagination`}
      className="flex flex-col gap-3 rounded-[0.9rem] border border-brand-900/10 bg-[var(--surface-card)] p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4"
    >
      <p className="text-sm font-semibold tabular-nums text-muted">
        Page <span className="text-ink">{currentPage}</span> of {totalPages}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        {currentPage > 1 ? (
          <Link rel="prev" href={pageHref(basePath, currentPage - 1)} className={linkClass} aria-label="Go to previous page">
            <span aria-hidden="true">←</span><span className="ml-1.5 hidden sm:inline">Previous</span>
          </Link>
        ) : null}

        {pages.map((page, index) => (
          <span key={page} className="contents">
            {index > 0 && page - pages[index - 1] > 1 ? <span className="px-1 text-muted" aria-hidden="true">…</span> : null}
            {page === currentPage ? (
              <span aria-current="page" className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full bg-brand-800 px-3 text-sm font-bold text-white shadow-sm">
                <span className="sr-only">Page </span>{page}
              </span>
            ) : (
              <Link href={pageHref(basePath, page)} className={linkClass} aria-label={`Go to page ${page}`}>
                {page}
              </Link>
            )}
          </span>
        ))}

        {currentPage < totalPages ? (
          <Link rel="next" href={pageHref(basePath, currentPage + 1)} className={linkClass} aria-label="Go to next page">
            <span className="mr-1.5 hidden sm:inline">Next</span><span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
    </nav>
  )
}
