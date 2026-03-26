export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as T
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // noop: quota or privacy mode
  }
}

export function removeStorage(key: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // noop
  }
}

export function pushRecentUnique<T extends { id: string }>(
  key: string,
  entry: T,
  limit: number
): T[] {
  const current = readStorage<T[]>(key, [])
  const next = [entry, ...current.filter(item => item.id !== entry.id)].slice(0, limit)
  writeStorage(key, next)
  return next
}
