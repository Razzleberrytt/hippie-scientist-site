export type AtlasEffectSource = 'all' | 'explicit'
export type AtlasSortOption = 'name' | 'evidence' | 'noticeability'

export type AtlasUrlState = {
  query: string
  effect: string
  effectSource: AtlasEffectSource
  evidence: string
  intensity: string
  compoundClass: string
  safety: string
  sort: AtlasSortOption
}

export const DEFAULT_ATLAS_URL_STATE: AtlasUrlState = {
  query: '',
  effect: 'all',
  effectSource: 'all',
  evidence: 'all',
  intensity: 'all',
  compoundClass: 'all',
  safety: 'all',
  sort: 'name',
}

const validEffectSource = (value: string | null): AtlasEffectSource => value === 'explicit' ? 'explicit' : 'all'
const validSort = (value: string | null): AtlasSortOption =>
  value === 'evidence' || value === 'noticeability' ? value : 'name'

export function parseAtlasUrlState(search: string): AtlasUrlState {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  return {
    query: params.get('q')?.trim() ?? '',
    effect: params.get('effect')?.trim() || 'all',
    effectSource: validEffectSource(params.get('source')),
    evidence: params.get('evidence')?.trim() || 'all',
    intensity: params.get('noticeability')?.trim() || 'all',
    compoundClass: params.get('chemistry')?.trim() || 'all',
    safety: params.get('safety')?.trim() || 'all',
    sort: validSort(params.get('sort')),
  }
}

export function serializeAtlasUrlState(state: AtlasUrlState): string {
  const params = new URLSearchParams()
  if (state.query.trim()) params.set('q', state.query.trim())
  if (state.effectSource === 'explicit') params.set('source', 'explicit')
  if (state.effect !== 'all') params.set('effect', state.effect)
  if (state.compoundClass !== 'all') params.set('chemistry', state.compoundClass)
  if (state.evidence !== 'all') params.set('evidence', state.evidence)
  if (state.intensity !== 'all') params.set('noticeability', state.intensity)
  if (state.safety !== 'all') params.set('safety', state.safety)
  if (state.sort !== 'name') params.set('sort', state.sort)
  const value = params.toString()
  return value ? `?${value}` : ''
}
