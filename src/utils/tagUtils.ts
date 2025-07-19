import { decodeTag } from './format'

export const tagAliasMap: Record<string, string> = {
  'root bark': 'root',
  bark: 'root',
  tryptamine: 'psychedelic',
  phenethylamine: 'psychedelic',
}

export function canonicalTag(tag: string): string {
  const decoded = decodeTag(tag).toLowerCase().trim()
  return tagAliasMap[decoded] || decoded
}

export function tagsMatch(a: string, b: string): boolean {
  return canonicalTag(a) === canonicalTag(b)
}
