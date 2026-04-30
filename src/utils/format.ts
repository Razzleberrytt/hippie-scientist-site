const TAG_OVERRIDES: Record<string, string> = {
  adaptogen: 'Adaptogen',
  anxiolytic: 'Anxiolytic',
  nootropic: 'Nootropic',
  stimulant: 'Stimulant',
  sedative: 'Sedative',
  psychoactive: 'Psychoactive',
}

export function decodeTag(tag: string): string {
  const key = tag.trim().toLowerCase()
  if (!key) return ''
  if (TAG_OVERRIDES[key]) return TAG_OVERRIDES[key]
  return key
    .split(/[-_\s]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function tagVariant(tag: string): 'pink' | 'blue' | 'purple' | 'green' | 'yellow' | 'red' {
  const key = tag.trim().toLowerCase()
  if (key.includes('sedative') || key.includes('sleep')) return 'blue'
  if (key.includes('stimulant') || key.includes('energy')) return 'pink'
  if (key.includes('adaptogen')) return 'green'
  if (key.includes('focus') || key.includes('nootropic')) return 'yellow'
  if (key.includes('warning') || key.includes('toxic')) return 'red'
  return 'purple'
}
