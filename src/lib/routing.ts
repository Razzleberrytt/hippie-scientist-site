export const normalizeHref = (path: string): string => {
  if (!path) return '/'
  if (path.startsWith('http') || path.includes('://') || path.startsWith('mailto:')) return path
  if (path.startsWith('tel:')) return path
  if (path.startsWith('#')) return path

  const cleaned = path.replace(/^\/+/, '')
  const normalized = `/${cleaned}`

  return cleaned ? normalized : '/'
}
