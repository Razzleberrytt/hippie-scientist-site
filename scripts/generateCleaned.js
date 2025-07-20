const fs = require('fs');
const input = 'Full79.json';
const output = 'src/data/herbs-cleaned.json';
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const data = JSON.parse(fs.readFileSync(input, 'utf8'));
const cleaned = data.map(raw => {
  const h = { ...raw };
  const safe = {};
  safe.name = typeof h.name === 'string' ? h.name.trim() : 'Unknown';
  safe.id = h.id ? String(h.id).trim() : slugify(safe.name);
  const cat = typeof h.category === 'string' ? h.category : '';
  safe.category = cat
    .split('/')
    .map(s => s.trim())
    .filter(s => s && !/ritual/i.test(s))
    .join(' / ');
  if (!safe.category) safe.category = 'Other';
  const arr = v => (Array.isArray(v) ? v : typeof v === 'string' ? v.split(/[,;\n]+/) : []);
  safe.effects = arr(h.effects).map(e => e.trim()).filter(Boolean);
  safe.tags = arr(h.tags).map(t => t.trim()).filter(t => t && !/ritual/i.test(t));
  safe.scientificName = h.scientificName || '';
  safe.description = h.description || '';
  safe.preparation = h.preparation || '';
  safe.dosage = h.dosage || '';
  safe.intensity = h.intensity || '';
  safe.onset = h.onset || '';
  safe.duration = h.duration || '';
  safe.legalStatus = h.legalStatus || '';
  safe.region = h.region || '';
  safe.mechanismOfAction = h.mechanismOfAction || '';
  safe.pharmacokinetics = h.pharmacokinetics || '';
  safe.therapeuticUses = h.therapeuticUses || '';
  safe.sideEffects = h.sideEffects || '';
  safe.contraindications = h.contraindications || '';
  safe.drugInteractions = h.drugInteractions || '';
  safe.toxicity = h.toxicity || '';
  safe.toxicityLD50 = h.toxicityLD50 || '';
  safe.safetyRating = h.safetyRating ?? '';
  safe.affiliateLink = h.affiliateLink || '';
  safe.activeConstituents = Array.isArray(h.activeConstituents)
    ? h.activeConstituents.filter(c => c && c.name)
    : [];
  Object.keys(safe).forEach(k => {
    if (typeof safe[k] === 'string') {
      const v = safe[k].trim();
      safe[k] = v && !/^(n\/a|null)$/i.test(v) ? v : '';
    }
  });
  return safe;
});
fs.writeFileSync(output, JSON.stringify(cleaned, null, 2));
console.log(`Wrote ${cleaned.length} herbs to ${output}`);
