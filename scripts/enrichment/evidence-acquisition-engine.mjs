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
const MECHANISM_ACTION_RE = /\b(agonis(?:t|m)|antagonis(?:t|m)|inhibit(?:or|ion|s|ed)?|activat(?:e|ion|es|ed)|modulat(?:e|ion|es|ed)|reuptake|bind(?:ing|s)?|block(?:s|ed|ade)?|suppress(?:es|ed|ion)?|upregulat(?:e|es|ed|ion)|downregulat(?:e|es|ed|ion))\b/iu;
const MECHANISM_VAGUE_RE = /\b(calming effect|sedative effect|beneficial effect|therapeutic effect|improves?\s+health|supports?\s+wellness|traditional use)\b/iu;
const MECHANISM_TARGET_RE = /\b(receptor|enzyme|transporter|uptake|nf-?κ?b|mao|gaba[-\s]*a|dopamine|serotonin|noradrenaline|norepinephrine|pi3k|akt|creb|mapk|tnf-?α?|cox-?2|acetylcholinesterase|butyrylcholinesterase|5-?ht1a|ace|p-?glycoprotein|cyp1a2)\b/iu;
const WEAK_MECHANISM_FRAGMENT_RE = /\b(other indirect mechanisms?|indirect mechanisms?|various mechanisms?|active biomolecules|strong inhibition on binding to [a-z]\b)\b/iu;
const WEAK_MECHANISM_QUALIFIER_RE = /\b(weak|slight|limited|uncertain|putative|possible|potential)\b/iu;
const MECHANISM_CONNECTOR_PREFIX_RE = /^(whereas|thus|therefore|however|moreover|furthermore|in addition|additionally|meanwhile|notably|overall|this suggests?|these suggest|suggesting that)\b[:,]?\s*/iu;
const SENTENCE_RESIDUE_RE = /\.\.\.|<\/?[a-z][^>]*>|&[a-z]+;|\b(in addition|however|whereas)\b\s*$/iu;
const NARRATIVE_RE = /\b(was|were|showed|shows|suggests?|demonstrated|reported|caused|resulted|concomitant)\b/iu;
const GENERIC_TARGET_RE = /^(selective|multiple|various|different|highest|lowest|dose-dependent|pathway|receptor|enzyme|transporter)$/iu;
const TARGET_RESIDUE_RE = /\b(contain|contains|containing|domain|domains|protein|cell|cells|showing|showed|stimulates?|stimulated|properties|transcription)\b/iu;
const ALLOWED_MECHANISM_ACTION_RE = /\b(inhibit(?:ion|s|ed)?|activat(?:ion|es|ed)?|agonis(?:m|t)|antagonis(?:m|t)|block(?:ade|er|s|ed)?|induc(?:tion|es|ed)|suppress(?:ion|es|ed)?|modulat(?:ion|es|ed)?)\b/iu;
const EFFECT_NOT_MECHANISM_RE = /\b(anti-inflammatory|antioxidant|effect|activity|apoptosis induction|cytokine suppression|immune modulation|oxidative stress reduction|inflammation inhibition)\b/iu;
const GENERIC_PROCESS_TARGET_RE = /\b(pathway|signaling|signalling|cascade|inflammation|inflammatory response|oxidative stress|apoptosis|proliferation|cytokine|immune response|nitric oxide|no production|antioxidant defense|cell viability|mitochondrial dysfunction|nf-?κ?b|mapk)\b/iu;
const NON_MOLECULAR_TARGET_RE = /\b(pathway|signaling|signalling|cascade|process|response|activity|effect|defense|stress|viability|dysfunction)\b/iu;
const EXPRESSION_REGULATION_RE = /\b(expression|mRNA|transcript|upregulat(?:e|ion|ed|es)|downregulat(?:e|ion|ed|es)|protein level|gene level)\b/iu;
const DOWNSTREAM_BIOMARKER_RE = /\b(biomarker|elevation|reduction|increase|decrease|levels?)\b/iu;
const MECHANISM_SEMANTIC_FIXTURES = loadJson(join(REPO_ROOT, 'scripts', 'enrichment', 'fixtures', 'mechanism-semantic.fixtures.json'));
const ACTION_TO_LABEL = [
  { re: /\b(inhibit(?:ion|es|ed|s)?)\b/iu, label: 'inhibition' },
  { re: /\b(activat(?:ion|es|ed)?)\b/iu, label: 'activation' },
  { re: /\b(agonis(?:m|t))\b/iu, label: 'agonism' },
  { re: /\b(antagonis(?:m|t))\b/iu, label: 'antagonism' },
  { re: /\b(block(?:ade|er|s|ed)?)\b/iu, label: 'blockade' },
  { re: /\b(induc(?:tion|es|ed)?)\b/iu, label: 'induction' },
  { re: /\b(suppress(?:ion|es|ed)?)\b/iu, label: 'suppression' },
  { re: /\b(modulat(?:ion|es|ed)?)\b/iu, label: 'modulation' },
];

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


function positiveIntFromEnv(name, fallback) {
  const raw = process.env[name];
  if (raw == null || String(raw).trim() === '') return fallback;
  const parsed = Number.parseInt(String(raw), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const CURL_CONNECT_TIMEOUT_SECONDS = positiveIntFromEnv('EVIDENCE_CURL_CONNECT_TIMEOUT_SECONDS', 8);
const CURL_MAX_TIME_SECONDS = positiveIntFromEnv('EVIDENCE_CURL_MAX_TIME_SECONDS', 20);
const CURL_PROCESS_TIMEOUT_MS = positiveIntFromEnv('EVIDENCE_CURL_PROCESS_TIMEOUT_MS', 25_000);
const CURL_RETRY_MAX_RETRIES = 2;
const CURL_RETRY_BASE_BACKOFF_MS = 250;
const RETRY_VALIDATION_MODE = process.env.EVIDENCE_RETRY_VALIDATION_MODE === '1';
const RETRY_VALIDATION_MAX_INJECTIONS = positiveIntFromEnv('EVIDENCE_RETRY_VALIDATION_MAX_INJECTIONS', 0);
const RETRY_VALIDATION_FAILURE_SEQUENCE = String(process.env.EVIDENCE_RETRY_VALIDATION_FAILURE_SEQUENCE || '429,503,timeout')
  .split(',')
  .map((part) => part.trim().toLowerCase())
  .filter(Boolean);

const providerRequestTelemetry = new Map();
const retryValidationInjectedRequestKeys = new Set();
let retryValidationInjectedCount = 0;

function sleepMs(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return;
  const shared = new SharedArrayBuffer(4);
  const view = new Int32Array(shared);
  Atomics.wait(view, 0, 0, ms);
}

function telemetryForProvider(provider) {
  const key = String(provider || 'unknown');
  if (!providerRequestTelemetry.has(key)) {
    providerRequestTelemetry.set(key, {
      requests_attempted: 0,
      requests_succeeded: 0,
      requests_failed: 0,
      requests_retried: 0,
      transient_failures_by_type: {},
      timeout_failures: 0,
      '429_count': 0,
      '503_count': 0,
    });
  }
  return providerRequestTelemetry.get(key);
}

function classifyCurlFailure(errorMessage) {
  const msg = String(errorMessage || '').toLowerCase();
  const statusMatch = msg.match(/error:\s*(\d{3})/);
  const status = statusMatch ? Number.parseInt(statusMatch[1], 10) : null;
  const retryableStatus = new Set([429, 500, 502, 503, 504]);
  const transientTransportPatterns = [
    /timed out/,
    /timeout/,
    /connection reset/,
    /could not connect/,
    /recv failure/,
    /empty reply from server/,
    /temporary failure/,
    /connection refused/,
    /operation too slow/,
  ];
  const isTransportTransient = transientTransportPatterns.some((pattern) => pattern.test(msg));
  const isTimeout = /timed out|timeout|operation timed out|max-time/.test(msg);
  const isTransient = (status != null && retryableStatus.has(status)) || isTransportTransient;
  const type = status != null ? `http_${status}` : (isTimeout ? 'timeout' : 'transport');
  return { status, isTransient, isTimeout, type };
}

function simulatedTransientFailureMessage(url) {
  if (!RETRY_VALIDATION_MODE || RETRY_VALIDATION_MAX_INJECTIONS <= 0) return null;
  if (RETRY_VALIDATION_FAILURE_SEQUENCE.length === 0) return null;
  if (retryValidationInjectedCount >= RETRY_VALIDATION_MAX_INJECTIONS) return null;
  const key = String(url);
  if (retryValidationInjectedRequestKeys.has(key)) return null;
  const failureType = RETRY_VALIDATION_FAILURE_SEQUENCE[retryValidationInjectedCount % RETRY_VALIDATION_FAILURE_SEQUENCE.length];
  retryValidationInjectedRequestKeys.add(key);
  retryValidationInjectedCount += 1;
  if (failureType === '429' || failureType === 'http_429') {
    return `curl failed for ${url} (curl: (22) The requested URL returned error: 429)`;
  }
  if (failureType === '503' || failureType === 'http_503') {
    return `curl failed for ${url} (curl: (22) The requested URL returned error: 503)`;
  }
  return `curl invocation failed for ${url}: operation timed out`;
}

function runCurl(url, provider = 'unknown') {
  const telemetry = telemetryForProvider(provider);
  for (let attempt = 0; attempt <= CURL_RETRY_MAX_RETRIES; attempt += 1) {
    telemetry.requests_attempted += 1;
    const injectedError = attempt === 0 ? simulatedTransientFailureMessage(url) : null;
    if (injectedError) {
      const failure = classifyCurlFailure(injectedError);
      if (failure.isTransient) {
        telemetry.transient_failures_by_type[failure.type] = (telemetry.transient_failures_by_type[failure.type] ?? 0) + 1;
      }
      if (failure.isTimeout) telemetry.timeout_failures += 1;
      if (failure.status === 429) telemetry['429_count'] += 1;
      if (failure.status === 503) telemetry['503_count'] += 1;
      if (attempt < CURL_RETRY_MAX_RETRIES) {
        telemetry.requests_retried += 1;
        const jitter = Math.floor(Math.random() * 100);
        const delay = (CURL_RETRY_BASE_BACKOFF_MS * (2 ** attempt)) + jitter;
        sleepMs(delay);
        continue;
      }
      telemetry.requests_failed += 1;
      throw new Error(injectedError);
    }
    const result = spawnSync(
      'curl',
      [
        '--silent',
        '--show-error',
        '--location',
        '--fail',
        '--connect-timeout',
        String(CURL_CONNECT_TIMEOUT_SECONDS),
        '--max-time',
        String(CURL_MAX_TIME_SECONDS),
        url,
      ],
      { encoding: 'utf8', timeout: CURL_PROCESS_TIMEOUT_MS, killSignal: 'SIGKILL' },
    );
    if (!result.error && result.status === 0) {
      telemetry.requests_succeeded += 1;
      return result.stdout;
    }
    const errorMessage = result.error
      ? `curl invocation failed for ${url}: ${result.error.message}`
      : (() => {
        const stderr = String(result.stderr ?? '').trim();
        return `curl failed for ${url}${stderr ? ` (${stderr})` : ''}`;
      })();
    const failure = classifyCurlFailure(errorMessage);
    if (failure.isTransient) {
      telemetry.transient_failures_by_type[failure.type] = (telemetry.transient_failures_by_type[failure.type] ?? 0) + 1;
    }
    if (failure.isTimeout) telemetry.timeout_failures += 1;
    if (failure.status === 429) telemetry['429_count'] += 1;
    if (failure.status === 503) telemetry['503_count'] += 1;
    if (failure.isTransient && attempt < CURL_RETRY_MAX_RETRIES) {
      telemetry.requests_retried += 1;
      const jitter = Math.floor(Math.random() * 100);
      const delay = (CURL_RETRY_BASE_BACKOFF_MS * (2 ** attempt)) + jitter;
      sleepMs(delay);
      continue;
    }
    telemetry.requests_failed += 1;
    throw new Error(errorMessage);
  }
  telemetry.requests_failed += 1;
  throw new Error(`curl failed for ${url}`);
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
  const json = JSON.parse(runCurl(url.toString(), 'pubmed'));
  return json?.esearchresult?.idlist ?? [];
}

function pmcSearch(term, retmax = 8) {
  const url = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi');
  url.searchParams.set('db', 'pmc');
  url.searchParams.set('retmode', 'json');
  url.searchParams.set('sort', 'relevance');
  url.searchParams.set('retmax', String(retmax));
  url.searchParams.set('term', term);
  const json = JSON.parse(runCurl(url.toString(), 'nih_ncbi_pmc'));
  return json?.esearchresult?.idlist ?? [];
}

function pmcSummaries(ids) {
  if (ids.length === 0) return [];
  const url = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi');
  url.searchParams.set('db', 'pmc');
  url.searchParams.set('retmode', 'json');
  url.searchParams.set('id', ids.join(','));
  const json = JSON.parse(runCurl(url.toString(), 'nih_ncbi_pmc'));
  return ids.map((id) => ({ id, ...(json?.result?.[id] ?? {}) })).filter((entry) => entry?.title);
}

function pubmedSummaries(ids) {
  if (ids.length === 0) return [];
  const url = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi');
  url.searchParams.set('db', 'pubmed');
  url.searchParams.set('retmode', 'json');
  url.searchParams.set('id', ids.join(','));
  const json = JSON.parse(runCurl(url.toString(), 'pubmed'));
  return ids.map((id) => ({ id, ...(json?.result?.[id] ?? {}) })).filter((entry) => entry?.title);
}

function pubmedAbstract(pmid) {
  const url = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi');
  url.searchParams.set('db', 'pubmed');
  url.searchParams.set('rettype', 'abstract');
  url.searchParams.set('retmode', 'text');
  url.searchParams.set('id', String(pmid));
  return runCurl(url.toString(), 'pubmed');
}

function pmcAbstract(pmcId) {
  const url = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi');
  url.searchParams.set('db', 'pmc');
  url.searchParams.set('rettype', 'abstract');
  url.searchParams.set('retmode', 'text');
  url.searchParams.set('id', String(pmcId));
  return runCurl(url.toString(), 'nih_ncbi_pmc');
}

function pubchemAutocomplete(term, limit = 6) {
  const url = new URL(`https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(term)}/JSON`);
  url.searchParams.set('limit', String(limit));
  const json = JSON.parse(runCurl(url.toString(), 'pubchem_structured'));
  return json?.dictionary_terms?.compound ?? [];
}

function chemblMoleculeSearch(term, limit = 6) {
  const url = new URL('https://www.ebi.ac.uk/chembl/api/data/molecule/search.json');
  url.searchParams.set('q', term);
  url.searchParams.set('limit', String(limit));
  const json = JSON.parse(runCurl(url.toString(), 'chembl_structured'));
  return json?.molecules ?? [];
}

function keggCompoundSearch(term, limit = 8) {
  const response = runCurl(`https://rest.kegg.jp/find/compound/${encodeURIComponent(term)}`, 'kegg_structured');
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
  const json = JSON.parse(runCurl(url.toString(), 'europe_pmc'));
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

function normalizeMechanismTarget(rawTarget) {
  return normalizeWhitespace(rawTarget)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\b(the|a|an|its|their|this|that)\b/giu, ' ')
    .replace(/\bacts?\s+as\b/giu, ' ')
    .replace(/^(to|of)\s+/iu, '')
    .replace(/\b(in mammals?|in humans?|in vitro|in vivo|in dose-dependent manner|dose-dependent manner|by itself|showing highest|showing|associated with|is associated with)\b/giu, ' ')
    .replace(/\b(on|in|at|by|for|from|with|into|to)\s+$/iu, '')
    .replace(/[.;,:-]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasSpecificMechanismTarget(target) {
  const normalized = normalizeWhitespace(target).toLowerCase();
  if (!normalized) return false;
  const words = normalized.split(/\s+/u).filter(Boolean);
  if (words.length === 0 || words.length > 6) return false;
  if (GENERIC_TARGET_RE.test(normalized)) return false;
  if (TARGET_RESIDUE_RE.test(normalized)) return false;
  if (GENERIC_PROCESS_TARGET_RE.test(normalized)) return false;
  if (!MECHANISM_TARGET_RE.test(normalized)) return false;
  if (words.length <= 2 && /(pathway|receptor|enzyme|transporter)$/iu.test(normalized) && !/(nf-?κ?b|gaba|serotonin|dopamine|mao|pi3k|akt|creb|mapk|tnf|5-?ht1a|cox-?2|acetylcholinesterase|butyrylcholinesterase|ace|p-?glycoprotein|cyp1a2)/iu.test(normalized)) {
    return false;
  }
  return true;
}

function cleanMechanismSegment(rawSegment) {
  let text = normalizeWhitespace(rawSegment)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&amp;|&quot;|&lt;|&gt;/g, ' ')
    .replace(/^[“"'`]+|[”"'`]+$/g, '')
    .trim();
  while (MECHANISM_CONNECTOR_PREFIX_RE.test(text)) text = text.replace(MECHANISM_CONNECTOR_PREFIX_RE, '').trim();
  return text.replace(/^[,;:. -]+|[,;:. -]+$/g, '').trim();
}

function canonicalizeMechanismPhrase(rawSegment) {
  const segment = cleanMechanismSegment(rawSegment);
  const lower = segment.toLowerCase();
  if (!segment) return { ok: false, reason: 'sentence_residue_detected' };
  if (SENTENCE_RESIDUE_RE.test(segment)) return { ok: false, reason: 'sentence_residue_detected' };
  if (EXPRESSION_REGULATION_RE.test(lower)) return { ok: false, reason: 'expression_regulation_not_direct_mechanism' };
  if (DOWNSTREAM_BIOMARKER_RE.test(lower) && !ALLOWED_MECHANISM_ACTION_RE.test(lower)) return { ok: false, reason: 'downstream_biomarker_change' };
  if (EFFECT_NOT_MECHANISM_RE.test(lower)) return { ok: false, reason: 'effect_not_mechanism' };
  if (segment.includes('.') || segment.includes('!') || segment.includes('?')) return { ok: false, reason: 'mechanism_fragment_too_narrative' };
  if (segment.length < 12 || segment.length > 90) return { ok: false, reason: 'mechanism_fragment_too_narrative' };
  if (MECHANISM_VAGUE_RE.test(lower) || WEAK_MECHANISM_FRAGMENT_RE.test(lower) || WEAK_MECHANISM_QUALIFIER_RE.test(lower) || isVaguePhrase(segment)) {
    return { ok: false, reason: 'mechanism_fragment_too_narrative' };
  }

  const patterns = [
    { re: /\b(reuptake)\s+inhibition\s+of\s+(.+)/iu, toPhrase: (m) => `${normalizeMechanismTarget(m[2])} reuptake inhibition` },
    { re: /\b(inhibition|activation|modulation|agonism|antagonism)\s+of\s+(.+)/iu, toPhrase: (m) => `${normalizeMechanismTarget(m[2])} ${m[1].toLowerCase()}` },
    { re: /\b(inhibits?|inhibited)\s+(.+)/iu, toPhrase: (m) => `${normalizeMechanismTarget(m[2])} inhibition` },
    { re: /\b(suppresses?|suppressed)\s+(.+)/iu, toPhrase: (m) => `${normalizeMechanismTarget(m[2])} suppression` },
    { re: /\b(blocking|blocks?|blocked)\s+(.+)/iu, toPhrase: (m) => `${normalizeMechanismTarget(m[2])} blockade` },
    { re: /\b(induces?|induced)\s+(.+)/iu, toPhrase: (m) => `${normalizeMechanismTarget(m[2])} induction` },
    { re: /\b(activates?|activated|upregulates?|upregulated)\s+(.+)/iu, toPhrase: (m) => `${normalizeMechanismTarget(m[2])} activation` },
    { re: /\b(modulates?|modulated|downregulates?|downregulated)\s+(.+)/iu, toPhrase: (m) => `${normalizeMechanismTarget(m[2])} modulation` },
    { re: /\b(agonist|agonism)\s+(?:of\s+)?(.+)/iu, toPhrase: (m) => `${normalizeMechanismTarget(m[2])} agonism` },
    { re: /\b(antagonist|antagonism)\s+(?:of\s+)?(.+)/iu, toPhrase: (m) => `${normalizeMechanismTarget(m[2])} antagonism` },
    { re: /\b(.+?)\s+agonist\b/iu, toPhrase: (m) => `${normalizeMechanismTarget(m[1])} agonism` },
    { re: /\b(.+?)\s+antagonist\b/iu, toPhrase: (m) => `${normalizeMechanismTarget(m[1])} antagonism` },
    { re: /\b(binding|binds?)\s+to\s+(.+)/iu, toPhrase: (m) => `${normalizeMechanismTarget(m[2])} binding` },
    { re: /\b([a-z0-9-κ\s]+?)\s+(inhibition|activation|modulation|agonism|antagonism|binding)\b/iu, toPhrase: (m) => `${normalizeMechanismTarget(m[1])} ${m[2].toLowerCase()}` },
  ];

  let phrase = '';
  for (const pattern of patterns) {
    const match = segment.match(pattern.re);
    if (!match) continue;
    phrase = normalizeWhitespace(pattern.toPhrase(match));
    break;
  }
  if (!phrase) {
    if (!ALLOWED_MECHANISM_ACTION_RE.test(segment) && MECHANISM_TARGET_RE.test(segment)) return { ok: false, reason: 'synthesized_action_not_in_source' };
    if (!ALLOWED_MECHANISM_ACTION_RE.test(segment)) return { ok: false, reason: 'missing_clear_action' };
    if (!MECHANISM_TARGET_RE.test(segment)) return { ok: false, reason: 'missing_clear_target' };
    return { ok: false, reason: 'same_span_action_target_not_found' };
  }
  if (!ALLOWED_MECHANISM_ACTION_RE.test(segment)) return { ok: false, reason: 'synthesized_action_not_in_source' };
  if (!ALLOWED_MECHANISM_ACTION_RE.test(phrase)) return { ok: false, reason: 'missing_clear_action' };
  const phraseMatch = phrase.match(/^(.+?)\s+(reuptake inhibition|inhibition|activation|modulation|agonism|antagonism|binding)$/iu);
  if (!phraseMatch) return { ok: false, reason: 'mechanism_fragment_too_narrative' };
  const target = normalizeMechanismTarget(phraseMatch[1]);
  if (/\b(agonist properties|gene transcription|expression)\b/iu.test(target)) return { ok: false, reason: 'expression_regulation_not_direct_mechanism' };
  if (!hasSpecificMechanismTarget(target)) {
    if (!hasSpecificMechanismTarget(target) && MECHANISM_TARGET_RE.test(segment) && !MECHANISM_TARGET_RE.test(target)) {
      return { ok: false, reason: 'action_bound_to_wrong_object' };
    }
    if (GENERIC_PROCESS_TARGET_RE.test(target)) return { ok: false, reason: 'generic_pathway_or_process' };
    if (NON_MOLECULAR_TARGET_RE.test(target)) return { ok: false, reason: 'target_not_molecular' };
    return { ok: false, reason: 'missing_clear_target' };
  }
  if (NARRATIVE_RE.test(phrase)) return { ok: false, reason: 'mechanism_fragment_too_narrative' };
  const action = phraseMatch[2].toLowerCase();
  const normalizedPhrase = `${target} ${action}`
    .replace(/\bnf-?κ?b\b/giu, 'NF-κB')
    .replace(/\bmao\b/giu, 'MAO')
    .replace(/\bgaba[-\s]*a\b/giu, 'GABA-A')
    .replace(/\btnf-?α?\b/giu, 'TNF-α')
    .replace(/\s+/g, ' ')
    .trim();
  if (GENERIC_PROCESS_TARGET_RE.test(normalizedPhrase)) return { ok: false, reason: 'generic_pathway_or_process' };
  return { ok: true, phrase: normalizedPhrase };
}

function actionLabelFromSource(segment) {
  for (const { re, label } of ACTION_TO_LABEL) {
    if (re.test(segment)) return label;
  }
  return null;
}

function recoverMechanismCandidatesFromMixedSpan(rawSegment) {
  const segment = cleanMechanismSegment(rawSegment);
  if (EXPRESSION_REGULATION_RE.test(segment)) return { phrases: [], reason: 'expression_regulation_not_direct_mechanism' };
  const actionVerbMatches = [...segment.matchAll(/\b(inhibits?|inhibited|suppresses?|suppressed|activates?|activated|modulates?|modulated|induces?|induced|blocks?|blocked)\b/giu)];
  if (actionVerbMatches.length === 0) return { phrases: [], reason: 'same_span_action_target_not_found' };
  const labels = [...new Set(actionVerbMatches.map((m) => actionLabelFromSource(m[0])).filter(Boolean))];
  if (labels.length !== 1) return { phrases: [], reason: 'clause_binding_ambiguous' };
  const actionLabel = labels[0];
  const actionVerbMatch = actionVerbMatches[0];
  const afterAction = normalizeWhitespace(segment.slice(actionVerbMatch.index + actionVerbMatch[0].length));
  if (!afterAction) return { phrases: [], reason: 'same_span_action_target_not_found' };
  const chunks = afterAction
    .split(/\s+and\s+|\s*,\s*/iu)
    .map((chunk) => normalizeWhitespace(chunk)
      .replace(/^(the\s+)?activity of\s+/iu, '')
      .replace(/^(enzyme|receptor|transporter)\s+/iu, '')
      .replace(/\b(functions?|activity)\b/giu, '')
      .trim())
    .filter(Boolean);
  const recovered = [];
  for (const match of segment.matchAll(/\bactivity of enzyme\s+([A-Za-z0-9-]+)/giu)) {
    const target = normalizeMechanismTarget(match[1]);
    if (!target || GENERIC_PROCESS_TARGET_RE.test(target)) continue;
    recovered.push(`${target} ${actionLabel}`);
  }
  for (const chunk of chunks) {
    const target = normalizeMechanismTarget(chunk);
    if (!hasSpecificMechanismTarget(target)) continue;
    if (GENERIC_PROCESS_TARGET_RE.test(target) || NON_MOLECULAR_TARGET_RE.test(target)) continue;
    recovered.push(`${target} ${actionLabel}`);
  }
  for (const match of segment.matchAll(/\b(CYP[0-9A-Z]+|P-glycoprotein|acetylcholinesterase|butyrylcholinesterase|5-HT1A receptor|ACE|COX-2)\b/giu)) {
    const target = normalizeMechanismTarget(match[1]);
    if (!hasSpecificMechanismTarget(target)) continue;
    recovered.push(`${target} ${actionLabel}`);
  }
  const phrases = [...new Set(recovered)].slice(0, 4);
  if (phrases.length === 0) return { phrases: [], reason: 'action_bound_to_wrong_object' };
  return { phrases, reason: null };
}

function assertMechanismSemanticFixtures() {
  for (const sample of MECHANISM_SEMANTIC_FIXTURES.pass) {
    const input = typeof sample === 'string' ? sample : sample.input;
    const expected = typeof sample === 'string' ? null : (Array.isArray(sample.expected) ? sample.expected : null);
    const extraction = extractMechanismAtomicPhrases(input);
    const output = extraction.phrases;
    if (expected) {
      const normalizedOut = [...output].sort();
      const normalizedExpected = [...expected].sort();
      if (JSON.stringify(normalizedOut) !== JSON.stringify(normalizedExpected)) {
        throw new Error(`mechanism semantic fixture failed pass-case: "${input}" -> ${JSON.stringify(normalizedOut)} expected ${JSON.stringify(normalizedExpected)}`);
      }
      continue;
    }
    const result = canonicalizeMechanismPhrase(input);
    if (!result.ok) throw new Error(`mechanism semantic fixture failed pass-case: "${input}" -> ${result.reason}`);
  }
  for (const sample of MECHANISM_SEMANTIC_FIXTURES.fail) {
    const input = typeof sample === 'string' ? sample : sample.input;
    const result = canonicalizeMechanismPhrase(input);
    if (result.ok) throw new Error(`mechanism semantic fixture failed fail-case: "${input}" -> accepted as "${result.phrase}"`);
  }
}

function extractMechanismAtomicPhrases(text) {
  const normalized = normalizeWhitespace(text);
  if (!normalized) return { phrases: [], rejectionReasons: ['sentence_residue_detected'], splitTelemetry: { attempted: 0, recovered: 0, rejected: 0, recoveredFromMixedSpan: 0 } };
  const segments = normalized
    .split(/\s*;\s*|\s*,\s*(?=(?:[^()]*\([^()]*\))*[^()]*$)|\s+but\s+|\s+however,\s+/iu)
    .map((segment) => cleanAtomicPhrase(segment))
    .filter(Boolean);
  const phrases = [];
  const rejectionReasons = [];
  const splitTelemetry = { attempted: 0, recovered: 0, rejected: 0, recoveredFromMixedSpan: 0 };
  for (const segment of segments) {
    if (/\band\b/iu.test(segment) && /\b(inhibits?|suppresses?|activates?|modulates?|induces?|blocks?|antagonist|agonist)\b/iu.test(segment)) {
      splitTelemetry.attempted += 1;
      const recovered = recoverMechanismCandidatesFromMixedSpan(segment);
      if (recovered.phrases.length > 0) {
        recovered.phrases.forEach((phrase) => phrases.push(phrase));
        splitTelemetry.recovered += recovered.phrases.length;
        splitTelemetry.recoveredFromMixedSpan += 1;
        continue;
      }
      if (recovered.reason) rejectionReasons.push(recovered.reason);
      splitTelemetry.rejected += 1;
    }
    const result = canonicalizeMechanismPhrase(segment);
    if (!result.ok) {
      splitTelemetry.attempted += 1;
      const recovered = recoverMechanismCandidatesFromMixedSpan(segment);
      if (recovered.phrases.length > 0) {
        recovered.phrases.forEach((phrase) => phrases.push(phrase));
        splitTelemetry.recovered += recovered.phrases.length;
        splitTelemetry.recoveredFromMixedSpan += 1;
      } else {
        rejectionReasons.push(recovered.reason || result.reason);
        splitTelemetry.rejected += 1;
      }
      continue;
    }
    phrases.push(result.phrase);
  }
  return { phrases: [...new Set(phrases)].slice(0, 4), rejectionReasons, splitTelemetry };
}

function extractEvidenceFromAbstract(abstractText, schemaField, title = '') {
  const terms = FIELD_TERMS[schemaField] ?? [];
  const cues = FIELD_CUES[schemaField] ?? [];
  const normalized = String(abstractText).replace(/\s+/g, ' ').trim();
  const sentences = sentenceSplit(normalized);
  const debug = { pass: 'none', considered: sentences.length, rejected: [], splitTelemetry: { attempted: 0, recovered: 0, rejected: 0, recoveredFromMixedSpan: 0 } };
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
    if (schemaField === 'mechanism' && !MECHANISM_ACTION_RE.test(cleaned)) {
      debug.rejected.push({ phrase: cleaned, reason: 'no_clear_pharmacological_action' });
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
      const mechanismExtraction = schemaField === 'mechanism'
        ? extractMechanismAtomicPhrases(part)
        : { phrases: [], rejectionReasons: [], splitTelemetry: { attempted: 0, recovered: 0, rejected: 0, recoveredFromMixedSpan: 0 } };
      const candidates = containsList.length > 0
        ? containsList
        : (schemaField === 'mechanism' ? mechanismExtraction.phrases : [cleanAtomicPhrase(part)]);
      for (const candidate of candidates) {
        if (candidate.length < 12 || candidate.length > 160) continue;
        if (isVaguePhrase(candidate)) continue;
        if (schemaField === 'mechanism' && !MECHANISM_ACTION_RE.test(candidate)) continue;
        relaxed.push(candidate);
      }
      if (schemaField === 'mechanism' && candidates.length === 0) {
        mechanismExtraction.rejectionReasons.forEach((reason) => debug.rejected.push({ phrase: part, reason }));
      }
      if (schemaField === 'mechanism') {
        debug.splitTelemetry.attempted += mechanismExtraction.splitTelemetry.attempted;
        debug.splitTelemetry.recovered += mechanismExtraction.splitTelemetry.recovered;
        debug.splitTelemetry.rejected += mechanismExtraction.splitTelemetry.rejected;
        debug.splitTelemetry.recoveredFromMixedSpan += mechanismExtraction.splitTelemetry.recoveredFromMixedSpan;
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
    if (schemaField === 'mechanism') {
      const mechanismExtraction = extractMechanismAtomicPhrases(before);
      if (mechanismExtraction.phrases.length === 0) {
        const reasonCounts = mechanismExtraction.rejectionReasons.reduce((acc, reason) => {
          acc[reason] = (acc[reason] ?? 0) + 1;
          return acc;
        }, {});
        const [topReason] = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);
        return { ok: false, before, after: null, reason: topReason?.[0] ?? 'no_clear_pharmacological_action' };
      }
      return { ok: true, before, after: mechanismExtraction.phrases.join('; ') };
    }
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
  const mechanismQueries = [
    `${scientificName} mechanism of action`,
    `${scientificName} pharmacology review`,
    `${scientificName} receptor activity`,
    `${scientificName} neurotransmitter effects`,
    `${scientificName} binding agonist antagonist`,
    `${combinedName} mechanism of action`,
    `${primaryName} pharmacological mechanism study`,
  ].map((query) => compactTerm(query)).filter(Boolean);
  const fieldQueries = {
    activeCompounds: `${primaryName} ${compoundHints.join(' ')} ${phytochemTopics.join(' ')} isolation review constituent analysis`,
    effects: `${primaryName} pharmacology pharmacological effects`,
    mechanism: `${primaryName} pharmacology mechanism receptor pathway`,
    contraindications: `${primaryName} contraindications adverse effects interaction toxicity`,
    traditionalUse: `${primaryName} traditional use ethnobotanical`,
  };

  const focused = targetField.schemaField === 'activeCompounds'
    ? [...activeCompoundQueries, fieldQueries[targetField.schemaField]]
    : targetField.schemaField === 'mechanism'
      ? [...mechanismQueries, fieldQueries[targetField.schemaField]]
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
    mechanismTelemetry: targetField.schemaField === 'mechanism'
      ? {
        candidatesFound: 0,
        acceptedMechanisms: 0,
        rejectionReasons: {},
        candidate_split_attempted: 0,
        candidate_split_recovered: 0,
        candidate_split_rejected: 0,
        recovered_from_mixed_span: 0,
      }
      : null,
  };
  const addMechanismRejectionReason = (reason) => {
    if (!stats.mechanismTelemetry) return;
    stats.mechanismTelemetry.rejectionReasons[reason] = (stats.mechanismTelemetry.rejectionReasons[reason] ?? 0) + 1;
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
    if (stats.mechanismTelemetry) stats.mechanismTelemetry.candidatesFound += candidates.length;
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
          if (targetField.schemaField === 'mechanism') addMechanismRejectionReason('title_not_linked_to_herb');
          continue;
        }
        const quality = domainQuality(candidate.sourceUrl);
        const qualityThreshold = tier === 'tier1' ? 0.7 : (tier === 'tier2' ? 0.5 : 0.4);
        if (quality.score < qualityThreshold) {
          recordProviderRejection(queryStats, candidate.provider, 'below_quality_threshold');
          if (targetField.schemaField === 'mechanism') addMechanismRejectionReason('below_quality_threshold');
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
          if (stats.mechanismTelemetry && extracted?.debug?.splitTelemetry) {
            stats.mechanismTelemetry.candidate_split_attempted += extracted.debug.splitTelemetry.attempted ?? 0;
            stats.mechanismTelemetry.candidate_split_recovered += extracted.debug.splitTelemetry.recovered ?? 0;
            stats.mechanismTelemetry.candidate_split_rejected += extracted.debug.splitTelemetry.rejected ?? 0;
            stats.mechanismTelemetry.recovered_from_mixed_span += extracted.debug.splitTelemetry.recoveredFromMixedSpan ?? 0;
          }
          if (extracted.phrases.length === 0) {
            recordProviderRejection(queryStats, candidate.provider, 'no_atomic_field_mapped_phrases');
            if (targetField.schemaField === 'mechanism') addMechanismRejectionReason('no_atomic_field_mapped_phrases');
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
          if (targetField.schemaField === 'mechanism') addMechanismRejectionReason(normalization.reason || 'normalization_failed');
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
        if (stats.mechanismTelemetry) stats.mechanismTelemetry.acceptedMechanisms += 1;
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
  assertMechanismSemanticFixtures();
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
      retryValidation: {
        enabled: RETRY_VALIDATION_MODE,
        maxInjections: RETRY_VALIDATION_MAX_INJECTIONS,
        appliedInjections: retryValidationInjectedCount,
      },
      providerRequestTelemetry: (() => {
        const output = {};
        for (const [provider, telemetry] of [...providerRequestTelemetry.entries()].sort(([a], [b]) => a.localeCompare(b))) {
          output[provider] = telemetry;
        }
        return output;
      })(),
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
      mechanismTelemetry: (() => {
        const telemetry = {
          candidatesFound: 0,
          acceptedMechanisms: 0,
          rejectionReasons: {},
          candidate_split_attempted: 0,
          candidate_split_recovered: 0,
          candidate_split_rejected: 0,
          recovered_from_mixed_span: 0,
        };
        const allRows = [...accepted, ...rejected];
        for (const row of allRows) {
          const perRow = row?.retrieval?.mechanismTelemetry;
          if (!perRow) continue;
          telemetry.candidatesFound += perRow.candidatesFound ?? 0;
          telemetry.acceptedMechanisms += perRow.acceptedMechanisms ?? 0;
          telemetry.candidate_split_attempted += perRow.candidate_split_attempted ?? 0;
          telemetry.candidate_split_recovered += perRow.candidate_split_recovered ?? 0;
          telemetry.candidate_split_rejected += perRow.candidate_split_rejected ?? 0;
          telemetry.recovered_from_mixed_span += perRow.recovered_from_mixed_span ?? 0;
          for (const [reason, count] of Object.entries(perRow.rejectionReasons ?? {})) {
            telemetry.rejectionReasons[reason] = (telemetry.rejectionReasons[reason] ?? 0) + (count ?? 0);
          }
        }
        telemetry.topRejectionReasons = Object.entries(telemetry.rejectionReasons)
          .map(([reason, count]) => ({ reason, count }))
          .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason))
          .slice(0, 8);
        return telemetry;
      })(),
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
