export const href = (path: string): string =>
  path.startsWith('/') ? path : '/' + path
