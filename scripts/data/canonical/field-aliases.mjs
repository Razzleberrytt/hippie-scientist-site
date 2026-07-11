// Field-alias loader.
//
// Loads config/field-aliases.json and builds a reverse lookup so incoming patch
// field names (in any casing/spacing) can be resolved to a canonical field.

import { readJson } from './jsonl.mjs'
import { fieldAliasConfigPath } from './paths.mjs'

function normalizeKey(key) {
  return String(key || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^_+|_+$/g, '')
}

let cache = null

export function loadFieldAliases() {
  if (cache) return cache
  const config = readJson(fieldAliasConfigPath, {})
  const reverse = new Map()
  const groups = {}
  for (const [groupName, group] of Object.entries(config)) {
    if (groupName.startsWith('_') || typeof group !== 'object') continue
    groups[groupName] = group
    for (const [canonical, variants] of Object.entries(group)) {
      reverse.set(normalizeKey(canonical), canonical)
      for (const variant of variants) {
        reverse.set(normalizeKey(variant), canonical)
      }
    }
  }
  cache = { config, groups, reverse }
  return cache
}

// Resolve an incoming field name to its canonical form, or return the
// normalized original when unknown (so unmapped fields are preserved, not lost).
export function resolveFieldName(incoming) {
  const { reverse } = loadFieldAliases()
  const key = normalizeKey(incoming)
  return reverse.get(key) || null
}

export { normalizeKey }
