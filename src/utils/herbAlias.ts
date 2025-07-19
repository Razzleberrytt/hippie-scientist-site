export function extractAliases(name: string): string[] {
  const match = name.match(/\(([^)]+)\)/)
  if (!match) return []
  return match[1]
    .split(/[,/]| or /)
    .map(a => a.trim())
    .filter(Boolean)
}
