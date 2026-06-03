export const HERBS_PAGE_SIZE = 36

export function clampPositiveInt(value: string | number | null | undefined, fallback = 1): number {
  const raw = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(raw) || raw < 1) return fallback
  return Math.floor(raw)
}

export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize

  return {
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    pageItems: items.slice(start, end),
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
  }
}

export function buildPaginatedHref(basePath: string, page: number, params: URLSearchParams) {
  const nextParams = new URLSearchParams(params)
  if (page <= 1) nextParams.delete('page')
  else nextParams.set('page', String(page))
  const query = nextParams.toString()
  return query ? `${basePath}?${query}` : basePath
}
