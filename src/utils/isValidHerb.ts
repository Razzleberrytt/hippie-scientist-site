import type { Herb } from '../types'

export function isValidHerb(h: any): h is Herb {
  return (
    h &&
    typeof h.name === 'string' &&
    h.name.trim() !== '' &&
    Array.isArray(h.effects) &&
    h.effects.length > 0
  )
}
