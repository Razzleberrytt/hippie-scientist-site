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
  const linkClass = 'chip-readable inline-flex min-h-11 min-w-11 items-center justify-center px-3 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40'

  return (
    <nav
      aria-label={`${itemLabel} pagination`}
      className="section-frame flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
    >
      <p className="text-center text-sm font-semibold tabular-nums text-muted sm:text-left">
        Page <span className="text-ink">{currentPage}</span> of {totalPages}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-end">
        {currentPage > 1 ? (
          <Link rel="prev" href={pageHref(basePath, currentPage - 1)} className={linkClass} aria-label="Go to previous page">
            <span aria-hidden="true">←</span><span className="ml-1.5 hidden sm:inline">Previous</span>
          </Link>
        ) : null}

        {pages.map((page, index) => (
          <span key={page} className="contents">
            {index > 0 && page - pages[index - 1] > 1 ? <span className="px-1 text-muted" aria-hidden="true">…</span> : null}
            {page === currentPage ? (
              <span
                aria-current="page"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-brand-800/20 bg-brand-800 px-3 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]"
              >
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
