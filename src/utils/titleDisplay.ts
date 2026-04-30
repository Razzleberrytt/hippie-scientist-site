export function formatBrowseTitle(value: string, maxLength = 60): string {
  const title = value.trim()
  if (title.length <= maxLength) return title
  return `${title.slice(0, Math.max(0, maxLength - 1)).trim()}…`
}
