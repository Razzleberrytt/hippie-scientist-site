import type { BlendState } from '@/types/blend'

type UnknownRecord = Record<string, unknown>

function fromUrlSafeBase64(input: string): string | null {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const base64 = padded + '='.repeat((4 - (padded.length % 4)) % 4)

  try {
    const binary = atob(base64)
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map(item => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .slice(0, 8)
}

function parseRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== 'object') return null
  return value as UnknownRecord
}

export function deserializeBlend(value: string | null | undefined): BlendState | null {
  if (!value || typeof value !== 'string') return null
  const decoded = fromUrlSafeBase64(value.trim())
  if (!decoded) return null

  try {
    const parsed = JSON.parse(decoded)
    const record = parseRecord(parsed)
    if (!record) return null

    const goal = typeof record.g === 'string' ? record.g.trim() : ''
    const primary = typeof record.p === 'string' ? record.p.trim() : ''
    const supporting = sanitizeStringArray(record.s)
    const confidence = typeof record.c === 'string' ? record.c.trim() : undefined

    if (!isString(goal) || !isString(primary) || supporting.length === 0) return null

    return {
      goal,
      primary,
      supporting,
      ...(confidence ? { confidence } : {}),
    }
  } catch {
    return null
  }
}
