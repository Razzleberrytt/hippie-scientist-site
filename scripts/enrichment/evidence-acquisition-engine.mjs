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
  activeCompounds: ['constituent', 'constituents', 'compound', 'compounds', 'alkaloid', 'alkaloids', 'flavonoid', 'flavonoids', 'terpene', 'terpenes', 'glycoside', 'glycosides', 'phytochemical', 'contains'],
  effects: ['effect', 'anti', 'activity', 'pharmacological', 'bioactivity', 'clinical'],
  mechanism: ['mechanism', 'pathway', 'receptor', 'enzyme', 'signal', 'modulate', 'inhibit', 'activate'],
  contraindications: ['contraindication', 'adverse', 'toxicity', 'pregnan', 'interaction', 'risk', 'warning'],
  traditionalUse: ['traditional', 'ethnobotanical', 'folk', 'used for', 'ayurveda', 'tcm'],
};

const FIELD_CUES = {
  activeCompounds: ['contains', 'identified', 'phytochemical', 'constituent', 'including', 'rich in', 'isolated', 'phytoconstituent'],
  effects: ['shown to', 'demonstrated', 'activity', 'effect', 'improved', 'reduced', 'modulated'],
  mechanism: ['mechanism', 'inhibit', 'activate', 'modulate', 'receptor', 'pathway', 'enzyme'],
  contraindications: ['contraindicated', 'may cause', 'adverse', 'toxicity', 'risk', 'warning', 'interaction'],
  traditionalUse: ['traditionally', 'used for', 'ethnobotanical', 'ayurveda', 'tcm', 'folk'],
};

const VAGUE_LANGUAGE_RE = /\b(may|might|could|potentially|suggests?|appears?|possibly|preliminary)\b/iu;
const HARD_SPECULATIVE_RE = /\b(more research|further study|unclear|unknown)\b/iu;

function parseArgs(argv) {
  const out = { herbs: [], maxHerbs: 5, outDir: 'ops/evidence-acquisition', includeLowConfidence: false, focusField: null };
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
    else if (arg === '--focus-field' && argv[i + 1]) {
      out.focusField = String(argv[i + 1]).trim();
      i += 1;
    } else if (arg.startsWith('--focus-field=')) out.focusField = String(arg.slice('--focus-field='.length)).trim();
  }
  if (!Number.isInteger(out.maxHerbs) || out.maxHerbs <= 0) throw new Error('--max-herbs must be a positive integer');
  if (out.focusField && !TARGET_FIELDS.some((field) => field.schemaField === out.focusField || field.requestField === out.focusField)) {
    throw new Error(`--focus-field must match one of: ${TARGET_FIELDS.map((field) => field.schemaField).join(', ')}`);
  }
  return out;
}

function isMissingField(value) {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'string') return value.trim().length === 0;
  return false;
}

function herbKey(herb) {
  return String(herb?.slug ?? herb?.id ?? herb?.name ?? herb?.displayName ?? '').trim();
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
  if (host.includes('pubchem.ncbi.nlm.nih.gov')) return { score: 0.96, label: 'primary_pubchem' };
  if (host.includes('chembl.ebi.ac.uk')) return { score: 0.95, label: 'primary_chembl' };
  if (host.includes('kegg.jp')) return { score: 0.94, label: 'primary_kegg' };
  if (host.includes('drugbank.com')) return { score: 0.93, label: 'primary_drugbank' };
  if (host.includes('phytochem.nal.usda.gov')) return { score: 0.93, label: 'primary_usda_phytochem' };
  if (host.includes('ebi.ac.uk')) return { score: 0.9, label: 'primary_ebi' };
  if (host.endsWith('.nih.gov')) return { score: 0.95, label: 'primary_nih' };
  if (host.endsWith('.gov') || host.endsWith('.edu')) return { score: 0.85, label: 'academic_or_gov' };
  if (host.includes('sciencedirect.com') || host.includes('springer.com') || host.includes('wiley.com')) return { score: 0.75, label: 'secondary_academic' };
  return { score: 0.2, label: 'secondary_or_untrusted' };
}

function classifySourceTier(url) {
  const host = (() => {
    try { return new URL(url).hostname.toLowerCase(); } catch { return ''; }
  })();
  if (
    host.includes('pubmed.ncbi.nlm.nih.gov')
    || host.includes('pubchem.ncbi.nlm.nih.gov')
    || host.includes('chembl.ebi.ac.uk')
    || host.includes('ebi.ac.uk')
    || host.includes('kegg.jp')
    || host.includes('drugbank.com')
    || host.includes('phytochem.nal.usda.gov')
    || host.includes('ncbi.nlm.nih.gov')
    || host.endsWith('.nih.gov')
    || host.includes('sciencedirect.com')
  ) return 'tier1';
  if (host.includes('wikipedia.org') || host.includes('examine.com')) return 'tier2';
  return 'tier3';
}

function sourceHost(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return 'unknown';
  }
}

function isStructuredTier1Host(url) {
  const host = sourceHost(url);
  return host.includes('pubchem.ncbi.nlm.nih.gov')
    || host.includes('chembl.ebi.ac.uk')
    || host.includes('kegg.jp')
    || host.includes('drugbank.com')
    || host.includes('phytochem.nal.usda.gov')
    || host.includes('ebi.ac.uk');
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

function pmcSearch(term, retmax = 8) {
  const url = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi');
  url.searchParams.set('db', 'pmc');
  url.searchParams.set('retmode', 'json');
  url.searchParams.set('sort', 'relevance');
  url.searchParams.set('retmax', String(retmax));
  url.searchParams.set('term', term);
  const json = JSON.parse(runCurl(url.toString()));
  return json?.esearchresult?.idlist ?? [];
}

function pmcSummaries(ids) {
  if (ids.length === 0) return [];
  const url = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi');
  url.searchParams.set('db', 'pmc');
  url.searchParams.set('retmode', 'json');
  url.searchParams.set('id', ids.join(','));
  const json = JSON.parse(runCurl(url.toString()));
  return ids.map((id) => ({ id, ...(json?.result?.[id] ?? {}) })).filter((entry) => entry?.title);
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

function pmcAbstract(pmcId) {
  const url = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi');
  url.searchParams.set('db', 'pmc');
  url.searchParams.set('rettype', 'abstract');
  url.searchParams.set('retmode', 'text');
  url.searchParams.set('id', String(pmcId));
  return runCurl(url.toString());
}

function pubchemAutocomplete(term, limit = 6) {
  const url = new URL(`https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(term)}/JSON`);
  url.searchParams.set('limit', String(limit));
  const json = JSON.parse(runCurl(url.toString()));
  return json?.dictionary_terms?.compound ?? [];
}

function chemblMoleculeSearch(term, limit = 6) {
  const url = new URL('https://www.ebi.ac.uk/chembl/api/data/molecule/search.json');
  url.searchParams.set('q', term);
  url.searchParams.set('limit', String(limit));
  const json = JSON.parse(runCurl(url.toString()));
  return json?.molecules ?? [];
}

function keggCompoundSearch(term, limit = 8) {
  const response = runCurl(`https://rest.kegg.jp/find/compound/${encodeURIComponent(term)}`);
  return response
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, limit)
    .map((line) => {
      const [id, names] = line.split('\t');
      return { id, names: names ?? '' };
    });
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

const COMPOUND_HERB_LINK_INDEX = (() => {
  const compounds = loadJson(join(REPO_ROOT, 'public', 'data', 'compounds.json'));
  const index = new Map();
  const push = (compoundName, herbName) => {
    const cKey = normalizeWhitespace(compoundName).toLowerCase();
    const hKey = normalizeWhitespace(herbName).toLowerCase();
    if (!cKey || !hKey) return;
    const existing = index.get(cKey) ?? new Set();
    existing.add(hKey);
    index.set(cKey, existing);
  };
  for (const row of compounds) {
    const compoundName = normalizeWhitespace(row?.name ?? row?.displayName ?? row?.id ?? '');
    if (!compoundName) continue;
    for (const herbName of [...(Array.isArray(row?.herbs) ? row.herbs : []), ...(Array.isArray(row?.foundIn) ? row.foundIn : [])]) {
      push(compoundName, herbName);
    }
  }
  return index;
})();

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
  const normalizedTitle = String(title ?? '').toLowerCase();
  const aliases = buildHerbAliases(herb)
    .map((alias) => alias.toLowerCase())
    .filter(Boolean);
  if (aliases.length === 0) return false;
  if (aliases.some((alias) => new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}\\b`, 'u').test(normalizedTitle))) {
    return true;
  }
  return aliases.some((alias) => {
    const tokens = alias.split(/[^a-z0-9]+/u).filter((token) => token.length >= 4);
    if (tokens.length < 2) return false;
    return tokens.every((token) => new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}\\b`, 'u').test(normalizedTitle));
  }) || (() => {
    const scientific = compactTerm(herb.displayScientificName || herb.scientificNormalized || herb.latin || '');
    const genus = scientific.split(/\s+/u)[0]?.toLowerCase();
    if (!genus || genus.length < 4) return false;
    const hasGenus = new RegExp(`\\b${genus.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}\\b`, 'u').test(normalizedTitle);
    const hasCompoundContext = /\b(phytochem|constituent|alkaloid|flavonoid|terpene|glycoside|compound)\b/u.test(normalizedTitle);
    return hasGenus && hasCompoundContext;
  })() || (() => {
    const distinctiveTokens = aliases
      .flatMap((alias) => alias.split(/[^a-z0-9]+/u))
      .filter((token) => token.length >= 7);
    return distinctiveTokens.some((token) => new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}\\b`, 'u').test(normalizedTitle));
  })();
}

function structuredCompoundLinksToHerb(compoundValues, herb) {
  const aliases = buildHerbAliases(herb).map((alias) => alias.toLowerCase());
  if (aliases.length === 0) return false;
  return compoundValues.some((value) => {
    const normalized = normalizeWhitespace(value).toLowerCase();
    if (!normalized) return false;
    const linkedHerbs = COMPOUND_HERB_LINK_INDEX.get(normalized);
    if (!linkedHerbs) return false;
    return aliases.some((alias) => linkedHerbs.has(alias));
  });
}

function recordProviderRejection(queryStats, provider, reason) {
  queryStats.providerRejections = queryStats.providerRejections ?? {};
  queryStats.providerRejections[provider] = queryStats.providerRejections[provider] ?? {};
  queryStats.providerRejections[provider][reason] = (queryStats.providerRejections[provider][reason] ?? 0) + 1;
}

function looksGenericCompoundLabel(value) {
  const normalized = normalizeWhitespace(value).toLowerCase();
  if (!normalized) return true;
  if (/^chembl\d+$/u.test(normalized)) return true;
  if (/^(compound|molecule|metabolite|chemical)\s*\d*$/u.test(normalized)) return true;
  if (normalized.length < 4) return true;
  return false;
}

function scoreChemblCandidate(entry, herb, hints = []) {
  const prefName = normalizeWhitespace(entry?.pref_name ?? '');
  const chemblId = normalizeWhitespace(entry?.molecule_chembl_id ?? '');
  const synonymRows = Array.isArray(entry?.molecule_synonyms) ? entry.molecule_synonyms : [];
  const synonyms = synonymRows
    .map((row) => normalizeWhitespace(row?.molecule_synonym ?? row?.synonym ?? ''))
    .filter(Boolean)
    .slice(0, 6);
  const names = [...new Set([prefName, ...synonyms].filter(Boolean))];
  const lowerNames = names.map((name) => name.toLowerCase());
  const lowerHints = hints.map((hint) => hint.toLowerCase());
  const hintOverlap = lowerNames.some((name) => lowerHints.some((hint) => hint && name.includes(hint)));
  const linkedToHerb = structuredCompoundLinksToHerb(names, herb);
  const genericPenalty = names.every((name) => looksGenericCompoundLabel(name)) ? 0.45 : 0;
  const score = (linkedToHerb ? 0.7 : 0) + (hintOverlap ? 0.35 : 0) + (prefName ? 0.15 : 0) - genericPenalty;
  return {
    score,
    linkedToHerb,
    hintOverlap,
    prefName,
    chemblId,
    names,
  };
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
  const aliasVariants = [];
  const pushVariant = (value) => {
    const normalized = normalizeWhitespace(value);
    if (!normalized) return;
    aliasVariants.push(normalized);
    aliasVariants.push(normalized.replace(/[’']/gu, ''));
    aliasVariants.push(normalized.replace(/[-–]/gu, ' '));
  };
  const aliases = [
    herb.displayName,
    herb.name,
    herb.displayScientificName,
    herb.latin,
    herb.scientificNormalized,
    ...(Array.isArray(herb.aliases) ? herb.aliases : []),
  ]
    .filter((value) => normalizeWhitespace(value) && normalizeWhitespace(value).toLowerCase() !== 'nan');
  aliases.forEach((alias) => pushVariant(alias));
  return [...new Set(aliasVariants.map((value) => normalizeWhitespace(value)).filter(Boolean))];
}

function compactTerm(value) {
  return normalizeWhitespace(value).replace(/\s+/g, ' ').trim();
}

function buildQueryPlan(herb, targetField) {
  const aliases = buildHerbAliases(herb);
  const scientificName = compactTerm(herb.displayScientificName || herb.scientificNormalized || herb.latin || aliases[0] || herb.slug);
  const displayName = compactTerm(herb.displayName || herb.name || aliases[0] || herb.slug);
  const primaryName = scientificName || displayName || herb.slug;
  const compoundHints = [
    ...(Array.isArray(herb.activeCompounds) ? herb.activeCompounds.slice(0, 3) : []),
  ].map((value) => compactTerm(value)).filter(Boolean);
  const combinedName = [displayName, scientificName].filter(Boolean).join(' ');
  const phytochemTopics = ['phytochemistry', '"active compounds"', 'constituents', 'phytochemical profile'];
  const compoundFamilies = ['alkaloids', 'flavonoids', 'terpenes', 'glycosides'];
  const activeCompoundQueries = [
    `${scientificName} active compounds phytochemistry`,
    `${scientificName} phytochemistry`,
    `${scientificName} active compounds`,
    `${scientificName} constituents`,
    ...compoundFamilies.map((family) => `${scientificName} ${family}`),
    `${combinedName} active compounds`,
    `${combinedName} phytochemical analysis`,
    `${primaryName} phytochemical isolation review`,
    `${primaryName} constituent analysis review`,
  ];
  const fieldQueries = {
    activeCompounds: `${primaryName} ${compoundHints.join(' ')} ${phytochemTopics.join(' ')} isolation review constituent analysis`,
    effects: `${primaryName} pharmacology pharmacological effects`,
    mechanism: `${primaryName} pharmacology mechanism receptor pathway`,
    contraindications: `${primaryName} contraindications adverse effects interaction toxicity`,
    traditionalUse: `${primaryName} traditional use ethnobotanical`,
  };

  const focused = targetField.schemaField === 'activeCompounds'
    ? [...activeCompoundQueries, fieldQueries[targetField.schemaField]]
    : [fieldQueries[targetField.schemaField] ?? `${primaryName} ${targetField.requestField}`];
  const aliasQueries = aliases.slice(1, 4).map((alias) => `${alias} ${targetField.requestField}`);
  const broadFallback = [
    `${primaryName} medicinal plant review`,
    `${primaryName} ${targetField.schemaField}`,
    `${primaryName}`,
  ];

  return {
    aliases,
    structuredTerms: [...new Set([
      scientificName,
      displayName,
      scientificName.split(/\s+/u).slice(0, 2).join(' '),
      scientificName.split(/\s+/u)[0],
      displayName.split(/\s+/u).slice(0, 2).join(' '),
      ...aliases.slice(0, 3),
    ].map((value) => compactTerm(value)).filter((value) => value.length >= 3))],
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
    sourcesFoundByTier: { tier1: 0, tier2: 0, tier3: 0 },
    highQualitySources: 0,
    acceptedByTier: { tier1: 0, tier2: 0, tier3: 0 },
    acceptedSource: null,
  };

  for (const item of plan.queries) {
    const queryStats = {
      query: item.query,
      stage: item.stage,
      providersUsed: [],
      providerResults: [],
      sourcesFound: 0,
      highQualitySources: 0,
      acceptedCompoundsProduced: 0,
      accepted: false,
      candidateCountByTier: { tier1: 0, tier2: 0, tier3: 0 },
      attemptedTiers: [],
    };
    const candidates = [];
    const providerPlans = [
      {
        name: 'pubmed',
        fetch: () => {
          const ids = pubmedSearch(item.query, 8);
          const summaries = pubmedSummaries(ids);
          return summaries.map((summary) => ({
            provider: 'pubmed',
            title: summary.title,
            sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${summary.uid || summary.id}/`,
            pubmedId: String(summary.uid || summary.id),
            getAbstract: () => pubmedAbstract(summary.uid || summary.id),
          }));
        },
      },
      {
        name: 'europe_pmc',
        fetch: () => {
          const europeRows = europePmcSearch(item.query, 8);
          return europeRows.map((row) => {
            const id = row.pmid || row.id;
            const sourceUrl =
              row?.fullTextUrlList?.fullTextUrl?.[0]?.url
              || (row.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${row.pmid}/` : null)
              || (row.doi ? `https://doi.org/${row.doi}` : null)
              || `https://europepmc.org/article/${row.source || 'MED'}/${id}`;
            return {
              provider: 'europe_pmc',
              title: row.title,
              sourceUrl,
              pubmedId: row.pmid ? String(row.pmid) : null,
              getAbstract: () => String(row.abstractText || ''),
            };
          });
        },
      },
      {
        name: 'nih_ncbi_pmc',
        fetch: () => {
          const ids = pmcSearch(item.query, 8);
          const summaries = pmcSummaries(ids);
          return summaries.map((summary) => ({
            provider: 'nih_ncbi_pmc',
            title: summary.title,
            sourceUrl: `https://www.ncbi.nlm.nih.gov/pmc/articles/${summary.articleids?.find((item) => item.idtype === 'pmcid')?.value || summary.uid || summary.id}/`,
            pubmedId: summary.articleids?.find((entry) => entry.idtype === 'pmid')?.value || null,
            getAbstract: () => pmcAbstract(summary.uid || summary.id),
          }));
        },
      },
    ];
    if (targetField.schemaField === 'activeCompounds') {
      providerPlans.push(
        {
          name: 'pubchem_structured',
          fetch: () => {
            const term = plan.structuredTerms[0] || item.query;
            const suggestions = pubchemAutocomplete(term, 8);
            return suggestions.map((name) => ({
              provider: 'pubchem_structured',
              title: `${name} - PubChem compound entry`,
              sourceUrl: `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(name)}`,
              pubmedId: null,
              structuredCompounds: [name],
              getAbstract: () => `PubChem structured compound listing includes ${name}`,
            }));
          },
        },
        {
          name: 'chembl_structured',
          fetch: () => {
            const terms = plan.structuredTerms.slice(0, 4);
            const hintCompounds = (Array.isArray(herb.activeCompounds) ? herb.activeCompounds : [])
              .map((value) => compactTerm(value))
              .filter(Boolean)
              .slice(0, 8);
            const molecules = [];
            for (const term of terms) molecules.push(...chemblMoleculeSearch(term, 4));
            const dedupById = new Map();
            for (const entry of molecules) {
              const id = normalizeWhitespace(entry?.molecule_chembl_id ?? '');
              if (!id) continue;
              if (!dedupById.has(id)) dedupById.set(id, entry);
            }
            const ranked = [...dedupById.values()]
              .map((entry) => ({ entry, relevance: scoreChemblCandidate(entry, herb, hintCompounds) }))
              .filter(({ relevance }) => relevance.score >= 0.3 && (relevance.linkedToHerb || relevance.hintOverlap || !looksGenericCompoundLabel(relevance.prefName || relevance.chemblId)))
              .sort((a, b) => b.relevance.score - a.relevance.score)
              .slice(0, 8);
            return ranked.map(({ relevance }) => {
              const name = relevance.prefName || relevance.chemblId;
              return {
                provider: 'chembl_structured',
                title: `${name} - ChEMBL molecule`,
                sourceUrl: `https://chembl.ebi.ac.uk/chembl/api/data/molecule/${relevance.chemblId}`,
                pubmedId: null,
                structuredCompounds: relevance.names.length > 0 ? relevance.names : [name],
                getAbstract: () => `ChEMBL structured compound fields include ${relevance.names.join('; ') || name}`,
              };
            });
          },
        },
        {
          name: 'kegg_structured',
          fetch: () => {
            const terms = plan.structuredTerms.slice(0, 3);
            const compounds = [];
            for (const term of terms) compounds.push(...keggCompoundSearch(term, 4));
            const dedup = [];
            const seen = new Set();
            for (const entry of compounds) {
              const key = `${entry.id}:${entry.names}`.toLowerCase();
              if (seen.has(key)) continue;
              seen.add(key);
              dedup.push(entry);
            }
            return dedup.slice(0, 8).map((entry) => ({
              provider: 'kegg_structured',
              title: `${entry.id} - KEGG compound`,
              sourceUrl: `https://www.kegg.jp/entry/${entry.id.replace(/^cpd:/u, '')}`,
              pubmedId: null,
              structuredCompounds: String(entry.names)
                .split(/\s*;\s*/u)
                .map((value) => normalizeWhitespace(value))
                .filter(Boolean)
                .slice(0, 3),
              getAbstract: () => `KEGG structured compound listing includes ${entry.names}`,
            }));
          },
        },
      );
    }

    for (const provider of providerPlans) {
      let providerCandidates = [];
      try {
        providerCandidates = provider.fetch();
      } catch {
        providerCandidates = [];
      }
      queryStats.providersUsed.push(provider.name);
      queryStats.providerResults.push({ provider: provider.name, resultsFound: providerCandidates.length });
      candidates.push(...providerCandidates);
    }

    queryStats.sourcesFound = candidates.length;
    stats.sourcesFound += candidates.length;
    const tieredCandidates = { tier1: [], tier2: [], tier3: [] };
    for (const candidate of candidates) {
      const sourceTier = classifySourceTier(candidate.sourceUrl);
      candidate.sourceTier = sourceTier;
      tieredCandidates[sourceTier].push(candidate);
      queryStats.candidateCountByTier[sourceTier] += 1;
      stats.sourcesFoundByTier[sourceTier] += 1;
    }

    const tiersToTry = tieredCandidates.tier1.length > 0
      ? ['tier1']
      : (tieredCandidates.tier2.length > 0 ? ['tier2'] : ['tier3']);
    const corroboratedCompounds = new Set();

    for (const tier of tiersToTry) {
      const tierCandidates = [...tieredCandidates[tier]];
      if (tierCandidates.length === 0) continue;
      queryStats.attemptedTiers.push(tier);
      if (targetField.schemaField === 'activeCompounds' && tier === 'tier1') {
        tierCandidates.sort((a, b) => Number(isStructuredTier1Host(a.sourceUrl)) - Number(isStructuredTier1Host(b.sourceUrl)));
      }
      for (const candidate of tierCandidates) {
        const hasStructuredCompounds = targetField.schemaField === 'activeCompounds' && Array.isArray(candidate.structuredCompounds) && candidate.structuredCompounds.length > 0;
        if (!hasStructuredCompounds && !titleMatchesHerb(candidate.title, herb)) {
          recordProviderRejection(queryStats, candidate.provider, 'title_not_linked_to_herb');
          continue;
        }
        const quality = domainQuality(candidate.sourceUrl);
        const qualityThreshold = tier === 'tier1' ? 0.7 : (tier === 'tier2' ? 0.5 : 0.4);
        if (quality.score < qualityThreshold) {
          recordProviderRejection(queryStats, candidate.provider, 'below_quality_threshold');
          continue;
        }
        queryStats.highQualitySources += 1;
        stats.highQualitySources += 1;
        let evidence = '';
        let extracted = { phrases: [], debug: { pass: 'none', considered: 0, rejected: [] } };
        if (hasStructuredCompounds) {
          const structuredText = candidate.structuredCompounds.join('; ');
          evidence = `Structured compound fields: ${structuredText}`;
          extracted = {
            phrases: candidate.structuredCompounds.map((value) => `contains ${value}`),
            debug: { pass: 'structured_fields', considered: candidate.structuredCompounds.length, rejected: [] },
          };
        } else {
          const abstractText = candidate.getAbstract();
          if (!abstractText) continue;
          extracted = extractEvidenceFromAbstract(abstractText, targetField.schemaField, candidate.title);
          if (extracted.phrases.length === 0) {
            recordProviderRejection(queryStats, candidate.provider, 'no_atomic_field_mapped_phrases');
            queryStats.lastFailure = {
              stage: 'extract',
              reason: 'no_atomic_field_mapped_phrases',
              rawText: normalizeWhitespace(abstractText).slice(0, 400),
              extractionDebug: extracted.debug,
            };
            continue;
          }
          evidence = extracted.phrases.join(' ');
        }
        const normalization = normalizeFieldValue(targetField.schemaField, evidence, herb);
        if (!normalization.ok) {
          recordProviderRejection(queryStats, candidate.provider, normalization.reason || 'normalization_failed');
          queryStats.lastFailure = {
            stage: 'normalize',
            reason: normalization.reason,
            rawText: evidence,
          };
          continue;
        }
        if (
          hasStructuredCompounds
          && targetField.schemaField === 'activeCompounds'
          && (tier === 'tier1' || tier === 'tier2')
        ) {
          const values = Array.isArray(normalization.after) ? normalization.after : [];
          const corroborated = values.filter((value) => corroboratedCompounds.has(String(value).toLowerCase()));
          const herbLinked = values.filter((value) => structuredCompoundLinksToHerb([value], herb));
          const allowed = [...new Set([...corroborated, ...herbLinked])];
          if (allowed.length === 0) {
            recordProviderRejection(queryStats, candidate.provider, 'structured_active_compounds_not_corroborated');
            queryStats.lastFailure = {
              stage: 'tier-policy',
              reason: 'structured_active_compounds_not_corroborated',
              rawText: evidence,
            };
            continue;
          }
          normalization.after = allowed;
        }

        if (
          targetField.schemaField === 'activeCompounds'
          && Array.isArray(normalization.after)
          && (tier === 'tier1' || tier === 'tier2')
        ) {
          normalization.after.forEach((compound) => corroboratedCompounds.add(String(compound).toLowerCase()));
        }

        if (targetField.schemaField === 'activeCompounds' && tier === 'tier3') {
          const values = Array.isArray(normalization.after) ? normalization.after : [];
          const corroborated = values.filter((value) => corroboratedCompounds.has(String(value).toLowerCase()));
          if (corroborated.length === 0) {
            recordProviderRejection(queryStats, candidate.provider, 'tier3_active_compounds_not_corroborated');
            queryStats.lastFailure = {
              stage: 'tier-policy',
              reason: 'tier3_active_compounds_not_corroborated',
              rawText: evidence,
            };
            continue;
          }
          normalization.after = corroborated;
        }

        const confidence = confidenceFromSource({ qualityScore: quality.score, evidenceText: evidence, schemaField: targetField.schemaField });
        const row = {
          herb: herbKey(herb),
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
            tier,
          },
          evidence,
          extractionDebug: extracted.debug,
          confidence,
          evidenceClass: confidence === 'high' ? 'human-clinical' : confidence === 'medium' ? 'preclinical-mechanistic' : 'traditional-use',
          retrieval: stats,
        };
        queryStats.accepted = true;
        queryStats.providerAccepted = queryStats.providerAccepted ?? {};
        queryStats.providerAccepted[candidate.provider] = (queryStats.providerAccepted[candidate.provider] ?? 0) + 1;
        queryStats.acceptedCompoundsProduced = targetField.schemaField === 'activeCompounds' && Array.isArray(normalization.after)
          ? normalization.after.length
          : 0;
        stats.acceptedByTier[tier] += 1;
        stats.acceptedSource = { query: item.query, provider: candidate.provider, url: candidate.sourceUrl };
        stats.queryAttempts.push(queryStats);
        return { row, retrieval: stats };
      }
    }
    stats.queryAttempts.push(queryStats);
  }

  return { row: null, retrieval: stats };
}

function buildPatch(runId, herb, acceptedRows) {
  const entityId = herbKey(herb);
  if (!entityId) return null;
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
        entity_id: entityId,
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
        entity_id: entityId,
        field: '/mechanism',
        value: Array.isArray(row.value) ? row.value.join(' ') : row.value,
      });
    }

    const claimId = generatePrefixedUlid('clm');
    operations.push({
      op: 'append',
      task: 'herb_mechanism',
      entity_type: 'herb',
      entity_id: entityId,
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
    entity_id: entityId,
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
    entity_id: entityId,
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
    ? herbs.filter((h) => options.herbs.includes(herbKey(h)) || options.herbs.includes(h.id) || options.herbs.includes(h.name))
    : herbs.filter((h) => TARGET_FIELDS.some((f) => isMissingField(h[f.schemaField]))).slice(0, options.maxHerbs));

  const runId = deterministicRunId({ phase: 'evidence-acquisition', herbs: selected.map((h) => herbKey(h)) });
  const records = [];
  const accepted = [];
  const rejected = [];
  const patches = [];

  for (const herb of selected.slice(0, options.maxHerbs)) {
    const currentHerbKey = herbKey(herb);
    if (!currentHerbKey) continue;
    const missingTargets = TARGET_FIELDS.filter((field) => isMissingField(herb[field.schemaField]))
      .filter((field) => !options.focusField || field.schemaField === options.focusField || field.requestField === options.focusField);
    const herbRows = [];
    for (const targetField of missingTargets) {
      try {
        const result = await collectFieldEvidence(herb, targetField);
        const row = result?.row ?? null;
        const retrieval = result?.retrieval ?? null;
        if (!row) {
          const lastFailure = retrieval?.queryAttempts?.find((item) => item.lastFailure)?.lastFailure ?? null;
          const rejectionReason = lastFailure?.reason === 'tier3_active_compounds_not_corroborated'
            ? 'tier-policy-rejection-tier3-active-compounds-not-corroborated'
            : 'no-high-quality-source-evidence-found-or-clean-normalization-failed';
          rejected.push({
            herb: currentHerbKey,
            field: targetField.requestField,
            schemaField: targetField.schemaField,
            confidence: 'low',
            reason: rejectionReason,
            rawExtractedText: lastFailure?.rawText ?? '',
            failureDetail: lastFailure,
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
          herb: currentHerbKey,
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
    selectedHerbs: selected.slice(0, options.maxHerbs).map((h) => herbKey(h)).filter(Boolean),
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
      providerMetrics: (() => {
        const metrics = {};
        const allRows = [...accepted, ...rejected];
        for (const row of allRows) {
          for (const attempt of row?.retrieval?.queryAttempts ?? []) {
            for (const provider of attempt.providersUsed ?? []) {
              metrics[provider] = metrics[provider] ?? { queried: 0, candidates: 0, accepted: 0, acceptanceRate: 0 };
              metrics[provider].queried += 1;
            }
            for (const providerResult of attempt.providerResults ?? []) {
              metrics[providerResult.provider] = metrics[providerResult.provider] ?? { queried: 0, candidates: 0, accepted: 0, acceptanceRate: 0 };
              metrics[providerResult.provider].candidates += providerResult.resultsFound ?? 0;
            }
          }
        }
        for (const row of accepted) {
          const provider = row?.source?.provider;
          if (!provider) continue;
          metrics[provider] = metrics[provider] ?? { queried: 0, candidates: 0, accepted: 0, acceptanceRate: 0 };
          metrics[provider].accepted += 1;
        }
        for (const metric of Object.values(metrics)) {
          metric.acceptanceRate = metric.candidates > 0
            ? Number(((metric.accepted / metric.candidates) * 100).toFixed(2))
            : 0;
        }
        return Object.fromEntries(Object.entries(metrics).sort((a, b) => b[1].accepted - a[1].accepted || a[0].localeCompare(b[0])));
      })(),
      chemblTelemetry: (() => {
        const provider = 'chembl_structured';
        const allRows = [...accepted, ...rejected];
        const rejections = {};
        for (const row of allRows) {
          for (const attempt of row?.retrieval?.queryAttempts ?? []) {
            const providerRejections = attempt?.providerRejections?.[provider] ?? {};
            for (const [reason, count] of Object.entries(providerRejections)) {
              rejections[reason] = (rejections[reason] ?? 0) + (count ?? 0);
            }
          }
        }
        const queried = allRows.reduce((sum, row) => sum + (row?.retrieval?.queryAttempts ?? []).filter((attempt) => (attempt?.providersUsed ?? []).includes(provider)).length, 0);
        const candidates = allRows.reduce((sum, row) => sum + (row?.retrieval?.queryAttempts ?? []).reduce((inner, attempt) => inner + ((attempt?.providerResults ?? []).find((item) => item.provider === provider)?.resultsFound ?? 0), 0), 0);
        const acceptedCount = accepted.filter((row) => row?.source?.provider === provider).length;
        return {
          queried,
          candidates,
          accepted: acceptedCount,
          acceptanceRate: candidates > 0 ? Number(((acceptedCount / candidates) * 100).toFixed(2)) : 0,
          topRejectionReasons: Object.entries(rejections)
            .map(([reason, count]) => ({ reason, count }))
            .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason))
            .slice(0, 8),
        };
      })(),
      acceptedTierCounts: accepted.reduce((acc, row) => {
        const tier = row?.source?.tier ?? 'unclassified';
        acc[tier] = (acc[tier] ?? 0) + 1;
        return acc;
      }, {}),
      perHerb: Object.fromEntries(
        selected.slice(0, options.maxHerbs).map((herb) => {
          const currentHerbKey = herbKey(herb);
          const herbRows = [...accepted, ...rejected].filter((row) => row.herb === currentHerbKey);
          const queryAttempts = herbRows.reduce((sum, row) => sum + (row.retrieval?.queryAttempts?.length ?? 0), 0);
          const sourcesFound = herbRows.reduce((sum, row) => sum + (row.retrieval?.sourcesFound ?? 0), 0);
          const highQualitySources = herbRows.reduce((sum, row) => sum + (row.retrieval?.highQualitySources ?? 0), 0);
          const successfulQueries = herbRows
            .flatMap((row) => row.retrieval?.queryAttempts ?? [])
            .filter((item) => item.accepted)
            .map((item) => item.query);
          return [currentHerbKey, {
            queryAttempts,
            sourcesFound,
            highQualitySources,
            sourcesFoundByTier: herbRows.reduce((acc, row) => {
              const tiers = row.retrieval?.sourcesFoundByTier ?? {};
              acc.tier1 += tiers.tier1 ?? 0;
              acc.tier2 += tiers.tier2 ?? 0;
              acc.tier3 += tiers.tier3 ?? 0;
              return acc;
            }, { tier1: 0, tier2: 0, tier3: 0 }),
            successfulQueries: [...new Set(successfulQueries)],
          }];
        }),
      ),
      acceptedSourceContributions: accepted.reduce((acc, row) => {
        const host = sourceHost(row?.source?.url ?? '');
        acc[host] = (acc[host] ?? 0) + 1;
        return acc;
      }, {}),
    },
  };

  const outDir = join(REPO_ROOT, options.outDir);
  ensureDir(outDir);
  writeJson(join(outDir, `${runId}.json`), report);

  const patchOutDir = join(outDir, 'patches');
  ensureDir(patchOutDir);
  patches.forEach((patch) => writeJson(join(patchOutDir, `${patch.patch_id}.json`), patch));

  console.log(`[evidence-acquisition] run=${runId} herbs=${report.selectedHerbs.length} extracted=${records.length} accepted=${accepted.length} rejected=${rejected.length} patches=${patches.length}`);
  console.log(`[evidence-acquisition] accepted-tier-counts=${JSON.stringify(report.retrievalSummary.acceptedTierCounts)}`);
  console.log(`[evidence-acquisition] provider-metrics=${JSON.stringify(report.retrievalSummary.providerMetrics)}`);
  console.log(`[evidence-acquisition] report=${options.outDir}/${runId}.json`);
}

main().catch((error) => {
  console.error(`[evidence-acquisition] FAIL ${error.message}`);
  process.exit(1);
});
