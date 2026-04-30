export function normalizeProfileText(value: any) {
  if (!value) return ''
  return String(value)
}

export function KeyValueSection({ title, items }: any) {
  return <div>{title}</div>
}
