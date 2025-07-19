import { decodeTag } from './format'
import { tagCategoryMap } from '../data/tagCategoryMap'

// build alias lookups from tagCategoryMap
export const tagAliasMap: Record<string, string> = {}
export const reverseAliasMap: Record<string, string> = {}
Object.entries(tagCategoryMap).forEach(([tag, info]) => {
  if (info.alias) {
    tagAliasMap[info.alias.toLowerCase()] = tag
    reverseAliasMap[tag.toLowerCase()] = info.alias
  }
})

export function canonicalTag(tag: string): string {
  const decoded = decodeTag(tag).toLowerCase().trim()
  return tagAliasMap[decoded] || decoded
}

export function tagsMatch(a: string, b: string): boolean {
  return canonicalTag(a) === canonicalTag(b)
}

export function aliasFor(tag: string): string | undefined {
  return reverseAliasMap[tag.toLowerCase()]
}
