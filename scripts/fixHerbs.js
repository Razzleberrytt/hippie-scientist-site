const fs = require('fs');
const path = require('path');

const input = path.join(__dirname, '..', 'src', 'data', 'herbs.json');
const output = path.join(__dirname, '..', 'src', 'data', 'herbs.cleaned.json');
const logFile = path.join(__dirname, '..', 'src', 'data', 'herbs.errors.json');

const raw = JSON.parse(fs.readFileSync(input, 'utf8'));

function isString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function guessRegion(text) {
  const s = text.toLowerCase();
  if (/amazon|peru|brazil/.test(s)) return 'South America';
  if (/africa/.test(s)) return 'Africa';
  if (/india|china|asia/.test(s)) return 'Asia';
  if (/europe/.test(s)) return 'Europe';
  if (/north america|usa|canada/.test(s)) return 'North America';
  return null;
}

const cleaned = [];
const errors = [];

for (const herb of raw) {
  const h = { ...herb };
  const issues = [];

  // string fields
  const requiredStrings = [
    'name',
    'scientificName',
    'category',
    'description',
    'region',
    'legalStatus',
  ];

  for (const f of requiredStrings) {
    if (!isString(h[f])) {
      issues.push(f);
      h[f] = f === 'description' ? 'No description available' : 'Unknown';
    } else {
      h[f] = h[f].trim();
    }
  }

  // effects
  if (Array.isArray(h.effects)) {
    h.effects = h.effects
      .map(e => (isString(e) ? e.trim() : ''))
      .filter(Boolean);
  } else if (isString(h.effects)) {
    h.effects = h.effects
      .split(/[,;\n]+/)
      .map(e => e.trim())
      .filter(Boolean);
    issues.push('effects');
  } else {
    h.effects = [];
    issues.push('effects');
  }

  // tags
  if (Array.isArray(h.tags)) {
    h.tags = h.tags
      .map(t => (isString(t) ? t.trim() : ''))
      .filter(Boolean);
  } else if (isString(h.tags)) {
    h.tags = h.tags
      .split(/[,;\n]+/)
      .map(t => t.trim())
      .filter(Boolean);
    issues.push('tags');
  } else {
    h.tags = [];
    issues.push('tags');
  }

  // infer category if unknown
  if (!isString(herb.category)) {
    const combined = (h.description + ' ' + h.tags.join(' ')).toLowerCase();
    if (/oneirogen|dream/.test(combined)) h.category = 'Oneirogen';
    else if (/dissociative|sedative/.test(combined)) h.category = 'Dissociative / Sedative';
    else if (/empathogen|euphoriant/.test(combined)) h.category = 'Empathogen / Euphoriant';
    else if (/visionary|psychedelic/.test(combined)) h.category = 'Ritual / Visionary';
    else if (/stimulant/.test(combined)) h.category = 'Stimulant';
    else h.category = 'Other';
  }

  // region
  if (!isString(herb.region)) {
    const region = guessRegion(h.description + ' ' + h.tags.join(' '));
    if (region) {
      h.region = region;
    }
  }

  // legal status
  if (!isString(herb.legalStatus)) {
    const text = (h.description || '').toLowerCase();
    if (/illegal/.test(text)) h.legalStatus = 'Illegal';
    else if (/legal/.test(text)) h.legalStatus = 'Legal';
    else h.legalStatus = 'Unknown';
  }

  h.effects = Array.from(new Set(h.effects));
  h.tags = Array.from(new Set(h.tags));

  if (issues.length) {
    errors.push({ id: h.id || h.name, issues });
  }

  cleaned.push(h);
}

fs.writeFileSync(output, JSON.stringify(cleaned, null, 2));
fs.writeFileSync(logFile, JSON.stringify(errors, null, 2));

console.log(`Cleaned ${cleaned.length} herbs. Logged ${errors.length} with issues.`);
