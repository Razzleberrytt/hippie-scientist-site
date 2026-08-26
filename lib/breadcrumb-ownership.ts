export function hasLocalBreadcrumbOwner(pathname: string): boolean {
  const normalizedPathname = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
  const segments = normalizedPathname.split('/').filter(Boolean)

  return segments.length === 2 && segments[0] === 'compounds'
}
