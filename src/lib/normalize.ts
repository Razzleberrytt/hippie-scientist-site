export const isNonEmpty = (v: any) =>
  Array.isArray(v) ? v.filter(Boolean).length > 0 : !!String(v ?? '').trim()

export const toArray = (v: any): string[] => {
  if (Array.isArray(v)) return v.filter(Boolean).map(String)
  const s = String(v ?? '').trim()
  if (!s) return []
  return s.split(/[,;|]/).map(x => x.trim()).filter(Boolean)
}

export const firstN = (arr: any, n: number) => toArray(arr).slice(0, n)

export const cleanText = (v: any) => String(v ?? '').trim()

export const urlish = (s: string) => /^https?:\/\//i.test(s)
