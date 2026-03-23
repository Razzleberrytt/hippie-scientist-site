import type { BlendState } from '@/types/blend'
import type { ConfidenceLevel } from '@/types/confidence'

type CompactBlendState = {
  g: string
  p: string
  s: string[]
  c?: ConfidenceLevel
}

function normalizeState(state: BlendState): CompactBlendState {
  const confidence =
    state.confidence === 'high' || state.confidence === 'medium' || state.confidence === 'low'
      ? state.confidence
      : undefined

  return {
    g: String(state.goal || '').trim(),
    p: String(state.primary || '').trim(),
    s: (Array.isArray(state.supporting) ? state.supporting : [])
      .map(item => String(item).trim())
      .filter(Boolean),
    ...(confidence ? { c: confidence } : {}),
  }
}

function toUrlSafeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function serializeBlend(state: BlendState): string {
  const compactState = normalizeState(state)
  return toUrlSafeBase64(JSON.stringify(compactState))
}
