// Simple tag decoder: capitalizes and formats tags for display

export function decodeTag(tag: string): string {
  if (!tag || typeof tag !== 'string') return '';
  return tag
    .replace(/-/g, ' ')                // Replace dashes with spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize each word
}
