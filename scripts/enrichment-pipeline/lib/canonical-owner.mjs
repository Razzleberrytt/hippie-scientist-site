import fs from 'node:fs'
import path from 'node:path'

const ENTITY_TYPES = new Set(['herb', 'compound'])

function readJson(file, fallback = {}) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}

function normalizeEntityType(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'herbs') return 'herb'
  if (normalized === 'compounds') return 'compound'
  if (ENTITY_TYPES.has(normalized)) return normalized
  return null
}

export function normalizeOwnerSlug(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replaceAll('_', '-')
    .replace(/-+/gu, '-')
    .replace(/^-|-$/gu, '')
}

function pluralFor(entityType) {
  return entityType === 'herb' ? 'herbs' : 'compounds'
}

function ownerKey(owner) {
  return `${owner.entityType}:${owner.slug}`
}

function ownerFromProfilePath(value) {
  const match = /^\/(herbs|compounds)\/([^/?#]+)\/?$/u.exec(String(value ?? '').trim())
  if (!match) return null
  return {
    entityType: match[1] === 'herbs' ? 'herb' : 'compound',
    slug: normalizeOwnerSlug(match[2]),
  }
}

export function workpackIdForOwner(entityType, slug) {
  const normalizedType = normalizeEntityType(entityType)
  const normalizedSlug = normalizeOwnerSlug(slug)
  if (!normalizedType || !normalizedSlug) throw new Error('invalid_canonical_owner: entity type and slug are required')
  return `wp_${normalizedType}_${normalizedSlug.replaceAll('-', '_')}`
}

export function parseWorkpackOwner(workpackId) {
  const match = /^wp_(herb|compound)_(.+)$/u.exec(String(workpackId ?? '').trim())
  if (!match) return null
  const slug = normalizeOwnerSlug(match[2])
  if (!slug) return null
  return { entityType: match[1], slug }
}

function parseProfileRedirects(text) {
  const targets = new Map()
  for (const line of String(text ?? '').split(/\r?\n/u)) {
    const trimmed = line.replace(/\s+#.*$/u, '').trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const parts = trimmed.split(/\s+/u)
    if (parts.length < 3 || parts[2] !== '301') continue
    const source = ownerFromProfilePath(parts[0])
    const target = ownerFromProfilePath(parts[1])
    if (!source || !target) continue
    const key = ownerKey(source)
    if (!targets.has(key)) targets.set(key, new Map())
    targets.get(key).set(ownerKey(target), target)
  }
  return targets
}

function collectDetailOwners(root) {
  const output = new Map()
  for (const [entityType, directory] of [
    ['herb', path.join(root, 'public', 'data', 'herbs-detail')],
    ['compound', path.join(root, 'public', 'data', 'compounds-detail')],
  ]) {
    if (!fs.existsSync(directory)) continue
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.json')) continue
      const record = readJson(path.join(directory, entry.name), null)
      const slug = normalizeOwnerSlug(record?.slug ?? record?.id ?? entry.name.slice(0, -5))
      if (!slug) continue
      const owner = { entityType, slug }
      output.set(ownerKey(owner), owner)
    }
  }
  return output
}

function normalizedAliasTarget(value) {
  if (typeof value !== 'string') return null
  const slug = normalizeOwnerSlug(value)
  return slug || null
}

function aliasMapFor(document, entityType) {
  const raw = document?.[pluralFor(entityType)]
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return new Map()
  return new Map(Object.entries(raw).flatMap(([alias, target]) => {
    const normalizedAlias = normalizeOwnerSlug(alias)
    const normalizedTarget = normalizedAliasTarget(target)
    return normalizedAlias && normalizedTarget ? [[normalizedAlias, normalizedTarget]] : []
  }))
}

function resolutionError(code, message, details = {}) {
  const error = new Error(`${code}: ${message}`)
  error.code = code
  error.details = details
  return error
}

export function createCanonicalOwnerResolver({ root = process.cwd() } = {}) {
  const redirectsPath = path.join(root, 'public', '_redirects')
  const aliasesPath = path.join(root, 'data', 'canonical', 'enrichment-owner-aliases.json')
  const redirects = parseProfileRedirects(fs.existsSync(redirectsPath) ? fs.readFileSync(redirectsPath, 'utf8') : '')
  const aliasDocument = readJson(aliasesPath, { herbs: {}, compounds: {} })
  const aliases = {
    herb: aliasMapFor(aliasDocument, 'herb'),
    compound: aliasMapFor(aliasDocument, 'compound'),
  }
  const known = collectDetailOwners(root)

  for (const targetMap of redirects.values()) {
    for (const target of targetMap.values()) known.set(ownerKey(target), target)
  }
  for (const entityType of ENTITY_TYPES) {
    for (const targetSlug of aliases[entityType].values()) {
      const target = { entityType, slug: targetSlug }
      known.set(ownerKey(target), target)
    }
  }

  function directTargets(owner) {
    const candidates = new Map()
    const aliasTarget = aliases[owner.entityType].get(owner.slug)
    if (aliasTarget) {
      const target = { entityType: owner.entityType, slug: aliasTarget }
      candidates.set(ownerKey(target), { target, via: 'data/canonical/enrichment-owner-aliases.json' })
    }
    const redirectTargets = redirects.get(ownerKey(owner))
    for (const target of redirectTargets?.values() ?? []) {
      candidates.set(ownerKey(target), { target, via: 'public/_redirects' })
    }
    return [...candidates.values()]
  }

  function resolveCanonicalOwner(input = {}) {
    const explicitType = normalizeEntityType(input.entityType)
    const explicitSlug = normalizeOwnerSlug(input.entitySlug ?? input.slug)
    const parsed = parseWorkpackOwner(input.workpackId)

    if (input.entityType != null && !explicitType) {
      throw resolutionError('invalid_entity_type', `unsupported entity type ${JSON.stringify(input.entityType)}`, { input })
    }
    if ((input.entitySlug != null || input.slug != null) && !explicitSlug) {
      throw resolutionError('invalid_entity_slug', 'entity slug is empty after normalization', { input })
    }
    if (input.workpackId != null && !parsed) {
      throw resolutionError('invalid_workpack_id', `cannot parse ${JSON.stringify(input.workpackId)}`, { input })
    }

    if (parsed && explicitType && parsed.entityType !== explicitType) {
      throw resolutionError('workpack_identity_mismatch', `${input.workpackId} disagrees with entityType ${explicitType}`, { parsed, explicitType, explicitSlug })
    }
    if (parsed && explicitSlug && parsed.slug !== explicitSlug) {
      throw resolutionError('workpack_identity_mismatch', `${input.workpackId} disagrees with entity slug ${explicitSlug}`, { parsed, explicitType, explicitSlug })
    }

    const submitted = {
      entityType: explicitType ?? parsed?.entityType,
      slug: explicitSlug ?? parsed?.slug,
    }
    if (!submitted.entityType || !submitted.slug) {
      throw resolutionError('missing_owner_identity', 'entity type/slug or a parseable workpackId is required', { input })
    }

    const submittedWorkpackId = workpackIdForOwner(submitted.entityType, submitted.slug)
    let current = { ...submitted }
    const via = []
    const visited = new Set()

    for (let depth = 0; depth < 20; depth += 1) {
      const key = ownerKey(current)
      if (visited.has(key)) {
        throw resolutionError('canonical_owner_cycle', `canonical owner resolution loops at ${key}`, { submitted, via })
      }
      visited.add(key)

      const candidates = directTargets(current)
      if (candidates.length > 1) {
        throw resolutionError('ambiguous_canonical_owner', `${key} resolves to multiple canonical targets`, {
          submitted,
          candidates: candidates.map(item => ({ ...item.target, via: item.via })),
        })
      }
      if (candidates.length === 0) break
      const next = candidates[0]
      if (ownerKey(next.target) === key) break
      via.push({ from: current, to: next.target, authority: next.via })
      current = next.target
    }

    if (!known.has(ownerKey(current))) {
      const sameSlug = [...known.values()].filter(owner => owner.slug === current.slug)
      if (sameSlug.length > 1) {
        throw resolutionError('ambiguous_canonical_owner', `${current.slug} exists under multiple canonical entity types`, {
          submitted,
          candidates: sameSlug,
        })
      }
      if (sameSlug.length === 1) {
        const target = sameSlug[0]
        via.push({ from: current, to: target, authority: 'unique-canonical-slug' })
        current = target
      } else {
        throw resolutionError('unknown_canonical_owner', `no canonical owner exists for ${ownerKey(current)}`, { submitted, via })
      }
    }

    const canonicalWorkpackId = workpackIdForOwner(current.entityType, current.slug)
    return {
      status: 'resolved',
      submitted: { ...submitted, workpackId: submittedWorkpackId },
      canonical: { ...current, workpackId: canonicalWorkpackId },
      changed: submittedWorkpackId !== canonicalWorkpackId,
      via,
    }
  }

  function resolveWorkpack(workpack = {}) {
    const ownerResolution = resolveCanonicalOwner(workpack)
    const canonical = ownerResolution.canonical
    return {
      ...workpack,
      workpackId: canonical.workpackId,
      entityType: canonical.entityType,
      ...(Object.hasOwn(workpack, 'entitySlug') ? { entitySlug: canonical.slug } : {}),
      ...(Object.hasOwn(workpack, 'slug') ? { slug: canonical.slug } : {}),
      ownerResolution,
    }
  }

  return { resolveCanonicalOwner, resolveWorkpack }
}
