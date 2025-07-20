export function isValidHerb(herb: any): boolean {
  if (!herb || typeof herb !== 'object') return false
  if (!herb.name || typeof herb.name !== 'string') return false
  if (!Array.isArray(herb.effects)) herb.effects = []
  if (!Array.isArray(herb.tags)) herb.tags = []
  if (!herb.category) herb.category = 'Other'
  return true
}
