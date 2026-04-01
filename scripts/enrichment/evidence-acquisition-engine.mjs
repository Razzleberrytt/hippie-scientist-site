#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { REPO_ROOT, deterministicRunId, ensureDir, generatePrefixedUlid, loadJson, nowIso, writeJson } from './_shared.mjs';

const TARGET_FIELDS = [
  { requestField: 'active compounds', schemaField: 'activeCompounds', patchField: '/activeCompounds', mode: 'array' },
  { requestField: 'pharmacological effects', schemaField: 'effects', patchField: '/effects', mode: 'array' },
  { requestField: 'mechanisms', schemaField: 'mechanism', patchField: '/mechanism', mode: 'string' },
  { requestField: 'safety / contraindications', schemaField: 'contraindications', patchField: '/contraindications', mode: 'array' },
  { requestField: 'traditional use', schemaField: 'traditionalUse', patchField: '/traditionalUse', mode: 'array' },
];

const FIELD_TERMS = {
  activeCompounds: ['constituent', 'compound', 'alkaloid', 'flavonoid', 'terpene', 'contains'],
  effects: ['effect', 'anti', 'activity', 'pharmacological', 'bioactivity', 'clinical'],
  mechanism: ['mechanism', 'pathway', 'receptor', 'enzyme', 'signal', 'modulate', 'inhibit', 'activate'],
  contraindications: ['contraindication', 'adverse', 'toxicity', 'pregnan', 'interaction', 'risk', 'warning'],
  traditionalUse: ['traditional', 'ethnobotanical', 'folk', 'used for', 'ayurveda', 'tcm'],
};

function parseArgs(argv) {
  const out = { herbs: [], maxHerbs: 5, outDir: 'ops/evidence-acquisition', includeLowConfidence: false };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--herbs' && argv[i + 1]) {
      out.herbs = argv[i + 1].split(',').map((v) => v.trim()).filter(Boolean);
      i += 1;
    } else if (arg.startsWith('--herbs=')) out.herbs = arg.slice('--herbs='.length).split(',').map((v) => v.trim()).filter(Boolean);
    else if (arg === '--max-herbs' && argv[i + 1]) {
      out.maxHerbs = Number.parseInt(argv[i + 1], 10);
      i += 1;
    } else if (arg.startsWith('--max-herbs=')) out.maxHerbs = Number.parseInt(arg.slice('--max-herbs='.length), 10);
    else if (arg === '--out-dir' && argv[i + 1]) {
      out.outDir = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--out-dir=')) out.outDir = arg.slice('--out-dir='.length);
    else if (arg === '--include-low-confidence') out.includeLowConfidence = true;
  }
  if (!Number.isInteger(out.maxHerbs) || out.maxHerbs <= 0) throw new Error('--max-herbs must be a positive integer');
  return out;
}

function isMissingField(value) {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'string') return value.trim().length === 0;
  return false;
}


function runCurl(url) {
  const result = spawnSync('curl', ['-sSL', url], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`curl failed for ${url}`);
  return result.stdout;
}

function domainQuality(url) {
  const host = (() => {
    try { return new URL(url).hostname.toLowerCase(); } catch { return ''; }
  })();
  if (host.includes('pubmed.ncbi.nlm.nih.gov')) return { score: 1, label: 'primary_pubmed' };
  if (host.endsWith('.nih.gov')) return { score: 0.95, label: 'primary_nih' };
  if (host.endsWith('.gov') || host.endsWith('.edu')) return { score: 0.85, label: 'academic_or_gov' };
  if (host.includes('sciencedirect.com') || host.includes('springer.com') || host.includes('wiley.com')) return { score: 0.75, label: 'secondary_academic' };
  return { score: 0.2, label: 'secondary_or_untrusted' };
}

function pubmedSearch(term, retmax = 8) {
  const url = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi');
  url.searchParams.set('db', 'pubmed');
  url.searchParams.set('retmode', 'json');
  url.searchParams.set('sort', 'relevance');
  url.searchParams.set('retmax', String(retmax));
  url.searchParams.set('term', term);
  const json = JSON.parse(runCurl(url.toString()));
  return json?.esearchresult?.idlist ?? [];
}

function pubmedSummaries(ids) {
  if (ids.length === 0) return [];
  const url = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi');
  url.searchParams.set('db', 'pubmed');
  url.searchParams.set('retmode', 'json');
  url.searchParams.set('id', ids.join(','));
  const json = JSON.parse(runCurl(url.toString()));
  return ids.map((id) => ({ id, ...(json?.result?.[id] ?? {}) })).filter((entry) => entry?.title);
}

function pubmedAbstract(pmid) {
  const url = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi');
  url.searchParams.set('db', 'pubmed');
  url.searchParams.set('rettype', 'abstract');
  url.searchParams.set('retmode', 'text');
  url.searchParams.set('id', String(pmid));
  return runCurl(url.toString());
}

function sentenceSplit(text) {
  return String(text)
    .split(/(?<=[.!?])\s+/u)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractEvidenceFromAbstract(abstractText, schemaField, title = '') {
  const terms = FIELD_TERMS[schemaField] ?? [];
  const normalized = String(abstractText).replace(/\s+/g, ' ').trim();
  const sentences = sentenceSplit(normalized);
  const hits = sentences.filter((sentence) => terms.some((term) => sentence.toLowerCase().includes(term)));
  if (hits.length > 0) return hits.slice(0, 2);
  const titleLower = String(title).toLowerCase();
  if (terms.some((term) => titleLower.includes(term))) return [String(title).trim()];
  return sentences.slice(0, 1);
}

const GENERIC_TOKENS = new Set([
  'a', 'an', 'and', 'or', 'the', 'of', 'for', 'with', 'that', 'this', 'these', 'those', 'into', 'from', 'due',
  'compound', 'compounds', 'constituent', 'constituents', 'extract', 'study', 'activity', 'activities', 'effect',
  'effects', 'analysis', 'screening', 'investigation', 'evidence', 'treatment', 'plant', 'herb', 'species', 'source',
  'valuable', 'profile', 'profiling', 'present', 'showed', 'shows', 'found', 'demonstrates', 'demonstrated', 'evaluate',
  'evaluated', 'correlate', 'correlated', 'presence', 'detected', 'important',
]);

const COMPOUND_SUFFIX_RE = /(ine|in|ol|one|ene|acid|ose|etin|oside|glycoside|sterol|terpene|flavone|flavonoid|alkaloid|saponin|phenol)$/iu;

function normalizeWhitespace(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function normalizeActiveCompounds(rawText, herb) {
  const text = normalizeWhitespace(rawText);
  const herbTokens = new Set(
    String(herb.displayName ?? herb.name ?? '')
      .toLowerCase()
      .split(/[^a-z0-9]+/u)
      .filter(Boolean),
  );
  const candidates = text.match(/\b[A-Za-z][A-Za-z0-9-]{2,}(?:\s+[A-Za-z][A-Za-z0-9-]{2,}){0,2}\b/g) ?? [];
  const cleaned = [];

  for (const candidate of candidates) {
    const value = normalizeWhitespace(candidate);
    const parts = value.toLowerCase().split(/\s+/u);
    if (parts.length > 2) continue;
    if (GENERIC_TOKENS.has(parts[0])) continue;
    if (parts.length === 2 && !/(acid|oside|glycoside|sterol|flavonoid|alkaloid|terpene|phenol)$/iu.test(parts[1])) continue;
    if (parts.some((part) => herbTokens.has(part))) continue;
    if (parts.some((part) => GENERIC_TOKENS.has(part))) continue;
    if (!parts.some((part) => COMPOUND_SUFFIX_RE.test(part))) continue;
    if (value.length < 4 || value.length > 40) continue;
    cleaned.push(value);
  }

  return [...new Set(cleaned)].slice(0, 8);
}

function normalizeStructuredPhrases(rawText, schemaField) {
  const text = normalizeWhitespace(rawText).toLowerCase();
  const out = new Set();
  const push = (value) => {
    const cleaned = normalizeWhitespace(value).toLowerCase();
    if (!cleaned) return;
    if (/[.?!]/u.test(cleaned)) return;
    out.add(cleaned);
  };

  const lexicalEffects = [
    'anti-inflammatory activity',
    'antioxidant activity',
    'antimicrobial activity',
    'analgesic activity',
    'antidiabetic activity',
    'anticancer activity',
    'hepatoprotective activity',
    'immunomodulatory activity',
  ];
  for (const phrase of lexicalEffects) {
    if (text.includes(phrase.replace(' activity', '')) || text.includes(phrase)) push(phrase);
  }

  const mechPatterns = [
    { re: /\binhibit(?:s|ed|ion)?\s+([a-z0-9-]{3,}(?:\s+[a-z0-9-]{3,}){0,2})/giu, fmt: (m) => `${m} inhibition` },
    { re: /\bactivate(?:s|d|ion)?\s+([a-z0-9-]{3,}(?:\s+[a-z0-9-]{3,}){0,2})/giu, fmt: (m) => `${m} activation` },
    { re: /\bmodulat(?:e|es|ed|ion)\s+([a-z0-9-]{3,}(?:\s+[a-z0-9-]{3,}){0,2})/giu, fmt: (m) => `${m} modulation` },
    { re: /\bagonist(?:s)?\s+(?:of\s+)?([a-z0-9-]{3,}(?:\s+[a-z0-9-]{3,}){0,2})/giu, fmt: (m) => `${m} agonism` },
    { re: /\bantagonist(?:s)?\s+(?:of\s+)?([a-z0-9-]{3,}(?:\s+[a-z0-9-]{3,}){0,2})/giu, fmt: (m) => `${m} antagonism` },
  ];
  for (const pattern of mechPatterns) {
    for (const match of text.matchAll(pattern.re)) push(pattern.fmt(match[1]));
  }

  if (schemaField === 'mechanism') return Array.from(out).slice(0, 3);
  if (schemaField === 'effects') return Array.from(out).slice(0, 4);
  if (schemaField === 'contraindications') {
    if (text.includes('contraindication')) push('contraindication reported');
    if (text.includes('toxicity')) push('toxicity concern');
    if (text.includes('adverse')) push('adverse-effect signal');
    if (text.includes('pregnan')) push('pregnancy caution');
    return Array.from(out).slice(0, 4);
  }
  if (schemaField === 'traditionalUse') {
    if (text.includes('traditional')) push('traditional-use context');
    if (text.includes('ethnobotanical')) push('ethnobotanical use');
    if (text.includes('ayurveda')) push('ayurvedic use');
    if (text.includes('tcm')) push('tcm use');
    return Array.from(out).slice(0, 4);
  }
  return Array.from(out);
}

function normalizeFieldValue(schemaField, evidenceText, herb) {
  const before = normalizeWhitespace(evidenceText);
  if (!before) return { ok: false, before, after: null, reason: 'empty_evidence' };

  if (schemaField === 'activeCompounds') {
    const values = normalizeActiveCompounds(before, herb);
    if (values.length === 0) return { ok: false, before, after: null, reason: 'no_clean_compound_names' };
    return { ok: true, before, after: values };
  }

  if (schemaField === 'effects' || schemaField === 'mechanism' || schemaField === 'contraindications' || schemaField === 'traditionalUse') {
    const phrases = normalizeStructuredPhrases(before, schemaField);
    if (phrases.length === 0) return { ok: false, before, after: null, reason: 'no_structured_phrase_extracted' };
    const after = schemaField === 'mechanism' ? phrases.join('; ') : phrases;
    return { ok: true, before, after };
  }

  return { ok: false, before, after: null, reason: 'unsupported_field' };
}

function titleMatchesHerb(title, herb) {
  const haystack = `${String(title ?? '').toLowerCase()} ${String(herb.displayName ?? herb.name ?? '').toLowerCase()}`;
  const tokens = String(herb.displayName ?? herb.name ?? '')
    .toLowerCase()
    .split(/[^a-z0-9]+/u)
    .filter((token) => token.length > 3);
  const hits = tokens.filter((token) => haystack.includes(token));
  return hits.length >= Math.min(2, Math.max(1, tokens.length));
}

function confidenceFromSource({ qualityScore, evidenceText, schemaField }) {
  const directSignal = FIELD_TERMS[schemaField].some((term) => evidenceText.toLowerCase().includes(term));
  if (qualityScore >= 0.9 && directSignal) return 'high';
  if (qualityScore >= 0.75 && directSignal) return 'medium';
  return 'low';
}

function mapTaskForField(schemaField) {
  if (schemaField === 'activeCompounds') return 'link_integrity';
  return 'herb_mechanism';
}

async function collectFieldEvidence(herb, targetField) {
  const searchTerm = `(${herb.displayName || herb.name}) AND (${targetField.requestField})`;
  const ids = pubmedSearch(searchTerm, 6);
  const summaries = pubmedSummaries(ids);

  for (const summary of summaries) {
    if (!titleMatchesHerb(summary.title, herb)) continue;
    const sourceUrl = `https://pubmed.ncbi.nlm.nih.gov/${summary.uid || summary.id}/`;
    const quality = domainQuality(sourceUrl);
    if (quality.score < 0.7) continue;
    const abstractText = pubmedAbstract(summary.uid || summary.id);
    const extracted = extractEvidenceFromAbstract(abstractText, targetField.schemaField, summary.title);
    if (extracted.length === 0) continue;

    const evidence = extracted.join(' ');
    const normalization = normalizeFieldValue(targetField.schemaField, evidence, herb);
    if (!normalization.ok) continue;

    const confidence = confidenceFromSource({ qualityScore: quality.score, evidenceText: evidence, schemaField: targetField.schemaField });
    return {
      herb: herb.slug,
      field: targetField.requestField,
      schemaField: targetField.schemaField,
      patchField: targetField.patchField,
      value: normalization.after,
      normalization: {
        before: normalization.before,
        after: normalization.after,
      },
      source: {
        title: summary.title,
        url: sourceUrl,
        pubmedId: String(summary.uid || summary.id),
        quality: quality.label,
      },
      evidence,
      confidence,
      evidenceClass: confidence === 'high' ? 'human-clinical' : confidence === 'medium' ? 'preclinical-mechanistic' : 'traditional-use',
    };
  }

  return null;
}

function buildPatch(runId, herb, acceptedRows) {
  const patchId = generatePrefixedUlid('patch');
  const operations = [];
  const sourceRows = [];

  for (const row of acceptedRows) {
    const sourceId = generatePrefixedUlid('src');
    sourceRows.push({ id: sourceId, title: row.source.title, url: row.source.url, evidenceClass: row.evidenceClass });

    if (row.schemaField === 'activeCompounds') {
      operations.push({
        op: 'set',
        task: mapTaskForField(row.schemaField),
        entity_type: 'herb',
        entity_id: herb.slug,
        field: row.patchField,
        value: row.value,
      });
      continue;
    }

    if (row.schemaField === 'mechanism') {
      operations.push({
        op: 'set',
        task: 'herb_mechanism',
        entity_type: 'herb',
        entity_id: herb.slug,
        field: '/mechanism',
        value: Array.isArray(row.value) ? row.value.join(' ') : row.value,
      });
    }

    const claimId = generatePrefixedUlid('clm');
    operations.push({
      op: 'append',
      task: 'herb_mechanism',
      entity_type: 'herb',
      entity_id: herb.slug,
      field: '/claims/-',
      value: {
        id: claimId,
        claim: `[${row.schemaField}] ${Array.isArray(row.value) ? row.value.join('; ') : row.value}`,
        source_ids: [sourceId],
      },
    });
  }

  if (operations.length === 0) return null;

  operations.push({
    op: 'set',
    task: 'herb_mechanism',
    entity_type: 'herb',
    entity_id: herb.slug,
    field: '/_provenance',
    value: {
      run_id: runId,
      sources: sourceRows,
    },
  });

  operations.push({
    op: 'set',
    task: 'herb_mechanism',
    entity_type: 'herb',
    entity_id: herb.slug,
    field: '/_review',
    value: { status: 'pending' },
  });

  return {
    patch_id: patchId,
    producer: 'evidence-acquisition-engine@v1',
    lane: 'B',
    created_at: nowIso(),
    operations,
  };
}

async function main() {
  const options = parseArgs(process.argv);
  const herbs = loadJson(join(REPO_ROOT, 'public', 'data', 'herbs.json'));
  const selected = (options.herbs.length > 0
    ? herbs.filter((h) => options.herbs.includes(h.slug) || options.herbs.includes(h.id) || options.herbs.includes(h.name))
    : herbs.filter((h) => TARGET_FIELDS.some((f) => isMissingField(h[f.schemaField]))).slice(0, options.maxHerbs));

  const runId = deterministicRunId({ phase: 'evidence-acquisition', herbs: selected.map((h) => h.slug) });
  const records = [];
  const accepted = [];
  const rejected = [];
  const patches = [];

  for (const herb of selected.slice(0, options.maxHerbs)) {
    const missingTargets = TARGET_FIELDS.filter((field) => isMissingField(herb[field.schemaField]));
    const herbRows = [];
    for (const targetField of missingTargets) {
      try {
        const row = await collectFieldEvidence(herb, targetField);
        if (!row) {
          rejected.push({
            herb: herb.slug,
            field: targetField.requestField,
            schemaField: targetField.schemaField,
            confidence: 'low',
            reason: 'no-high-quality-source-evidence-found-or-clean-normalization-failed',
          });
          continue;
        }
        records.push(row);
        if (row.confidence === 'low' && !options.includeLowConfidence) rejected.push(row);
        else {
          accepted.push(row);
          herbRows.push(row);
        }
      } catch (error) {
        rejected.push({
          herb: herb.slug,
          field: targetField.requestField,
          confidence: 'low',
          reason: String(error.message || error),
        });
      }
    }

    const patch = buildPatch(runId, herb, herbRows);
    if (patch) patches.push(patch);
  }

  const report = {
    runId,
    createdAt: nowIso(),
    selectedHerbs: selected.slice(0, options.maxHerbs).map((h) => h.slug),
    extracted: records,
    accepted,
    rejected,
    patches,
    integration: {
      validate: 'node scripts/enrichment/validate-schema.mjs && node scripts/enrichment/validate-domain.mjs',
      apply: 'node scripts/enrichment/apply-patches.mjs',
      reviewQueue: 'low confidence rows are written under rejected[] for manual review queue intake',
      note: 'Patches are emitted in ops/evidence-acquisition and can be promoted to patches/ after human review.',
    },
  };

  const outDir = join(REPO_ROOT, options.outDir);
  ensureDir(outDir);
  writeJson(join(outDir, `${runId}.json`), report);

  const patchOutDir = join(outDir, 'patches');
  ensureDir(patchOutDir);
  patches.forEach((patch) => writeJson(join(patchOutDir, `${patch.patch_id}.json`), patch));

  console.log(`[evidence-acquisition] run=${runId} herbs=${report.selectedHerbs.length} extracted=${records.length} accepted=${accepted.length} rejected=${rejected.length} patches=${patches.length}`);
  console.log(`[evidence-acquisition] report=${options.outDir}/${runId}.json`);
}

main().catch((error) => {
  console.error(`[evidence-acquisition] FAIL ${error.message}`);
  process.exit(1);
});
