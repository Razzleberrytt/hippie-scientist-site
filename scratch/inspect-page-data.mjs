import fs from 'node:fs';

const herbs = JSON.parse(fs.readFileSync('public/data/herbs.json', 'utf8'));
const compounds = JSON.parse(fs.readFileSync('public/data/compounds.json', 'utf8'));
const herbsSummary = JSON.parse(fs.readFileSync('public/data/herbs-summary.json', 'utf8'));
const compoundsSummary = JSON.parse(fs.readFileSync('public/data/compounds-summary.json', 'utf8'));

// simple merge
function merge(base, summary) {
  const bySlug = new Map(summary.map(s => [s.slug, s]));
  return base.map(b => ({ ...b, ...(bySlug.get(b.slug) || {}) }));
}

const allHerbs = merge(herbs, herbsSummary);
const allCompounds = merge(compounds, compoundsSummary);

const herb = allHerbs.find(h => h.slug === 'yohimbe');
const allRecords = [
  ...allHerbs.map(h => ({ ...h, entityType: 'herb' })),
  ...allCompounds.map(c => ({ ...c, entityType: 'compound' }))
];

const herbSlugs = new Set(allHerbs.map(h => h.slug));
const compoundSlugs = new Set(allCompounds.map(c => c.slug));

// related map
const relatedMap = JSON.parse(fs.readFileSync('public/data/runtime-maps/related-profiles.json', 'utf8'));
const ecosystemMap = JSON.parse(fs.readFileSync('public/data/runtime-maps/ecosystem-map.json', 'utf8'));

const relatedEntries = relatedMap['yohimbe'] || [];
const recordIndex = new Map(allRecords.map(r => [r.slug, r]));

const relatedCandidates = relatedEntries.map(e => ({
  ...recordIndex.get(e.slug),
  relatedScore: e.score
})).filter(r => r.slug);

const relatedHerbs = relatedCandidates
  .filter(item => herbSlugs.has(item.slug))
  .map(item => ({ ...item, entityType: 'herb' }));

const relatedCompounds = relatedCandidates
  .filter(item => compoundSlugs.has(item.slug))
  .map(item => ({ ...item, entityType: 'compound' }));

const ecosystemEntries = ecosystemMap['yohimbe'] || [];
const visibleEcosystemContinuityRecords = ecosystemEntries.map(e => {
  const record = recordIndex.get(e.slug);
  return {
    ...record,
    slug: e.slug,
    relatedScore: e.score
  };
}).filter(r => r.slug);

function sortByScoreThenName(a, b) {
  const scoreDelta = (b?.relatedScore || 0) - (a?.relatedScore || 0);
  if (scoreDelta !== 0) return scoreDelta;
  return String(a?.name || a?.slug).localeCompare(String(b?.name || b?.slug));
}

function mergeEcosystemContinuityRecords(primaryRecords, continuityRecords, limit = 6) {
  const bySlug = new Map();
  const mergedRecords = [...primaryRecords, ...continuityRecords];

  for (const item of mergedRecords.sort(sortByScoreThenName)) {
    const slug = item?.slug;
    if (!slug || bySlug.has(slug)) continue;
    bySlug.set(slug, item);
  }

  return [...bySlug.values()].sort(sortByScoreThenName).slice(0, limit);
}

const relatedProfiles = mergeEcosystemContinuityRecords(
  [...relatedHerbs, ...relatedCompounds],
  visibleEcosystemContinuityRecords,
  6
);

console.log('relatedHerbs slugs:', relatedHerbs.map(h => h.slug));
console.log('relatedCompounds slugs:', relatedCompounds.map(c => c.slug));
console.log('visibleEcosystemContinuityRecords slugs:', visibleEcosystemContinuityRecords.map(e => e.slug));
console.log('relatedProfiles slugs:', relatedProfiles.map(p => p.slug));
