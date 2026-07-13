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
  const placeholders = [
    'needs review',
    'safety review pending',
    'research pending',
    'placeholder'
  ];

  const checkVal = (v) => {
    if (!v || typeof v !== 'string') return false;
    const val = v.toLowerCase().trim();
    if (val.length === 0) return false;
    return !placeholders.some(p => val.includes(p));
  };

  if (Array.isArray(value)) {
    return value.length > 0 && value.some(checkVal);
  }
  return checkVal(value);
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

function checkInteractions(item, interactionEdgesMap) {
  const val = item.interactions;
  if (Array.isArray(val) ? val.length > 0 : false) return true;
  if (typeof val === 'string') {
    const str = val.toLowerCase().trim();
    if (str.length > 0 && str !== 'null' && str !== 'undefined') return true;
  }
  // `item.interactions` is never populated by the workbook pipeline — real,
  // rendered interaction content lives in the derived interaction graph
  // (public/data/interaction_edges.json), which powers the live "Interactions"
  // section on /herbs/:slug and /compounds/:slug via InteractionWarnings.
  const edges = interactionEdgesMap?.[item.slug];
  return Array.isArray(edges) && edges.length > 0;
}

function runGapAnalysis() {
  const herbsPath = 'public/data/herbs.json';
  const compoundsPath = 'public/data/compounds.json';
  const interactionEdgesPath = 'public/data/interaction_edges.json';

  if (!fs.existsSync(herbsPath) || !fs.existsSync(compoundsPath)) {
    console.error('Error: Required JSON files public/data/herbs.json or compounds.json are missing.');
    process.exit(1);
  }

  const herbs = JSON.parse(fs.readFileSync(herbsPath, 'utf8'));
  const compounds = JSON.parse(fs.readFileSync(compoundsPath, 'utf8'));
  const interactionEdgesMap = fs.existsSync(interactionEdgesPath)
    ? JSON.parse(fs.readFileSync(interactionEdgesPath, 'utf8'))
    : {};

  const allProfiles = [];
  let safetyFilledCount = 0;
  let descriptionFilledCount = 0;
  let mechanismFilledCount = 0;
  let interactionsFilledCount = 0;

  const prioritySlugs = [
    'ashwagandha', 'turmeric', 'lions-mane', 'bacopa-monnieri', 'rhodiola-rosea',
    'ginkgo-biloba', 'valerian-root', 'elderberry', 'echinacea', 'ginger',
    'reishi', 'cordyceps', 'holy-basil', 'passionflower', 'st-johns-wort',
    'magnesium-glycinate', 'l-theanine', 'creatine', 'omega-3', 'vitamin-d3'
  ];

  const processItems = (items, type) => {
    items.forEach(item => {
      const descFilled = checkDescription(item.description);
      const safetyFilled = checkSafety(item.contraindications);
      const evidenceFilled = checkEvidenceLevel(item);
      const mechFilled = checkMechanism(item);
      const bestForFilled = checkBestFor(item);
      const dosingFilled = checkDosing(item);
      const interactionsFilled = checkInteractions(item, interactionEdgesMap);

      if (descFilled) descriptionFilledCount++;
      if (safetyFilled) safetyFilledCount++;
      if (mechFilled) mechanismFilledCount++;
      if (interactionsFilled) interactionsFilledCount++;

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
  const pctInteractions = ((interactionsFilledCount / total) * 100).toFixed(1);

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
- **Interactions Fill Rate**: ${pctInteractions}% (${interactionsFilledCount} / ${total}) — counts profiles with a derived interaction-graph entry in \`interaction_edges.json\` (the data source the live "Interactions" page section actually reads)

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
