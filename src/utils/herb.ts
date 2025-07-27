export function herbName(herb: any): string {
  if (herb.scientificname) return herb.scientificname as string;
  if (herb.nameNorm) return (herb.nameNorm as string)
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return herb.id || '';
}

export function splitField(value: any): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value.split(/;|,/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}
