export function decodeTag(tag: string): string {
  try {
    return JSON.parse(`"${tag}"`);
  } catch {
    return tag;
  }
}

export function safetyColorClass(rating?: number): string {
  if (rating == null) return '';
  if (rating <= 1) return 'text-green-400';
  if (rating === 2) return 'text-yellow-300';
  return 'text-red-400';
}

export function intensityColorClass(intensity: string): string {
  const value = intensity.toLowerCase();
  if (value.includes('mild')) return 'bg-green-600';
  if (value.includes('moderate')) return 'bg-yellow-600';
  if (value.includes('strong') || value.includes('high') || value.includes('potent'))
    return 'bg-red-600';
  return 'bg-gray-600';
}

export type TagVariant =
  | 'pink'
  | 'blue'
  | 'purple'
  | 'green'
  | 'yellow'
  | 'red';

export function tagVariant(tag: string): TagVariant {
  const decoded = decodeTag(tag);
  if (decoded.includes('Toxic') || decoded.includes('Restricted')) return 'red';
  if (decoded.includes('Safe')) return 'green';
  if (decoded.includes('Stimulant') || decoded.includes('Euphoria')) return 'pink';
  if (decoded.includes('Dissociation') || decoded.includes('Sedation')) return 'purple';
  if (decoded.includes('Dream')) return 'blue';
  if (decoded.includes('Cognitive')) return 'yellow';
  if (decoded.includes('Brewable') || decoded.includes('Smokable')) return 'blue';
  if (decoded.includes('Oral') || decoded.includes('Fermented')) return 'yellow';
  if (decoded.includes('Ritual')) return 'green';
  return 'purple';
}
