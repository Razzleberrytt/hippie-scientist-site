export type SemanticSessionItem = {
  slug: string
  title: string
  href: string
  type: 'profile' | 'compare' | 'stack' | 'ecosystem' | 'pathway' | 'best-for'
  signals?: string[]
  viewedAt: number
}

const STORAGE_KEY = 'hippie-scientist:semantic-session-memory:v1'
const MAX_ITEMS = 16

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function safeParse(raw: string | null): SemanticSessionItem[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isValidItem) : []
  } catch {
    return []
  }
}

function isValidItem(item: any): item is SemanticSessionItem {
  return Boolean(
    item &&
    typeof item.slug === 'string' &&
    typeof item.title === 'string' &&
    typeof item.href === 'string' &&
    typeof item.type === 'string' &&
    typeof item.viewedAt === 'number',
  )
}

export function getSemanticSessionMemory(): SemanticSessionItem[] {
  if (!isBrowser()) return []

  return safeParse(window.localStorage.getItem(STORAGE_KEY))
    .sort((a, b) => b.viewedAt - a.viewedAt)
    .slice(0, MAX_ITEMS)
}

export function rememberSemanticSessionItem(item: Omit<SemanticSessionItem, 'viewedAt'>) {
  if (!isBrowser()) return

  const current = getSemanticSessionMemory()
  const next: SemanticSessionItem = {
    ...item,
    signals: item.signals?.filter(Boolean).slice(0, 5),
    viewedAt: Date.now(),
  }

  const deduped = [next, ...current.filter((entry) => entry.href !== item.href)]
    .slice(0, MAX_ITEMS)

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped))
}

export function clearSemanticSessionMemory() {
  if (!isBrowser()) return
  window.localStorage.removeItem(STORAGE_KEY)
}

export function getSemanticSessionSummary(items: SemanticSessionItem[] = getSemanticSessionMemory()) {
  const latest = items[0]
  const ecosystems = items.filter((item) => item.type === 'ecosystem' || item.type === 'pathway')
  const compares = items.filter((item) => item.type === 'compare')
  const profiles = items.filter((item) => item.type === 'profile')

  return {
    latest,
    ecosystems,
    compares,
    profiles,
    hasMemory: items.length > 0,
  }
}
