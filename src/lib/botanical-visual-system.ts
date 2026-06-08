export type BotanicalVisual = {
  slug: string
  gradient: string
  accent: string
  glyph: string
  atmosphere: string
}

const fallbackVisual: BotanicalVisual = {
  slug: 'default',
  gradient: 'linear-gradient(135deg, rgba(244,248,242,1) 0%, rgba(222,234,225,1) 100%)',
  accent: '#2f7d4b',
  glyph: '✿',
  atmosphere: 'botanical',
}

const botanicalVisuals: Record<string, BotanicalVisual> = {
  ashwagandha: {
    slug: 'ashwagandha',
    gradient: 'linear-gradient(135deg, #efe8d7 0%, #d9c8a5 100%)',
    accent: '#8b5a2b',
    glyph: '❋',
    atmosphere: 'adaptogenic earth tones',
  },
  rhodiola: {
    slug: 'rhodiola',
    gradient: 'linear-gradient(135deg, #f4dfc8 0%, #e3a96f 100%)',
    accent: '#b56428',
    glyph: '✺',
    atmosphere: 'northern alpine energy',
  },
  lion_mane: {
    slug: 'lion_mane',
    gradient: 'linear-gradient(135deg, #f7f2e8 0%, #e7dcc8 100%)',
    accent: '#8f7653',
    glyph: '◉',
    atmosphere: 'neural ecosystem',
  },
  magnesium: {
    slug: 'magnesium',
    gradient: 'linear-gradient(135deg, #edf2f7 0%, #cdd9e5 100%)',
    accent: '#58708b',
    glyph: '⬡',
    atmosphere: 'mineral calm systems',
  },
  l_theanine: {
    slug: 'l_theanine',
    gradient: 'linear-gradient(135deg, #edf7ee 0%, #bfd9c2 100%)',
    accent: '#3f7c58',
    glyph: '◌',
    atmosphere: 'calming tea pathways',
  },
  reishi: {
    slug: 'reishi',
    gradient: 'linear-gradient(135deg, #3d1721 0%, #8d3f4f 100%)',
    accent: '#f0d8dd',
    glyph: '✹',
    atmosphere: 'forest immune ecology',
  },
}

export function getBotanicalVisual(slug?: string | null) {
  if (!slug) return fallbackVisual

  const normalized = slug.toLowerCase().replace(/-/g, '_')

  return botanicalVisuals[normalized] || fallbackVisual
}
