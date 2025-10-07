export function hasVal(v: any) {
  if (Array.isArray(v)) return v.filter(Boolean).length > 0;
  return !!String(v ?? '').trim();
}
export function titleCase(s: string) {
  const t = String(s || '').trim();
  return t ? t[0].toUpperCase() + t.slice(1) : '';
}
export function joinList(a?: string[] | null, sep = ', ') {
  return (a || []).filter(Boolean).join(sep);
}
export function cleanLine(s?: string) {
  if (!s) return '';
  return s.replace(/\s{2,}/g, ' ').replace(/\s+[,.]$/, '.').trim();
}
