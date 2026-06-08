import fs from 'fs';
import path from 'path';

// Helper to ensure directory exists
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Check if a field value is filled and is not a placeholder
function checkDescription(value) {
  if (!value || typeof value !== 'string') return false;
  const val = value.toLowerCase().trim();
  if (val.length === 0) return false;
  
  const placeholders = [
    'evidence-aware botanical profile with mechanism',
    'evidence-aware compound profile with mechanism',
    'needs review',
    'safety review pending',
    'research pending',
    'research-only',
    'placeholder'
  ];

  return !placeholders.some(p => val.includes(p));
}

function checkSafety(value) {
  if (!value || typeof value !== 'string') return false;
  const val = value.toLowerCase().trim();
  if (val.length === 0) return false;

  const placeholders = [
    'needs review',
    'safety review pending',
    'research pending',
    'placeholder'
  ];

  return !placeholders.some(p => val.includes(p));
}

function checkEvidenceLevel(item) {
  const level = item.evidence_tier || item.evidence_grade || item.evidenceLevel || item.evidence_level;
  if (!level) return false;
  const val = String(level).toLowerCase().trim();
  return val.length > 0 && val !== 'null' && val !== 'undefined';
}

function checkMechanism(item) {
  const mechs = item.mechanisms || item.canonical_mechanisms || item.mechanism;
  if (!mechs) return false;
  if (Array.isArray(mechs)) {
    return mechs.length > 0;
  }
  const val = String(mechs).toLowerCase().trim();
  return val.length > 0 && val !== 'null' && val !== 'undefined';
}

function checkBestFor(item) {
  const best = item.effects || item.primary_effects || item.best_for || item.bestFor;
  if (!best) return false;
  
  const checkVal = (v) => {
    if (!v) return false;
    const val = String(v).toLowerCase().trim();
    if (val.length === 0) return false;
    const placeholders = ['research pending', 'research_only', 'research-pending', 'needs review', 'placeholder'];
    return !placeholders.some(p => val.includes(p));
  };

  if (Array.isArray(best)) {
    return best.length > 0 && best.some(checkVal);
  }
  return checkVal(best);
}

function checkDosing(item) {
  const dosing = item.dosage || item.typical_dosage || item.dosing || item.dosage_range;
  if (!dosing) return false;
  if (Array.isArray(dosing)) return dosing.length > 0;
  const val = String(dosing).toLowerCase().trim();
  return val.length > 0 && val !== 'null' && val !== 'undefined';
}

function checkInteractions(item) {
  const val = item.interactions;
  if (!val) return false;
  if (Array.isArray(val)) return val.length > 0;
  const str = String(val).toLowerCase().trim();
  return str.length > 0 && str !== 'null' && str !== 'undefined';
}

function runGapAnalysis() {
  const herbsPath = 'public/data/herbs.json';
  const compoundsPath = 'public/data/compounds.json';

  if (!fs.existsSync(herbsPath) || !fs.existsSync(compoundsPath)) {
    console.error('Error: Required JSON files public/data/herbs.json or compounds.json are missing.');
    process.exit(1);
  }

  const herbs = JSON.parse(fs.readFileSync(herbsPath, 'utf8'));
  const compounds = JSON.parse(fs.readFileSync(compoundsPath, 'utf8'));

  const allProfiles = [];
  let safetyFilledCount = 0;
  let descriptionFilledCount = 0;
  let mechanismFilledCount = 0;

  const prioritySlugs = [
    'ashwagandha', 'turmeric', 'lions-mane', 'bacopa-monnieri', 'rhodiola-rosea',
    'ginkgo-biloba', 'valerian-root', 'elderberry', 'echinacea', 'ginger',
    'reishi', 'cordyceps', 'holy-basil', 'passionflower', 'st-johns-wort',
    'magnesium-glycinate', 'l-theanine', 'creatine', 'omega-3', 'vitamin-d3'
  ];

  const processItems = (items, type) => {
    items.forEach(item => {
      const descFilled = checkDescription(item.description);
      const safetyFilled = checkSafety(item.safety);
      const evidenceFilled = checkEvidenceLevel(item);
      const mechFilled = checkMechanism(item);
      const bestForFilled = checkBestFor(item);
      const dosingFilled = checkDosing(item);
      const interactionsFilled = checkInteractions(item);

      if (descFilled) descriptionFilledCount++;
      if (safetyFilled) safetyFilledCount++;
      if (mechFilled) mechanismFilledCount++;

      const missing = [];
      if (!descFilled) missing.push('description');
      if (!safetyFilled) missing.push('safety');
      if (!evidenceFilled) missing.push('evidence_level');
      if (!mechFilled) missing.push('mechanism');
      if (!bestForFilled) missing.push('best_for');
      if (!dosingFilled) missing.push('dosing');
      if (!interactionsFilled) missing.push('interactions');

      const totalFields = 7;
      const completeness = (totalFields - missing.length) / totalFields;

      allProfiles.push({
        name: item.name,
        slug: item.slug,
        type,
        completeness,
        missingFields: missing,
        details: {
          description: descFilled ? 'FILLED' : 'EMPTY',
          safety: safetyFilled ? 'FILLED' : 'EMPTY',
          evidence_level: evidenceFilled ? 'FILLED' : 'EMPTY',
          mechanism: mechFilled ? 'FILLED' : 'EMPTY',
          best_for: bestForFilled ? 'FILLED' : 'EMPTY',
          dosing: dosingFilled ? 'FILLED' : 'EMPTY',
          interactions: interactionsFilled ? 'FILLED' : 'EMPTY'
        }
      });
    });
  };

  processItems(herbs, 'herb');
  processItems(compounds, 'compound');

  // Sort by completeness ASC (worst first)
  allProfiles.sort((a, b) => a.completeness - b.completeness || a.name.localeCompare(b.name));

  // Write JSON report
  ensureDirExists('reports');
  fs.writeFileSync('reports/content-gaps.json', JSON.stringify(allProfiles, null, 2));
  console.log(`Wrote reports/content-gaps.json with ${allProfiles.length} profiles.`);

  // Calculate summaries
  const total = allProfiles.length;
  const pctSafety = ((safetyFilledCount / total) * 100).toFixed(1);
  const pctDesc = ((descriptionFilledCount / total) * 100).toFixed(1);
  const pctMech = ((mechanismFilledCount / total) * 100).toFixed(1);

  // Match priority slugs (allowing partial match for things like 'valerian-root' matching 'valerian')
  const getPriorityMatches = () => {
    const results = [];
    prioritySlugs.forEach(pSlug => {
      // Find matching profile (exact, or containing/contained)
      const match = allProfiles.find(p => 
        p.slug === pSlug || 
        (pSlug === 'valerian-root' && p.slug === 'valerian') ||
        p.slug.includes(pSlug) || 
        pSlug.includes(p.slug)
      );

      if (match) {
        results.push({ prioritySlug: pSlug, profile: match });
      } else {
        results.push({ prioritySlug: pSlug, profile: null });
      }
    });
    return results;
  };

  const priorityMatches = getPriorityMatches();

  // Generate Markdown report
  let md = `# Content Gap Audit Report

Generated on: ${new Date().toISOString()}

## Summary Statistics

- **Total Profiles Evaluated**: ${total}
- **Safety Data Fill Rate**: ${pctSafety}% (${safetyFilledCount} / ${total})
- **Description Fill Rate**: ${pctDesc}% (${descriptionFilledCount} / ${total})
- **Mechanism Fill Rate**: ${pctMech}% (${mechanismFilledCount} / ${total})

## High-Traffic Priority Slugs (Completeness)

Here is the completeness audit for the top 20 highest-traffic priority slugs:

| Priority Slug | Matched Profile | Type | Completeness % | Missing Fields |
| --- | --- | --- | --- | --- |
`;

  priorityMatches.forEach(pm => {
    if (pm.profile) {
      const p = pm.profile;
      const missing = p.missingFields.join(', ') || '*None (100% Complete)*';
      md += `| \`${pm.prioritySlug}\` | **${p.name}** (\`${p.slug}\`) | ${p.type} | ${(p.completeness * 100).toFixed(0)}% | ${missing} |\n`;
    } else {
      md += `| \`${pm.prioritySlug}\` | *No matching profile* | - | - | - |\n`;
    }
  });

  md += `\n## Completeness Audit Table (Sorted Worst to Best)

| Profile Name | Slug | Type | Completeness % | Missing Fields |
| --- | --- | --- | --- | --- |
`;

  allProfiles.forEach(p => {
    const missing = p.missingFields.join(', ') || '*None (100% Complete)*';
    md += `| ${p.name} | \`${p.slug}\` | ${p.type} | ${(p.completeness * 100).toFixed(0)}% | ${missing} |\n`;
  });

  fs.writeFileSync('reports/content-gaps.md', md);
  console.log(`Wrote reports/content-gaps.md.`);
}

runGapAnalysis();
