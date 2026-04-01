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

const FIELD_CUES = {
  activeCompounds: ['contains', 'identified', 'phytochemical', 'constituent', 'including', 'rich in'],
  effects: ['shown to', 'demonstrated', 'activity', 'effect', 'improved', 'reduced', 'modulated'],
  mechanism: ['mechanism', 'inhibit', 'activate', 'modulate', 'receptor', 'pathway', 'enzyme'],
  contraindications: ['contraindicated', 'may cause', 'adverse', 'toxicity', 'risk', 'warning', 'interaction'],
  traditionalUse: ['traditionally', 'used for', 'ethnobotanical', 'ayurveda', 'tcm', 'folk'],
};

const VAGUE_LANGUAGE_RE = /\b(may|might|could|potentially|suggests?|appears?|possibly|preliminary)\b/iu;
const HARD_SPECULATIVE_RE = /\b(more research|further study|unclear|unknown)\b/iu;

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

function europePmcSearch(query, pageSize = 8) {
  const url = new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
  url.searchParams.set('query', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('resultType', 'core');
  url.searchParams.set('pageSize', String(pageSize));
  const json = JSON.parse(runCurl(url.toString()));
  return json?.resultList?.result ?? [];
}

function sentenceSplit(text) {
  return String(text)
    .split(/(?<=[.!?])\s+/u)
    .map((s) => s.trim())
    .filter(Boolean);
}

function cleanAtomicPhrase(value) {
  const stripped = normalizeWhitespace(String(value))
    .replace(/^(background|objective|methods?|results?|conclusion|conclusions)[:-]\s*/iu, '')
    .replace(/\((?:[^)(]|\([^)(]*\))*\)/gu, '')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!stripped) return '';
  return stripped.replace(/^[,;:-]+|[,;:-]+$/g, '').trim();
}

function splitCandidateSegments(sentence) {
  return String(sentence)
    .split(/\s*;\s*|\s+-\s+|\s+but\s+|\s+however,\s+/iu)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function extractListFromContains(segment) {
  const m = segment.match(/\b(?:contains?|contained|including|identified)\s+(.+)/iu);
  if (!m) return [];
  return m[1]
    .split(/\s*,\s*|\s+and\s+/iu)
    .map((item) => cleanAtomicPhrase(item))
    .filter((item) => item.length >= 3 && item.length <= 48);
}

function isVaguePhrase(value) {
  return HARD_SPECULATIVE_RE.test(value) || (VAGUE_LANGUAGE_RE.test(value) && value.length > 90);
}

function extractEvidenceFromAbstract(abstractText, schemaField, title = '') {
  const terms = FIELD_TERMS[schemaField] ?? [];
  const cues = FIELD_CUES[schemaField] ?? [];
  const normalized = String(abstractText).replace(/\s+/g, ' ').trim();
  const sentences = sentenceSplit(normalized);
  const debug = { pass: 'none', considered: sentences.length, rejected: [] };
  const hits = [];

  // Pass 1: strict sentence-level extraction with field cues/terms.
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (!terms.some((term) => lower.includes(term)) && !cues.some((cue) => lower.includes(cue))) continue;
    const cleaned = cleanAtomicPhrase(sentence);
    if (cleaned.length < 16 || cleaned.length > 200) {
      debug.rejected.push({ phrase: cleaned, reason: 'length_out_of_range' });
      continue;
    }
    if (isVaguePhrase(cleaned)) {
      debug.rejected.push({ phrase: cleaned, reason: 'too_vague_or_speculative' });
      continue;
    }
    hits.push(cleaned);
  }

  if (hits.length > 0) return { phrases: hits.slice(0, 3), debug: { ...debug, pass: 'strict_sentence' } };

  // Pass 2: relaxed segmentation into clauses/list-items while keeping same quality thresholds.
  const relaxed = [];
  for (const sentence of sentences) {
    for (const part of splitCandidateSegments(sentence)) {
      const lower = part.toLowerCase();
      if (!terms.some((term) => lower.includes(term)) && !cues.some((cue) => lower.includes(cue))) continue;
      const containsList = schemaField === 'activeCompounds' ? extractListFromContains(part) : [];
      const candidates = containsList.length > 0 ? containsList : [cleanAtomicPhrase(part)];
      for (const candidate of candidates) {
        if (candidate.length < 12 || candidate.length > 160) continue;
        if (isVaguePhrase(candidate)) continue;
        relaxed.push(candidate);
      }
    }
  }
  if (relaxed.length > 0) return { phrases: relaxed.slice(0, 4), debug: { ...debug, pass: 'relaxed_clause' } };

  const titleLower = String(title).toLowerCase();
  if (terms.some((term) => titleLower.includes(term))) {
    const titlePhrase = cleanAtomicPhrase(String(title));
    if (titlePhrase) return { phrases: [titlePhrase], debug: { ...debug, pass: 'title_fallback' } };
  }
  return { phrases: [], debug: { ...debug, pass: 'none' } };
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
  const text = normalizeWhitespace(rawText).replace(/<[^>]+>/g, ' ');
  const herbTokens = new Set(
    String(herb.displayName ?? herb.name ?? '')
      .toLowerCase()
      .split(/[^a-z0-9]+/u)
      .filter(Boolean),
  );
  const candidates = text.match(/\b[A-Za-z][A-Za-z0-9-]{2,}(?:\s+[A-Za-z][A-Za-z0-9-]{2,}){0,2}\b/g) ?? [];
  const typedFamilies = [...text.matchAll(/\b([A-Za-z][A-Za-z0-9-]{3,})\s+type of\s+[A-Za-z -]{3,}alkaloids?\b/giu)].map((m) => m[1]);
  const containsList = [...text.matchAll(/\b(?:contains?|including|identified)\s+([^.;]+)/giu)]
    .flatMap((m) => m[1].split(/\s*,\s*|\s+and\s+/iu))
    .map((token) => normalizeWhitespace(token))
    .filter(Boolean);
  const allCandidates = [...candidates, ...typedFamilies, ...containsList];
  const cleaned = [];

  for (const candidate of allCandidates) {
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
  const aliasText = buildHerbAliases(herb).join(' ').toLowerCase();
  const haystack = `${String(title ?? '').toLowerCase()} ${aliasText}`;
  const tokens = aliasText
    .split(/[^a-z0-9]+/u)
    .filter((token) => token.length > 3);
  const hits = tokens.filter((token) => haystack.includes(token));
  return hits.length >= Math.min(2, Math.max(1, tokens.length));
}

function confidenceFromSource({ qualityScore, evidenceText, schemaField }) {
  const lower = evidenceText.toLowerCase();
  const directSignal = FIELD_TERMS[schemaField].some((term) => lower.includes(term));
  const structuredSignal = /contains?\s+[a-z]|has been shown to|contraindicated|may cause|inhibit(?:s|ed|ion)?|activate(?:s|d|ion)?/iu.test(evidenceText);
  const vaguePenalty = isVaguePhrase(evidenceText) ? 0.15 : 0;
  const score = qualityScore + (directSignal ? 0.05 : 0) + (structuredSignal ? 0.08 : 0) - vaguePenalty;
  if (score >= 0.9 && directSignal) return 'high';
  if (score >= 0.75 && directSignal) return 'medium';
  return 'low';
}

function buildHerbAliases(herb) {
  const aliases = [
    herb.displayName,
    herb.name,
    herb.displayScientificName,
    herb.latin,
    herb.scientificNormalized,
    ...(Array.isArray(herb.aliases) ? herb.aliases : []),
  ]
    .map((value) => normalizeWhitespace(value))
    .filter((value) => value && value.toLowerCase() !== 'nan');
  return [...new Set(aliases)];
}

function compactTerm(value) {
  return normalizeWhitespace(value).replace(/\s+/g, ' ').trim();
}

function buildQueryPlan(herb, targetField) {
  const aliases = buildHerbAliases(herb);
  const primaryName = aliases[0] || herb.slug;
  const compoundHints = [
    ...(Array.isArray(herb.activeCompounds) ? herb.activeCompounds.slice(0, 3) : []),
  ].map((value) => compactTerm(value)).filter(Boolean);
  const fieldQueries = {
    activeCompounds: `${primaryName} ${compoundHints.join(' ')} active compounds phytochemistry`,
    effects: `${primaryName} pharmacology pharmacological effects`,
    mechanism: `${primaryName} pharmacology mechanism receptor pathway`,
    contraindications: `${primaryName} contraindications adverse effects interaction toxicity`,
    traditionalUse: `${primaryName} traditional use ethnobotanical`,
  };

  const focused = [fieldQueries[targetField.schemaField] ?? `${primaryName} ${targetField.requestField}`];
  const aliasQueries = aliases.slice(1, 4).map((alias) => `${alias} ${targetField.requestField}`);
  const broadFallback = [
    `${primaryName} medicinal plant review`,
    `${primaryName} ${targetField.schemaField}`,
    `${primaryName}`,
  ];

  return {
    aliases,
    queries: [...new Set([...focused, ...aliasQueries, ...broadFallback].map((q) => compactTerm(q)).filter(Boolean))].map((q) => ({
      query: q,
      stage: focused.includes(q) ? 'focused' : aliasQueries.includes(q) ? 'alias' : 'fallback',
    })),
  };
}

function mapTaskForField(schemaField) {
  if (schemaField === 'activeCompounds') return 'link_integrity';
  return 'herb_mechanism';
}

async function collectFieldEvidence(herb, targetField) {
  const plan = buildQueryPlan(herb, targetField);
  const stats = {
    aliasesTried: plan.aliases,
    queryAttempts: [],
    sourcesFound: 0,
    highQualitySources: 0,
    acceptedSource: null,
  };

  for (const item of plan.queries) {
    const queryStats = { query: item.query, stage: item.stage, sourcesFound: 0, highQualitySources: 0, accepted: false, providers: [] };
    const pubmedIds = pubmedSearch(item.query, 8);
    const summaries = pubmedSummaries(pubmedIds);
    const europeRows = europePmcSearch(item.query, 8);
    const candidates = [];

    for (const summary of summaries) {
      candidates.push({
        provider: 'pubmed',
        title: summary.title,
        sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${summary.uid || summary.id}/`,
        pubmedId: String(summary.uid || summary.id),
        getAbstract: () => pubmedAbstract(summary.uid || summary.id),
      });
    }

    for (const row of europeRows) {
      const id = row.pmid || row.id;
      const sourceUrl =
        row?.fullTextUrlList?.fullTextUrl?.[0]?.url
        || (row.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${row.pmid}/` : null)
        || (row.doi ? `https://doi.org/${row.doi}` : null)
        || `https://europepmc.org/article/${row.source || 'MED'}/${id}`;
      candidates.push({
        provider: 'europe_pmc',
        title: row.title,
        sourceUrl,
        pubmedId: row.pmid ? String(row.pmid) : null,
        getAbstract: () => String(row.abstractText || ''),
      });
    }

    queryStats.providers = ['pubmed', 'europe_pmc'];
    queryStats.sourcesFound = candidates.length;
    stats.sourcesFound += candidates.length;

    for (const candidate of candidates) {
      if (!titleMatchesHerb(candidate.title, herb)) continue;
      const quality = domainQuality(candidate.sourceUrl);
      if (quality.score < 0.7) continue;
      queryStats.highQualitySources += 1;
      stats.highQualitySources += 1;
      const abstractText = candidate.getAbstract();
      if (!abstractText) continue;
      const extracted = extractEvidenceFromAbstract(abstractText, targetField.schemaField, candidate.title);
      if (extracted.phrases.length === 0) {
        queryStats.lastFailure = {
          stage: 'extract',
          reason: 'no_atomic_field_mapped_phrases',
          rawText: normalizeWhitespace(abstractText).slice(0, 400),
          extractionDebug: extracted.debug,
        };
        continue;
      }

      const evidence = extracted.phrases.join(' ');
      const normalization = normalizeFieldValue(targetField.schemaField, evidence, herb);
      if (!normalization.ok) {
        queryStats.lastFailure = {
          stage: 'normalize',
          reason: normalization.reason,
          rawText: evidence,
        };
        continue;
      }

      const confidence = confidenceFromSource({ qualityScore: quality.score, evidenceText: evidence, schemaField: targetField.schemaField });
      const row = {
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
          title: candidate.title,
          url: candidate.sourceUrl,
          pubmedId: candidate.pubmedId,
          quality: quality.label,
          provider: candidate.provider,
        },
        evidence,
        extractionDebug: extracted.debug,
        confidence,
        evidenceClass: confidence === 'high' ? 'human-clinical' : confidence === 'medium' ? 'preclinical-mechanistic' : 'traditional-use',
        retrieval: stats,
      };
      queryStats.accepted = true;
      stats.acceptedSource = { query: item.query, provider: candidate.provider, url: candidate.sourceUrl };
      stats.queryAttempts.push(queryStats);
      return { row, retrieval: stats };
    }
    stats.queryAttempts.push(queryStats);
  }

  return { row: null, retrieval: stats };
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
        const result = await collectFieldEvidence(herb, targetField);
        const row = result?.row ?? null;
        const retrieval = result?.retrieval ?? null;
        if (!row) {
          rejected.push({
            herb: herb.slug,
            field: targetField.requestField,
            schemaField: targetField.schemaField,
            confidence: 'low',
            reason: 'no-high-quality-source-evidence-found-or-clean-normalization-failed',
            rawExtractedText: retrieval?.queryAttempts?.find((item) => item.lastFailure)?.lastFailure?.rawText ?? '',
            failureDetail: retrieval?.queryAttempts?.find((item) => item.lastFailure)?.lastFailure ?? null,
            retrieval,
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
    retrievalSummary: {
      perHerb: Object.fromEntries(
        selected.slice(0, options.maxHerbs).map((herb) => {
          const herbRows = [...accepted, ...rejected].filter((row) => row.herb === herb.slug);
          const queryAttempts = herbRows.reduce((sum, row) => sum + (row.retrieval?.queryAttempts?.length ?? 0), 0);
          const sourcesFound = herbRows.reduce((sum, row) => sum + (row.retrieval?.sourcesFound ?? 0), 0);
          const highQualitySources = herbRows.reduce((sum, row) => sum + (row.retrieval?.highQualitySources ?? 0), 0);
          const successfulQueries = herbRows
            .flatMap((row) => row.retrieval?.queryAttempts ?? [])
            .filter((item) => item.accepted)
            .map((item) => item.query);
          return [herb.slug, {
            queryAttempts,
            sourcesFound,
            highQualitySources,
            successfulQueries: [...new Set(successfulQueries)],
          }];
        }),
      ),
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
