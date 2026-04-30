import { splitClean } from '@/lib/sanitize'

export function asStringArray(value: unknown): string[] {
  return splitClean(value)
}
