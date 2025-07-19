export const tagGroups = {
  Effects: [
    'Calming',
    'Dream',
    'Visionary',
    'Euphoria',
    'Stimulant',
  ],
  Safety: ['Safe', 'Caution', 'Toxic', 'Restricted'],
  Preparation: ['Brewable', 'Oral', 'Smokable', 'Tea', 'Incense', 'Tincture'],
  Region: ['Amazon', 'Africa', 'Asia', 'Europe', 'Pacific'],
  'Compound Type': ['Alkaloid', 'Terpene', 'Tryptamine', 'Phenethylamine', 'MAOI'],
} as const

export type TagGroup = keyof typeof tagGroups
