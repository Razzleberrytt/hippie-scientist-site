export type BlogIndexPost = {
  slug: string;
  title: string;
  date?: string | null;
  description?: string | null;
  summary?: string | null;
  tags?: string[];
  readingTime?: string | null;
};

export type PaginationResult<T> = {
  items: T[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
};

export function ensureTrailingSlash(value: string): string {
  if (!value) return "/";
  return value.endsWith("/") ? value : `${value}/`;
}

export function resolveBlogIndexUrl(base?: string | null): string {
  const normalized = ensureTrailingSlash(base ?? (import.meta.env.BASE_URL || "/"));
  return `${normalized}blogdata/index.json`;
}

export function sortPostsByDateDesc<T extends { date?: string | null }>(posts: T[]): T[] {
  return [...posts].sort((a, b) => {
    const da = typeof a.date === "string" ? Date.parse(a.date) : NaN;
    const db = typeof b.date === "string" ? Date.parse(b.date) : NaN;
    const ta = Number.isNaN(da) ? 0 : da;
    const tb = Number.isNaN(db) ? 0 : db;
    return tb - ta;
  });
}

export function paginateCollection<T>(items: T[], page: number, perPage: number): PaginationResult<T> {
  const safePerPage = perPage > 0 ? Math.floor(perPage) : 1;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safePerPage));
  const requested = Number.isFinite(page) ? Math.floor(page) : 1;
  const clampedPage = Math.min(Math.max(1, requested), totalPages);
  const start = (clampedPage - 1) * safePerPage;
  const end = start + safePerPage;
  return {
    items: items.slice(start, end),
    total,
    totalPages,
    page: clampedPage,
    perPage: safePerPage,
  };
}
