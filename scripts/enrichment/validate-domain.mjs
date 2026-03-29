#!/usr/bin/env node
/**
 * Usage:
 *   node scripts/enrichment/validate-domain.mjs [--run-id run-xxxx] [--dry-run]
 */
import { join } from 'node:path';
import { readdirSync, readFileSync } from 'node:fs';
import { REPO_ROOT, bootstrapStateDb, runSqlite } from './_shared.mjs';

const TASK_VALIDATORS = {
  herb_mechanism: validateMechanism,
  compound_mechanism: validateMechanism,
  dosage: validateDosage,
  interactions: validateInteraction,
  sources_suggestion: validateSources,
  link_integrity: validateLinkIntegrity,
};

function parseArgs(argv) {
  const out = { runId: null, dryRun: false };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--run-id' && argv[i + 1]) {
      out.runId = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--run-id=')) out.runId = arg.slice('--run-id='.length);
    else if (arg === '--dry-run') out.dryRun = true;
  }
  return out;
}

function hasString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

const PHARMACOLOGY_RE =
  /\b(5-ht(?:1a|2a|2c|3|4|7)?|serotonin|dopamin(?:e|ergic)|gaba(?:ergic)?|nmda|ampar?|adrenergic|muscarinic|nicotinic|opioid|cb1|cb2|trpv1|voltage-gated|ion channel|calcium channel|sodium channel|potassium channel|monoamine oxidase|mao[- ]?[ab]?|acetylcholinesterase|cyp\d+[a-z0-9]*|kinase|phosphodiesterase|alkaloid|terpene|flavonoid|lignan|coumarin)\b/iu;
const FORBIDDEN_MECHANISM_RE = /\b(dose|dosage|mg\b|legal|schedule\s*[ivx]+|brand|price|\$)\b/iu;

function countSentences(text) {
  const normalized = String(text ?? '').trim();
  if (!normalized) return 0;
  return normalized
    .split(/(?<=[.!?])\s+/u)
    .map((segment) => segment.trim())
    .filter(Boolean).length;
}

function validateMechanismText(task, text) {
  if (!hasString(text)) return 'mechanism text is required.';
  const sentenceCount = countSentences(text);
  const [minSentences, maxSentences] = task === 'herb_mechanism' ? [2, 4] : [2, 5];
  if (sentenceCount < minSentences || sentenceCount > maxSentences) {
    return `mechanism must be ${minSentences}-${maxSentences} sentences for ${task}.`;
  }
  if (!PHARMACOLOGY_RE.test(text)) return 'mechanism must include at least one pharmacology-specific reference.';
  if (FORBIDDEN_MECHANISM_RE.test(text)) return 'mechanism includes forbidden content (dose/legal/brand/price).';
  const defaultCap = task === 'herb_mechanism' ? 700 : 850;
  const envCapName = task === 'herb_mechanism' ? 'MECHANISM_HERB_CHAR_CAP' : 'MECHANISM_COMPOUND_CHAR_CAP';
  const configuredCap = Number.parseInt(process.env[envCapName] ?? '', 10);
  const cap = Number.isFinite(configuredCap) && configuredCap > 0 ? configuredCap : defaultCap;
  if (String(text).length > cap) return `mechanism exceeds ${cap} character cap.`;
  return null;
}

function validateClaimValue(value) {
  if (!value || typeof value !== 'object') return 'claims append value must be an object.';
  if (!hasString(value.id) || !value.id.startsWith('clm_')) return 'claim id must start with clm_.';
  if (!hasString(value.claim)) return 'claim text is required.';
  if (!Array.isArray(value.source_ids) || value.source_ids.length === 0) return 'claim source_ids must be a non-empty array.';
  if (!value.source_ids.every((entry) => hasString(entry) && entry.startsWith('src_'))) return 'claim source_ids must use src_ IDs.';
  return null;
}

function validateProvenanceValue(value) {
  if (!value || typeof value !== 'object') return '_provenance set value must be an object.';
  if (!hasString(value.run_id) || !value.run_id.startsWith('run_')) return '_provenance.run_id must use run_ ID.';
  if (!Array.isArray(value.sources) || value.sources.length === 0) return '_provenance.sources must be a non-empty array.';
  for (const source of value.sources) {
    if (!source || typeof source !== 'object' || !hasString(source.id) || !source.id.startsWith('src_')) {
      return '_provenance.sources entries must include src_ id.';
    }
  }
  return null;
}

function validateReviewValue(value) {
  if (!value || typeof value !== 'object') return '_review set value must be an object.';
  if (!['pending', 'approved', 'rejected'].includes(value.status)) return '_review.status must be pending|approved|rejected.';
  return null;
}

function validateMechanism(operation) {
  const allowedFields = new Set(['/mechanism', '/claims/-', '/_provenance', '/_review']);
  if (!allowedFields.has(operation.field)) return 'mechanism patch field must be one of /mechanism|/claims/-|/_provenance|/_review.';
  if (operation.field === '/mechanism') {
    if (operation.op !== 'set') return '/mechanism requires op=set.';
    return validateMechanismText(operation.task, operation.value);
  }
  if (operation.field === '/claims/-') {
    if (operation.op !== 'append') return '/claims/- requires op=append.';
    return validateClaimValue(operation.value);
  }
  if (operation.field === '/_provenance') {
    if (operation.op !== 'set') return '/_provenance requires op=set.';
    return validateProvenanceValue(operation.value);
  }
  if (operation.field === '/_review') {
    if (operation.op !== 'set') return '/_review requires op=set.';
    return validateReviewValue(operation.value);
  }
  return null;
}

function validateDosage(operation) {
  const range = operation.value?.range;
  if (!range || typeof range !== 'object') return 'range object is required.';
  if (typeof range.low !== 'number' || typeof range.high !== 'number') return 'range.low and range.high numbers are required.';
  if (range.low > range.high) return 'range.low must be <= range.high.';
  return null;
}

function validateInteraction(operation, _index, patch) {
  const allowedFields = new Set(['/interactions', '/interactionTags', '/_review', '/_provenance']);
  if (!allowedFields.has(operation.field)) return 'interactions field must be /interactions|/interactionTags|/_review|/_provenance.';
  if (operation.op !== 'set') return 'interactions operations must use op=set.';
  if (operation.field === '/_review') return validateReviewValue(operation.value);
  if (operation.field === '/_provenance') return validateProvenanceValue(operation.value);
  if (operation.field === '/interactionTags') return validateInteractionTagArray(operation.value, 'interactionTags');

  if (!Array.isArray(operation.value)) return '/interactions value must be an array.';
  if (operation.value.length === 0 || operation.value.length > 8) return '/interactions must include 1-8 items.';
  for (let index = 0; index < operation.value.length; index += 1) {
    const item = operation.value[index];
    if (!item || typeof item !== 'object') return `/interactions[${index}] must be an object.`;
    if (!hasString(item.substance)) return `/interactions[${index}].substance is required.`;
    if (!['mild', 'moderate', 'severe', 'contraindicated'].includes(item.severity)) {
      return `/interactions[${index}].severity must be mild|moderate|severe|contraindicated.`;
    }
    if (!['theoretical', 'anecdotal', 'case_report', 'clinical'].includes(item.evidence)) {
      return `/interactions[${index}].evidence must be theoretical|anecdotal|case_report|clinical.`;
    }
    if (!hasString(item.mechanism)) return `/interactions[${index}].mechanism is required.`;
    const tagError = validateInteractionTagArray(item.tags, `/interactions[${index}].tags`);
    if (tagError) return tagError;
    if (item.severity === 'severe' || item.severity === 'contraindicated') {
      const hasVerifiedEvidence = hasVerifiedEntitySource(operation.entity_type, operation.entity_id);
      const hasPriorityBacklog = hasHighPriorityInteractionBacklog(operation.entity_type, operation.entity_id);
      if (!hasVerifiedEvidence && !hasPriorityBacklog) {
        return `/interactions[${index}] severe|contraindicated requires verified entity source or high-priority claim_backlog entry (patch provenance does not satisfy this gate).`;
      }
    }
  }
  return null;
}

const interactionTagVocab = JSON.parse(
  readFileSync(join(REPO_ROOT, 'schemas', 'interaction-tags.vocab.json'), 'utf8'),
).enum;

const entityCache = {
  herb: null,
  compound: null,
};

function loadEntityDataset(entityType) {
  if (entityCache[entityType]) return entityCache[entityType];
  const file = entityType === 'herb' ? 'herbs.json' : 'compounds.json';
  const payload = JSON.parse(readFileSync(join(REPO_ROOT, 'public', 'data', file), 'utf8'));
  entityCache[entityType] = Array.isArray(payload) ? payload : [];
  return entityCache[entityType];
}

function hasVerifiedEntitySource(entityType, entityId) {
  const dataset = loadEntityDataset(entityType);
  const target = dataset.find((entry) =>
    [entry?.id, entry?.slug, entry?.name, entry?.displayName].some(
      (value) => String(value ?? '').trim().toLowerCase() === String(entityId ?? '').trim().toLowerCase(),
    ),
  );
  if (!target || !Array.isArray(target.sources)) return false;
  return target.sources.some((source) => source && typeof source === 'object' && source.verified === true);
}

function hasHighPriorityInteractionBacklog(entityType, entityId) {
  const rows = runSqlite({
    select: true,
    sql: `SELECT id FROM claim_backlog
      WHERE entity_type = ? AND entity_id = ? AND task = 'interactions' AND status = 'pending' AND priority <= 20
      ORDER BY priority ASC, created_at ASC
      LIMIT 1`,
    args: [entityType, entityId],
  });
  return rows.length > 0;
}

function validateInteractionTagArray(value, label) {
  if (!Array.isArray(value) || value.length === 0) return `${label} must be a non-empty array.`;
  const tags = value.map((entry) => String(entry ?? '').trim());
  if (tags.some((tag) => !tag)) return `${label} entries must be non-empty strings.`;
  if (new Set(tags).size !== tags.length) return `${label} must not contain duplicates.`;
  for (const tag of tags) {
    if (!interactionTagVocab.includes(tag)) return `${label} contains unsupported tag "${tag}".`;
  }
  return null;
}

function validateSources(operation) {
  const sources = operation.value?.sources;
  if (!Array.isArray(sources) || sources.length === 0) return 'sources must be a non-empty array.';
  return null;
}

function validateLinkIntegrity(operation) {
  const allowedFields = new Set(['/activeCompounds', '/herbs', '/foundIn', '/_review']);
  if (!allowedFields.has(operation.field)) return 'link_integrity field must be /activeCompounds|/herbs|/foundIn|/_review.';
  if (operation.op !== 'set') return 'link_integrity operations must use op=set.';

  if (operation.field === '/_review') return validateReviewValue(operation.value);

  if (!Array.isArray(operation.value)) return `${operation.field} value must be an array.`;
  const values = operation.value.map((entry) => String(entry ?? '').trim()).filter(Boolean);
  if (values.length !== operation.value.length) return `${operation.field} entries must be non-empty strings.`;
  return null;
}

function validatePatchDomain(patch) {
  const errors = [];
  if (!Array.isArray(patch.operations)) return ['operations must be an array.'];

  patch.operations.forEach((operation, index) => {
    const validator = TASK_VALIDATORS[operation.task];
    if (!validator) {
      errors.push(`operations[${index}]: no validator for task ${operation.task}`);
      return;
    }
    const error = validator(operation, index, patch);
    if (error) errors.push(`operations[${index}]: ${error}`);
  });

  return errors;
}

function main() {
  const options = parseArgs(process.argv);
  bootstrapStateDb();
  const patchesDir = join(REPO_ROOT, 'patches');
  const patchFiles = readdirSync(patchesDir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => join(patchesDir, name));

  if (patchFiles.length === 0) {
    console.log('[validate-domain] No patch files found.');
    process.exit(0);
  }

  let failed = 0;
  for (const patchFile of patchFiles) {
    const patch = JSON.parse(readFileSync(patchFile, 'utf8'));
    const errors = validatePatchDomain(patch);
    runSqlite({
      sql: 'INSERT INTO validation_results(patch_id, validation_type, ok, details_json) VALUES(?, ?, ?, ?)',
      args: [
        patch.patch_id,
        options.dryRun ? 'domain-dry-run' : 'domain',
        errors.length === 0 ? 1 : 0,
        JSON.stringify({ runId: options.runId, file: patchFile, errors }),
      ],
    });
    if (errors.length > 0) {
      failed += 1;
      console.error(`[validate-domain] FAIL ${patchFile}`);
      errors.forEach((entry) => console.error(`  - ${entry}`));
    } else {
      console.log(`[validate-domain] PASS ${patchFile}`);
    }
  }

  if (failed > 0) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();

export { validateMechanismText, validatePatchDomain };
