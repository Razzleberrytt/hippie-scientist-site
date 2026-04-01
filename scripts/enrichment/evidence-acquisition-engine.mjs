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

function normalizeValues(schemaField, evidenceText) {
  const text = evidenceText.replace(/\s+/g, ' ').trim();
  if (schemaField === 'mechanism') return text;
  if (schemaField === 'activeCompounds') {
    const matches = text.match(/\b([a-z]{4,}(?:ine|ins|ol|one|ene|acid)|[A-Z][a-z]{3,}(?:\s+[A-Z][a-z]{3,})?)\b/g) ?? [];
    const stopwords = new Set(['thus', 'this', 'that', 'with', 'from', 'were', 'have', 'into', 'important']);
    return [...new Set(matches.map((m) => m.trim()).filter((m) => !stopwords.has(m.toLowerCase())))].slice(0, 6);
  }
  return [text].filter(Boolean);
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
    const normalized = normalizeValues(targetField.schemaField, evidence);
    if ((Array.isArray(normalized) && normalized.length === 0) || (!Array.isArray(normalized) && !normalized)) continue;

    const confidence = confidenceFromSource({ qualityScore: quality.score, evidenceText: evidence, schemaField: targetField.schemaField });
    if (targetField.schemaField === 'activeCompounds' && Array.isArray(normalized) && normalized.length === 0) continue;
    return {
      herb: herb.slug,
      field: targetField.requestField,
      schemaField: targetField.schemaField,
      patchField: targetField.patchField,
      value: normalized,
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
            reason: 'no-high-quality-source-evidence-found',
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
