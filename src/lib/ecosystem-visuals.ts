export type EcosystemVisual = {
  title: string
  glyph: string
  accent: string
  gradient: string
}

export const ecosystemVisuals: Record<string, EcosystemVisual> = {
  adaptogens: {
    title: 'Adaptogenic Systems',
    glyph: '❋',
    accent: '#49724f',
    gradient: 'linear-gradient(135deg,#edf7ef,#fbfffc)',
  },
  cognition: {
    title: 'Cognitive Ecosystems',
    glyph: '◌',
    accent: '#2d63a8',
    gradient: 'linear-gradient(135deg,#edf4ff,#fbfdff)',
  },
  inflammation: {
    title: 'Inflammation Networks',
    glyph: '✦',
    accent: '#a55f34',
    gradient: 'linear-gradient(135deg,#fff2e8,#fffaf7)',
  },
  sleep: {
    title: 'Sleep & Recovery',
    glyph: '☾',
    accent: '#596585',
    gradient: 'linear-gradient(135deg,#eef2ff,#fbfcff)',
  },
  metabolism: {
    title: 'Metabolic Pathways',
    glyph: '⬡',
    accent: '#5e57a6',
    gradient: 'linear-gradient(135deg,#f1efff,#fbfaff)',
  },
}

export function getEcosystemVisual(value?: string) {
  const normalized = (value || '').toLowerCase()

  const match = Object.entries(ecosystemVisuals).find(([key]) =>
    normalized.includes(key),
  )

  return (
    match?.[1] || {
      title: 'Scientific Ecosystem',
      glyph: '◈',
      accent: '#566470',
      gradient: 'linear-gradient(135deg,#f2f4f6,#fbfcfd)',
    }
  )
}
