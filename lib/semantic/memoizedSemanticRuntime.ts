type CacheEntry<T> = {
  value: T
  createdAt: number
}

const DEFAULT_TTL = 1000 * 60 * 15

const runtimeCache = new Map<string, CacheEntry<any>>()

function isFresh(entry: CacheEntry<any>, ttl: number) {
  return Date.now() - entry.createdAt < ttl
}

export function getMemoizedSemanticValue<T>({
  key,
  compute,
  ttl = DEFAULT_TTL,
}: {
  key: string
  compute: () => T
  ttl?: number
}): T {
  const existing = runtimeCache.get(key)

  if (existing && isFresh(existing, ttl)) {
    return existing.value as T
  }

  const value = compute()

  runtimeCache.set(key, {
    value,
    createdAt: Date.now(),
  })

  return value
}

export function clearSemanticRuntimeCache() {
  runtimeCache.clear()
}
