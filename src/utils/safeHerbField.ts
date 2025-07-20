export function safeHerbField<T>(field: any, fallback: T): T {
  if (field === undefined || field === null) return fallback as T;
  if (typeof field === 'string') {
    const trimmed = field.trim();
    if (trimmed === '' || trimmed === 'N/A') return fallback as T;
    return field as T;
  }
  return field as T;
}
