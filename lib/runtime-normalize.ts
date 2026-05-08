export function hasText(value: unknown): boolean {
  return typeof value === 'string'
    ? value.trim().length > 0
    : value != null && String(value).trim().length > 0
}

export function asText(value: unknown, fallback = ''): string {
  if (value == null) return fallback

  if (typeof value === 'string') {
    return value.trim()
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value).trim()
  }

  return fallback
}

export function asLowerText(value: unknown, fallback = ''): string {
  return asText(value, fallback).toLowerCase()
}

export function asList<T = string>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value.filter((item) => item != null) as T[]
  }

  if (value == null) {
    return []
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()

    if (!trimmed) return []

    return [trimmed as T]
  }

  return [value as T]
}

export function asUniqueList<T = string>(value: unknown): T[] {
  const seen = new Set<string>()
  const result: T[] = []

  for (const item of asList<T>(value)) {
    const key =
      typeof item === 'string'
        ? item.trim().toLowerCase()
        : JSON.stringify(item)

    if (!key || seen.has(key)) continue

    seen.add(key)
    result.push(item)
  }

  return result
}
