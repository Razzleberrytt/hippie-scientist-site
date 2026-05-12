export type PathwayVisual = {
  glyph: string
  accent: string
  background: string
  label: string
}

export const pathwayVisuals: Record<string, PathwayVisual> = {
  sleep: {
    glyph: '☾',
    accent: '#51627d',
    background: 'linear-gradient(135deg,#eef2ff,#f8fbff)',
    label: 'Sleep Systems',
  },
  cognition: {
    glyph: '◌',
    accent: '#2b5fa8',
    background: 'linear-gradient(135deg,#edf4ff,#fbfdff)',
    label: 'Cognitive Systems',
  },
  inflammation: {
    glyph: '✦',
    accent: '#a45b31',
    background: 'linear-gradient(135deg,#fff1e7,#fffaf7)',
    label: 'Inflammation Pathways',
  },
  stress: {
    glyph: '❋',
    accent: '#427154',
    background: 'linear-gradient(135deg,#edf7ef,#fbfffc)',
    label: 'Stress Response',
  },
  mitochondria: {
    glyph: '⬡',
    accent: '#5f55a4',
    background: 'linear-gradient(135deg,#f1efff,#fbfaff)',
    label: 'Mitochondrial Function',
  },
  neuroplasticity: {
    glyph: '◎',
    accent: '#35758b',
    background: 'linear-gradient(135deg,#eaf5f8,#fbfeff)',
    label: 'Neuroplasticity',
  },
}

export function getPathwayVisual(pathway?: string) {
  const normalized = (pathway || '').toLowerCase()

  const match = Object.entries(pathwayVisuals).find(([key]) =>
    normalized.includes(key),
  )

  return (
    match?.[1] || {
      glyph: '◈',
      accent: '#55636f',
      background: 'linear-gradient(135deg,#f1f4f6,#fbfcfd)',
      label: 'Semantic Ecosystem',
    }
  )
}
