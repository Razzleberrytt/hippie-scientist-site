const QUOTE_MAP: Record<string, string> = {
  '\u2018': "'",
  '\u2019': "'",
  '\u201B': "'",
  '\u2032': "'",
  '\u201C': '"',
  '\u201D': '"',
  '\u201E': '"',
  '\u2033': '"',
  '`': "'",
}

export function normalizeText(value: unknown): string {
  if (value == null) return ''

  return String(value)
    .split('')
    .map(char => QUOTE_MAP[char] ?? char)
    .join('')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}
