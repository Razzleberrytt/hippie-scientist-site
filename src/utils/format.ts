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
