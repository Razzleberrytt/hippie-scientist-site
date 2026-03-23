import type { BlendState } from '@/types/blend'

type CompactBlendState = {
  g: string
  p: string
  s: string[]
  c?: string
}

function normalizeState(state: BlendState): CompactBlendState {
  return {
    g: String(state.goal || '').trim(),
    p: String(state.primary || '').trim(),
    s: (Array.isArray(state.supporting) ? state.supporting : [])
      .map(item => String(item).trim())
      .filter(Boolean),
    ...(state.confidence ? { c: String(state.confidence).trim() } : {}),
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
