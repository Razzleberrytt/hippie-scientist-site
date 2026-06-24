export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function canonicalSlug(...inputs: Array<string | null | undefined>) {
  for (const input of inputs) {
    if (typeof input === 'string' && input.trim()) {
      const slug = slugify(input.trim())
      if (slug) return slug
    }
  }
  return ''
}
