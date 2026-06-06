import fs from 'fs';
import path from 'path';

// Helper to ensure directory exists
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Normalize tag value
function normalizeTag(tag) {
  if (!tag) return '';
  return tag.trim().toLowerCase().replace(/[-_]/g, ' ');
}

// Check if tag is a placeholder/invalid
function isInvalidTag(tag) {
  if (!tag) return true;
  const normalized = normalizeTag(tag);
  return [
    'research pending',
    'research only',
    'needs review',
    'placeholder',
    'research-pending',
    'research_only',
    'needs_review',
    'pending',
    'none',
    'empty'
  ].includes(normalized);
}

// Categorize profile and suggest replacement tags
function getCategoryAndSuggestions(item, type) {
  const textBlob = [
    item.name,
    item.description,
    item.summary,
    item.compoundClass,
    item.compound_class,
    item.class,
    ...(item.keywords || []),
    ...(item.tags || [])
  ].filter(Boolean).join(' ').toLowerCase();

  let category = 'General Supplement';
  let suggestions = ['General Wellness', 'Dietary Support'];

  if (textBlob.includes('adaptogen')) {
    category = 'Adaptogen';
    suggestions = ['Stress Support', 'Energy', 'Fatigue Recovery'];
  } else if (textBlob.includes('nootropic') || textBlob.includes('cognit') || textBlob.includes('memory') || textBlob.includes('focus')) {
    category = 'Nootropic / Cognitive';
    suggestions = ['Calm Focus', 'Memory Support', 'Deep Work'];
  } else if (textBlob.includes('anxiolytic') || textBlob.includes('calm') || textBlob.includes('relax') || textBlob.includes('anxiety')) {
    category = 'Anxiolytic / Calmative';
    suggestions = ['Stress Relief', 'Calming Focus', 'Social Tension'];
  } else if (textBlob.includes('sleep') || textBlob.includes('insomnia') || textBlob.includes('sedat') || textBlob.includes('melatonin')) {
    category = 'Sleep Aid';
    suggestions = ['Sleep Quality', 'Wind-down Support', 'Bedtime Racing Thoughts'];
  } else if (textBlob.includes('inflam') || textBlob.includes('pain') || textBlob.includes('joint')) {
    category = 'Anti-inflammatory';
    suggestions = ['Joint Comfort', 'Exercise Recovery', 'Systemic Inflammation'];
  } else if (textBlob.includes('antioxidant') || textBlob.includes('oxidative') || textBlob.includes('longev')) {
    category = 'Antioxidant / Longevity';
    suggestions = ['Cellular Protection', 'Longevity Support', 'Oxidative Stress'];
  } else if (textBlob.includes('metabol') || textBlob.includes('glucose') || textBlob.includes('insulin') || textBlob.includes('blood sugar')) {
    category = 'Metabolic / Blood Sugar';
    suggestions = ['Glucose Transport', 'Metabolic Balance', 'Insulin Sensitivity'];
  } else if (textBlob.includes('digest') || textBlob.includes('gut') || textBlob.includes('microbiome') || textBlob.includes('stomach')) {
    category = 'Digestive / Gut Health';
    suggestions = ['Digestive Support', 'Gut Microbiome', 'Nausea Relief'];
  } else if (textBlob.includes('immun') || textBlob.includes('cold') || textBlob.includes('flu') || textBlob.includes('virus')) {
    category = 'Immunomodulator';
    suggestions = ['Immune Defense', 'Seasonal Support', 'Respiratory Health'];
  } else if (type === 'compound' && (item.compoundClass || item.compound_class || item.class)) {
    const cls = item.compoundClass || item.compound_class || item.class;
    category = `Compound (${cls})`;
    suggestions = [`${cls} Support`, 'Targeted Mechanism'];
  }

  return { category, suggestions };
}

function runBestForAudit() {
  const herbsPath = 'public/data/herbs.json';
  const compoundsPath = 'public/data/compounds.json';

  if (!fs.existsSync(herbsPath) || !fs.existsSync(compoundsPath)) {
    console.error('Error: Required JSON files public/data/herbs.json or compounds.json are missing.');
    process.exit(1);
  }

  const herbs = JSON.parse(fs.readFileSync(herbsPath, 'utf8'));
  const compounds = JSON.parse(fs.readFileSync(compoundsPath, 'utf8'));

  const frequencyMap = {};
  const invalidProfiles = [];

  const auditItems = (items, type) => {
    items.forEach(item => {
      // Collect best_for tags (from effects and primary_effects)
      const tags = [
        ...(item.effects || []),
        ...(item.primary_effects || []),
        ...(item.best_for || []),
        ...(item.bestFor || [])
      ].filter(Boolean);

      const normalizedTags = tags.map(normalizeTag).filter(Boolean);
      const uniqueTags = [...new Set(normalizedTags)];

      // Count frequencies
      uniqueTags.forEach(tag => {
        frequencyMap[tag] = (frequencyMap[tag] || 0) + 1;
      });

      // Check if all tags are placeholder/invalid or if no tags exist
      const allInvalid = uniqueTags.length === 0 || uniqueTags.every(isInvalidTag);

      if (allInvalid) {
        const { category, suggestions } = getCategoryAndSuggestions(item, type);
        invalidProfiles.push({
          name: item.name,
          slug: item.slug,
          type,
          currentTags: uniqueTags.length > 0 ? uniqueTags : ['*Empty*'],
          category,
          suggestions
        });
      }
    });
  };

  auditItems(herbs, 'herb');
  auditItems(compounds, 'compound');

  // Sort frequency map by count DESC
  const sortedFrequencies = Object.entries(frequencyMap)
    .sort((a, b) => b[1] - a[1]);

  // Generate best-for-audit.md report
  let md = `# Best-For Tags Audit Report

Generated on: ${new Date().toISOString()}

This report audits the "best_for" and "effects" tags used in the library filtering UI, identifying placeholders like "Research Pending" and recommending suitable replacements.

## Tag Frequency Table (Sorted by Count DESC)

| Tag Value (Normalized) | Profile Count | Status |
| --- | --- | --- |
`;

  sortedFrequencies.forEach(([tag, count]) => {
    const status = isInvalidTag(tag) ? '**PLACEHOLDER / INVALID**' : 'Valid';
    md += `| \`${tag}\` | ${count} | ${status} |\n`;
  });

  md += `
## Profiles with Invalid or Missing "Best-For" Tags

We identified ${invalidProfiles.length} profiles that have no valid tags (either empty, null, "Research Pending", or "Needs Review").

| Profile Name | Slug | Type | Current Tags | Classified Category | Suggested Replacement Tags |
| --- | --- | --- | --- | --- | --- |
`;

  invalidProfiles.forEach(p => {
    const curTags = p.currentTags.map(t => `\`${t}\``).join(', ');
    const suggs = p.suggestions.map(s => `\`${s}\``).join(', ');
    md += `| ${p.name} | \`${p.slug}\` | ${p.type} | ${curTags} | **${p.category}** | ${suggs} |\n`;
  });

  ensureDirExists('reports');
  fs.writeFileSync('reports/best-for-audit.md', md);
  console.log('Wrote reports/best-for-audit.md.');
}

runBestForAudit();
