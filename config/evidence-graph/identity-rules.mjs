export const ENTITY_PREFIXES = Object.freeze({
  herb: 'herb',
  compound: 'compound',
  substanceForm: 'form',
});

export const IDENTITY_STATUSES = Object.freeze([
  'active',
  'needs-review',
  'duplicate-candidate',
  'deprecated',
  'archived',
]);

const NON_ALPHANUMERIC = /[^a-z0-9]+/g;
const EDGE_DASHES = /^-+|-+$/g;

export function normalizeIdentityText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(NON_ALPHANUMERIC, '-')
    .replace(EDGE_DASHES, '');
}

export function buildStableEntityId(entityType, canonicalSlug) {
  const prefix = ENTITY_PREFIXES[entityType];
  if (!prefix) {
    throw new Error(`Unsupported evidence-graph entity type: ${entityType}`);
  }

  const normalizedSlug = normalizeIdentityText(canonicalSlug);
  if (!normalizedSlug) {
    throw new Error(`Cannot build ${entityType} identity without a canonical slug`);
  }

  return `${prefix}:${normalizedSlug}`;
}

export function normalizeAliases(values) {
  const source = Array.isArray(values) ? values : [values];
  const seen = new Set();

  return source
    .flatMap((value) => String(value ?? '').split(/[|;\n]/g))
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => {
      const key = normalizeIdentityText(value);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export const IDENTITY_MATCH_PRIORITY = Object.freeze([
  'stable-id',
  'canonical-slug',
  'canonical-name',
  'scientific-name',
  'approved-alias',
  'normalized-name',
  'manual-review',
]);

export const FORM_SENSITIVE_PATTERNS = Object.freeze([
  /\b(glycinate|citrate|oxide|malate|threonate|chloride|sulfate|carbonate)\b/i,
  /\b(root|leaf|bark|seed|fruit|flower|aerial parts?)\b/i,
  /\b(extract|standardized|standardised|isolate|ferment|strain)\b/i,
  /\b(l-|d-|dl-|r-|s-)\w+/i,
]);

export function requiresFormReview(value) {
  const text = String(value ?? '');
  return FORM_SENSITIVE_PATTERNS.some((pattern) => pattern.test(text));
}
