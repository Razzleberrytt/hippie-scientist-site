export function safeHerbField<T>(field: any, fallback: T): T {
  // If value is missing or explicitly marked as N/A, use the fallback
  if (field === undefined || field === null) return fallback as T

  // Handle array fields by ensuring we always return an array
  if (Array.isArray(fallback)) {
    return (Array.isArray(field) ? field : []) as unknown as T
  }

  if (typeof field === 'string') {
    const trimmed = field.trim()
    if (trimmed === '' || trimmed === 'N/A') return fallback as T
    return field as T
  }

  return field as T
}
