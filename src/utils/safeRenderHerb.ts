import { sanitizeHerb } from './sanitizeHerb'
import type { Herb } from '../types'

/**
 * Ensure an herb object is safe to render.
 * Falls back to default values for any missing fields.
 */
export function safeRenderHerb(herb: any): Herb {
  try {
    return sanitizeHerb(herb)
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('Failed to sanitize herb', herb?.name, err)
    }
    return sanitizeHerb({})
  }
}
