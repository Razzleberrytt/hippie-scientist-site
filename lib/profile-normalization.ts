import { text } from '@/lib/display-utils'

export function normalizeProfileSlug(value: unknown) {
  return text(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function normalizeDisplayName(value: unknown) {
  const normalized = text(value)
    .replace(/[-_]/g, ' ')
    .trim()

  if (!normalized) return ''

  return normalized.replace(/\b\w/g, (char) => char.toUpperCase())
}

export function normalizePrimaryActions(record: any) {
  const primaryActions = record?.primaryActions || record?.primary_actions

  if (Array.isArray(primaryActions) && primaryActions.length > 0) {
    return primaryActions
  }

  return record?.primary_effects || record?.effects || []
}
