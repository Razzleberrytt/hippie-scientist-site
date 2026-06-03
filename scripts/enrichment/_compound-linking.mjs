import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { REPO_ROOT, nowIso, runSqlite, writeJson } from './_shared.mjs';

function normalizeText(value) {
  return String(value ?? '').trim();
}

function normalizeKey(value) {
  return normalizeText(value).toLowerCase();
}

function toSlug(value) {
  return normalizeKey(value)
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/(^-|-$)/gu, '');
}

function asStringList(value) {
  return Array.isArray(value)
    ? value.map((entry) => normalizeText(entry)).filter(Boolean)
    : [];
}

function uniqueStrings(values) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    const text = normalizeText(value);
    const key = normalizeKey(text);
    if (!text || !key || seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out;
}

function buildCanonicalCompounds(entityGraph, compounds) {
  const baseById = new Map();
  for (const compound of compounds) {
    const id = normalizeText(compound.id ?? compound.slug);
    if (!id) continue;
    const slug = normalizeText(compound.slug || toSlug(compound.name || id));
    const name = normalizeText(compound.name || compound.displayName || id);
    baseById.set(id, {
      id,
      slug,
      name,
      synonyms: [],
      foundIn: uniqueStrings([...(compound.foundIn ?? []), ...(compound.herbs ?? [])]),
    });
  }

  for (const record of entityGraph.canonicalCompounds ?? []) {
    const id = normalizeText(record.id ?? record.slug);
    if (!id) continue;
    const existing = baseById.get(id) ?? { id, slug: '', name: id, synonyms: [], foundIn: [] };
    const next = {
      id,
      slug: normalizeText(record.slug || existing.slug || toSlug(record.name || existing.name || id)),
      name: normalizeText(record.name || existing.name || id),
      synonyms: uniqueStrings([...(existing.synonyms ?? []), ...asStringList(record.synonyms)]),
      foundIn: uniqueStrings([...(existing.foundIn ?? []), ...asStringList(record.foundIn)]),
    };
    baseById.set(id, next);
  }

  return [...baseById.values()].sort((a, b) => a.id.localeCompare(b.id));
}

function buildMatcher(canonicalCompounds) {
  const bySlug = new Map();
  const byName = new Map();
  const bySynonym = new Map();
  const byId = new Map();

  for (const compound of canonicalCompounds) {
    byId.set(compound.id, compound);
    bySlug.set(normalizeKey(compound.slug), compound.id);
    byName.set(normalizeKey(compound.name), compound.id);
    for (const synonym of compound.synonyms ?? []) {
      const key = normalizeKey(synonym);
      if (!key || bySynonym.has(key)) continue;
      bySynonym.set(key, compound.id);
    }
  }

  function match(raw) {
    const text = normalizeText(raw);
    if (!text) return { matched: null, reason: 'empty' };

    const slugKey = normalizeKey(toSlug(text));
    if (bySlug.has(slugKey)) {
      const id = bySlug.get(slugKey);
      return { matched: byId.get(id), reason: 'slug' };
    }

    const nameKey = normalizeKey(text);
    if (byName.has(nameKey)) {
      const id = byName.get(nameKey);
      return { matched: byId.get(id), reason: 'name' };
    }

    if (bySynonym.has(nameKey)) {
      const id = bySynonym.get(nameKey);
      return { matched: byId.get(id), reason: 'synonym' };
    }

    return { matched: null, reason: 'unmatched' };
  }

  return { match, byId };
}

function arraysEqualCaseInsensitive(a, b) {
  const left = uniqueStrings(a);
  const right = uniqueStrings(b);
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i += 1) {
    if (normalizeKey(left[i]) !== normalizeKey(right[i])) return false;
  }
  return true;
}

function addReviewBacklogRow(entityType, entityId, task, priority = 25) {
  runSqlite({
    sql: 'INSERT OR IGNORE INTO claim_backlog(entity_type, entity_id, task, priority, status) VALUES(?, ?, ?, ?, ?)',
    args: [entityType, entityId, task, priority, 'pending'],
  });
}

export function auditCompoundLinks({ herbs, compounds, entityGraph, producer = 'compound-link-audit' }) {
  const canonicalCompounds = buildCanonicalCompounds(entityGraph, compounds);
  const { match, byId } = buildMatcher(canonicalCompounds);

  const herbById = new Map();
  const herbByName = new Map();
  for (const herb of herbs) {
    const herbId = normalizeText(herb.id ?? herb.slug);
    if (!herbId) continue;
    herbById.set(herbId, herb);
    herbByName.set(normalizeKey(herb.name ?? herb.displayName ?? herbId), herbId);
  }

  const compoundRowsById = new Map();
  for (const compound of compounds) {
    const id = normalizeText(compound.id ?? compound.slug);
    if (id) compoundRowsById.set(id, compound);
  }

  const unmatched = [];
  const herbFixes = new Map();
  const compoundFixes = new Map();

  function queueHerbCompound(herbId, canonicalName) {
    const herb = herbById.get(herbId);
    if (!herb) return;
    const current = herbFixes.get(herbId) ?? uniqueStrings(herb.activeCompounds ?? []);
    const next = uniqueStrings([...current, canonicalName]);
    herbFixes.set(herbId, next);
  }

  function queueCompoundHerb(compoundId, herbName) {
    const compound = compoundRowsById.get(compoundId);
    if (!compound) return;
    const current = compoundFixes.get(compoundId) ?? uniqueStrings([...(compound.foundIn ?? []), ...(compound.herbs ?? [])]);
    const next = uniqueStrings([...current, herbName]);
    compoundFixes.set(compoundId, next);
  }

  for (const herb of herbs) {
    const herbId = normalizeText(herb.id ?? herb.slug);
    if (!herbId) continue;
    const herbName = normalizeText(herb.name ?? herb.displayName ?? herbId);

    const normalizedActive = [];
    for (const rawCompound of asStringList(herb.activeCompounds)) {
      const result = match(rawCompound);
      if (!result.matched) {
        unmatched.push({ herbId, herbName, input: rawCompound, reason: result.reason });
        addReviewBacklogRow('herb', herbId, 'compound-link-review');
        continue;
      }

      const canonical = result.matched;
      normalizedActive.push(canonical.name);
      queueCompoundHerb(canonical.id, herbName);
    }

    const deduped = uniqueStrings(normalizedActive);
    if (!arraysEqualCaseInsensitive(deduped, herb.activeCompounds ?? [])) {
      herbFixes.set(herbId, deduped);
    }
  }

  for (const compound of canonicalCompounds) {
    const compoundRow = compoundRowsById.get(compound.id);
    if (!compoundRow) continue;
    const herbRefs = uniqueStrings([...(compoundRow.foundIn ?? []), ...(compoundRow.herbs ?? []), ...(compound.foundIn ?? [])]);
    for (const herbRef of herbRefs) {
      const herbId = herbByName.get(normalizeKey(herbRef));
      if (!herbId) {
        addReviewBacklogRow('compound', compound.id, 'compound-link-review');
        unmatched.push({ herbId: null, herbName: herbRef, input: compound.name, reason: 'compound-foundIn-herb-missing' });
        continue;
      }
      queueHerbCompound(herbId, compound.name);
    }
  }

  const operations = [];
  for (const [herbId, nextActiveCompounds] of herbFixes.entries()) {
    const herb = herbById.get(herbId);
    const current = herb?.activeCompounds ?? [];
    if (arraysEqualCaseInsensitive(current, nextActiveCompounds)) continue;
    operations.push({
      task: 'link_integrity',
      entity_type: 'herb',
      entity_id: herbId,
      field: '/activeCompounds',
      op: 'set',
      value: nextActiveCompounds,
    });
  }

  for (const [compoundId, nextFoundIn] of compoundFixes.entries()) {
    const compound = compoundRowsById.get(compoundId);
    const current = [...(compound?.foundIn ?? []), ...(compound?.herbs ?? [])];
    if (arraysEqualCaseInsensitive(current, nextFoundIn)) continue;
    operations.push({
      task: 'link_integrity',
      entity_type: 'compound',
      entity_id: compoundId,
      field: '/herbs',
      op: 'set',
      value: nextFoundIn,
    });
  }

  const patch = operations.length
    ? {
        patch_id: `patch-link-${createHash('sha256').update(JSON.stringify(operations)).digest('hex').slice(0, 16)}`,
        created_at: nowIso(),
        producer,
        operations,
      }
    : null;

  return {
    canonicalCompounds,
    unmatched,
    mismatchCount: operations.length,
    patch,
  };
}

export function writeLinkPatch(patch) {
  if (!patch) return null;
  const patchFile = `patches/${patch.patch_id}.json`;
  writeJson(join(REPO_ROOT, patchFile), patch);
  runSqlite({
    sql: 'INSERT OR REPLACE INTO patches(patch_id, patch_file, patch_sha256, status) VALUES(?, ?, ?, ?)',
    args: [patch.patch_id, `${patch.patch_id}.json`, createHash('sha256').update(JSON.stringify(patch)).digest('hex'), 'staged'],
  });
  return patchFile;
}
