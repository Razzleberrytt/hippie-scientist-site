export const isNonEmpty = (v: any) =>
  Array.isArray(v) ? v.filter(Boolean).length > 0 : !!String(v ?? '').trim()

export const toArray = (v: any): string[] => {
  if (Array.isArray(v)) return v.filter(Boolean).map(String)
  const s = String(v ?? '').trim()
  if (!s) return []
  return s.split(/[,;|]/).map(x => x.trim()).filter(Boolean)
}

export function getText(obj: any, primary: string, aliases: string[] = []) {
  const all = [primary, ...aliases]
  const map: Record<string, string> = {}
  for (const k of Object.keys(obj || {})) map[k.toLowerCase()] = k
  for (const a of all) {
    const hit = map[a.toLowerCase()]
    if (hit) {
      const val = String(obj[hit] ?? '').trim()
      if (val) return val
    }
  }
  return ''
}

export function getList(obj: any, primary: string, aliases: string[] = []) {
  const all = [primary, ...aliases]
  const map: Record<string, string> = {}
  for (const k of Object.keys(obj || {})) map[k.toLowerCase()] = k
  for (const a of all) {
    const hit = map[a.toLowerCase()]
    if (hit) {
      const v = obj[hit]
      const arr = toArray(v)
      if (arr.length) return arr
    }
  }
  return []
}

export const urlish = (s: string) => /^https?:\/\//i.test(s)
