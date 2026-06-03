export function hasNonEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (Array.isArray(value)) return value.some(item => hasNonEmptyValue(item))
  if (typeof value === 'string') return value.trim().length > 0
  return true
}

export function pickNonEmptyKeys<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): K[] {
  return keys.filter(key => hasNonEmptyValue(obj[key]))
}
