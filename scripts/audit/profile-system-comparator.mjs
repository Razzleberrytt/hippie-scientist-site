import fs from 'fs';
import path from 'path';

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Check if a field value is filled and is not a placeholder
function isFilled(value, placeholders = []) {
  if (!value) return false;
  if (Array.isArray(value)) {
    if (value.length === 0) return false;
    return value.some(val => isFilled(val, placeholders));
  }
  const val = String(value).toLowerCase().trim();
  if (val.length === 0) return false;
  return !placeholders.some(p => val.includes(p));
}

function checkSafety(value) {
  return isFilled(value, ['needs review', 'safety review pending', 'placeholder', 'pending']);
}

function checkDescription(value) {
  return isFilled(value, [
    'evidence-aware botanical profile',
    'evidence-aware compound profile',
    'needs review',
    'safety review pending',
    'research pending',
    'placeholder'
  ]) && String(value).trim().length >= 15;
}

function checkBestFor(value) {
  return isFilled(value, ['research pending', 'research_only', 'research-pending', 'needs review', 'placeholder']);
}

function calculateCompleteness(item) {
  let filled = 0;
  const total = 7;

  if (checkDescription(item.description || item.summary)) filled++;
  if (checkSafety(item.safety)) filled++;
  if (item.evidence_tier || item.evidence_grade) filled++;
  if (item.canonical_mechanisms && item.canonical_mechanisms.length > 0) filled++;
  if (checkBestFor(item.effects || item.primary_effects)) filled++;
  if (item.dosage || item.typical_dosage) filled++;
  if (item.interactions && item.interactions.length > 0) filled++;

  return filled / total;
}

function run() {
  const mapPath = 'reports/slug-redirect-map.json';
  const herbsPath = 'public/data/herbs.json';
  const compoundsPath = 'public/data/compounds.json';

  if (!fs.existsSync(herbsPath) || !fs.existsSync(compoundsPath)) {
    console.error('Error: Required JSON files public/data/herbs.json or compounds.json are missing.');
    process.exit(1);
  }

  const herbs = JSON.parse(fs.readFileSync(herbsPath, 'utf8'));
  const compounds = JSON.parse(fs.readFileSync(compoundsPath, 'utf8'));

  // Create lookup maps
  const herbMap = new Map(herbs.map(h => [h.slug, h]));
  const compoundMap = new Map(compounds.map(c => [c.slug, c]));

  const getProfile = (slug) => herbMap.get(slug) || compoundMap.get(slug) || null;

  // Load redirect mapping
  let redirects = {};
  if (fs.existsSync(mapPath)) {
    redirects = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  }

  // Reconstruct groups (target composite path -> array of source slugs)
  const targetGroups = {};
  Object.entries(redirects).forEach(([oldPath, newPath]) => {
    const oldSlug = oldPath.split('/').pop();
    const newSlug = newPath.split('/').pop();
    
    if (!targetGroups[newSlug]) {
      targetGroups[newSlug] = new Set();
    }
    targetGroups[newSlug].add(oldSlug);
    // Also make sure target slug itself is counted in group if we have a profile for it
    if (getProfile(newSlug)) {
      targetGroups[newSlug].add(newSlug);
    }
  });

  const regressions = [];
  let totalComparisons = 0;

  // For each group, determine the best (most complete) profile as the "new" representative
  Object.entries(targetGroups).forEach(([targetSlug, sourceSlugsSet]) => {
    const sourceSlugs = Array.from(sourceSlugsSet);
    const profiles = sourceSlugs.map(slug => getProfile(slug)).filter(Boolean);
    if (profiles.length === 0) return;

    // Find the profile with the highest completeness score
    profiles.sort((a, b) => calculateCompleteness(b) - calculateCompleteness(a));
    const newProfile = profiles[0]; // representative new profile

    // Compare each source profile (Old) to the representative new profile (New)
    sourceSlugs.forEach(oldSlug => {
      const oldProfile = getProfile(oldSlug);
      if (!oldProfile || oldProfile.slug === newProfile.slug) return;

      totalComparisons++;
      const oldComp = calculateCompleteness(oldProfile);
      const newComp = calculateCompleteness(newProfile);

      const oldDescLen = (oldProfile.description || '').length;
      const newDescLen = (newProfile.description || '').length;

      const oldSafetyValid = checkSafety(oldProfile.safety);
      const newSafetyValid = checkSafety(newProfile.safety);

      const oldBestForValid = checkBestFor(oldProfile.effects || oldProfile.primary_effects);
      const newBestForValid = checkBestFor(newProfile.effects || newProfile.primary_effects);

      const oldHasCitations = oldProfile.sources && oldProfile.sources.length > 0;
      const newHasCitations = newProfile.sources && newProfile.sources.length > 0;

      const oldHasAffiliate = !!(oldProfile.amazon_affiliate_url || oldProfile.affiliate_url);
      const newHasAffiliate = !!(newProfile.amazon_affiliate_url || newProfile.affiliate_url);

      const oldHasMechs = oldProfile.canonical_mechanisms && oldProfile.canonical_mechanisms.length > 0;
      const newHasMechs = newProfile.canonical_mechanisms && newProfile.canonical_mechanisms.length > 0;

      const oldHasContra = oldProfile.contraindications && oldProfile.contraindications.length > 0;
      const newHasContra = newProfile.contraindications && newProfile.contraindications.length > 0;

      const issues = [];

      if (newDescLen < oldDescLen - 10) {
        issues.push(`Description shortened from ${oldDescLen} to ${newDescLen} chars`);
      }
      if (oldSafetyValid && !newSafetyValid) {
        issues.push('Safety info lost (became placeholder or empty)');
      }
      if (oldBestForValid && !newBestForValid) {
        issues.push('Best-for tags lost');
      }
      if (oldHasCitations && !newHasCitations) {
        issues.push('Citations lost');
      }
      if (oldHasAffiliate && !newHasAffiliate) {
        issues.push('Affiliate picks lost');
      }
      if (oldHasMechs && !newHasMechs) {
        issues.push('Mechanisms lost');
      }
      if (oldHasContra && !newHasContra) {
        issues.push('Contraindications lost');
      }
      if (newComp < oldComp - 0.01) {
        issues.push(`Completeness score dropped from ${(oldComp*100).toFixed(0)}% to ${(newComp*100).toFixed(0)}%`);
      }

      if (issues.length > 0) {
        regressions.push({
          oldSlug,
          newSlug: newProfile.slug,
          compositeSlug: targetSlug,
          issues
        });
      }
    });
  });

  // Audit ALL profiles for pending safety & best_for
  const allHerbs = herbs.map(h => ({
    name: h.name,
    slug: h.slug,
    type: 'herb',
    safety: h.safety,
    best_for: h.effects || h.primary_effects,
    safetyValid: checkSafety(h.safety),
    bestForValid: checkBestFor(h.effects || h.primary_effects),
    completeness: calculateCompleteness(h)
  }));

  const allCompounds = compounds.map(c => ({
    name: c.name,
    slug: c.slug,
    type: 'compound',
    safety: c.safety,
    best_for: c.effects || c.primary_effects,
    safetyValid: checkSafety(c.safety),
    bestForValid: checkBestFor(c.effects || c.primary_effects),
    completeness: calculateCompleteness(c)
  }));

  const allProfilesList = [...allHerbs, ...allCompounds];

  const pendingSafety = allProfilesList
    .filter(p => !p.safetyValid)
    .sort((a, b) => b.completeness - a.completeness || a.name.localeCompare(b.name));

  const pendingBestFor = allProfilesList
    .filter(p => !p.bestForValid)
    .sort((a, b) => b.completeness - a.completeness || a.name.localeCompare(b.name));

  ensureDirExists('reports');

  // Write reports/profile-system-comparison.md
  let md = `# Profile System Parity & Completeness Report

Generated on: ${new Date().toISOString()}

## Summary Statistics

- **Total Duplicate Comparisons Audited**: ${totalComparisons}
- **De-duplication Regressions Identified**: ${regressions.length}
- **Total Profiles with Pending Safety**: ${pendingSafety.length}
- **Total Profiles with Pending Best-For Tags**: ${pendingBestFor.length}

## De-duplication Regression Warnings

The following table lists potential data loss/regressions when redirecting from a legacy profile to the target composite profile:

| Legacy Profile | Target Profile | Composite Slug | Identified Regressions / Data Loss |
| --- | --- | --- | --- |
`;

  if (regressions.length > 0) {
    regressions.forEach(r => {
      md += `| \`${r.oldSlug}\` | \`${r.newSlug}\` | **\`${r.compositeSlug}\`** | ${r.issues.join('<br>')} |\n`;
    });
  } else {
    md += `| *None* | *None* | *None* | *No regressions detected in de-duplication mappings!* |\n`;
  }

  md += `
## Top 20 Most Complete Profiles with Pending Safety

These profiles are highly complete but are missing valid safety context (currently empty or placeholder):

| Profile Name | Slug | Type | Completeness % | Current Safety Value |
| --- | --- | --- | --- | --- |
`;

  pendingSafety.slice(0, 20).forEach(p => {
    md += `| **${p.name}** | \`${p.slug}\` | ${p.type} | ${(p.completeness * 100).toFixed(0)}% | \`${p.safety || '*empty*'}\` |\n`;
  });

  md += `
## Top 20 Most Complete Profiles with Pending Best-For Tags

These profiles are highly complete but are missing valid best_for/effects tags:

| Profile Name | Slug | Type | Completeness % | Current Best-For Value |
| --- | --- | --- | --- | --- |
`;

  pendingBestFor.slice(0, 20).forEach(p => {
    const rawVal = JSON.stringify(p.best_for) || '*empty*';
    md += `| **${p.name}** | \`${p.slug}\` | ${p.type} | ${(p.completeness * 100).toFixed(0)}% | \`${rawVal}\` |\n`;
  });

  fs.writeFileSync('reports/profile-system-comparison.md', md);
  console.log('Wrote reports/profile-system-comparison.md.');
}

run();
