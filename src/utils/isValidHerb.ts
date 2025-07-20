import type { Herb } from '../types'

export function isValidHerb(h: any): h is Herb {
  return (
    h &&
    typeof h.name === 'string' &&
    Array.isArray(h.effects) &&
    typeof h.category === 'string' &&
    typeof h.description === 'string' &&
    Array.isArray(h.tags)
  )
}
