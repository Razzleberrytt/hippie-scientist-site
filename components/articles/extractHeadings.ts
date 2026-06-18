export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function textToId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
