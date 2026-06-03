const GENERIC_PATTERNS = [
  /this profile is/gi,
  /research interest/gi,
  /mechanistic interest/gi,
  /currently/gi,
]

export function compressEditorialCopy(text: string) {
  if (!text) return ''

  let normalized = text
    .replace(/\s+/g, ' ')
    .replace(/\s+,/g, ',')
    .trim()

  GENERIC_PATTERNS.forEach(pattern => {
    normalized = normalized.replace(pattern, match => {
      return match.charAt(0).toUpperCase() + match.slice(1)
    })
  })

  normalized = normalized
    .replace(/mechanistic and emerging research contexts/gi, 'emerging mechanistic research')
    .replace(/signaling pathways and related biological response systems/gi, 'biological signaling pathways')
    .replace(/human-facing or clinically oriented research signals/gi, 'human clinical research signals')

  return normalized
}

export function dedupeNarrativeSections(sections: string[]) {
  const seen = new Set<string>()

  return sections.filter(section => {
    const normalized = section.toLowerCase().trim()

    if (!normalized || seen.has(normalized)) {
      return false
    }

    seen.add(normalized)
    return true
  })
}
