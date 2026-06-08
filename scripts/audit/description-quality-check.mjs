import fs from 'fs';
import path from 'path';

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const QUALITY_PATTERNS = [
  { regex: /placeholder/i, name: 'Placeholder' },
  { regex: /\bTODO\b/i, name: 'TODO' },
  { regex: /\bFIXME\b/i, name: 'FIXME' },
  { regex: /\blorem\b/i, name: 'Lorem Ipsum' },
  { regex: /\btest\b/i, name: 'Test String' },
  { regex: /evidence-aware botanical profile/i, name: 'Default Botanical Template' },
  { regex: /evidence-aware compound profile/i, name: 'Default Compound Template' },
  { regex: /lean bulk/i, name: 'Leaked "Lean bulk"' },
  { regex: /ingestion row/i, name: 'Leaked "ingestion row"' },
  { regex: /batch import/i, name: 'Leaked "batch import"' },
  { regex: /workbook row/i, name: 'Leaked "workbook row"' }
];

function run() {
  const herbsPath = 'public/data/herbs.json';
  const compoundsPath = 'public/data/compounds.json';

  if (!fs.existsSync(herbsPath) || !fs.existsSync(compoundsPath)) {
    console.error('Error: Required JSON files public/data/herbs.json or compounds.json are missing.');
    process.exit(1);
  }

  const herbs = JSON.parse(fs.readFileSync(herbsPath, 'utf8'));
  const compounds = JSON.parse(fs.readFileSync(compoundsPath, 'utf8'));

  const allItems = [
    ...herbs.map(h => ({ ...h, type: 'herb' })),
    ...compounds.map(c => ({ ...c, type: 'compound' }))
  ];

  const totalScanned = allItems.length;
  const issues = [];
  const descriptionMap = {}; // description text -> array of items

  allItems.forEach(item => {
    const desc = (item.description || '').trim();
    if (!desc) {
      issues.push({
        slug: item.slug,
        name: item.name,
        type: item.type,
        issue: 'Empty Description',
        value: '',
        severity: 'HIGH'
      });
      return;
    }

    // 1. Group for exact duplicates checking
    const normalizedDesc = desc.toLowerCase().replace(/\s+/g, ' ');
    if (!descriptionMap[normalizedDesc]) {
      descriptionMap[normalizedDesc] = [];
    }
    descriptionMap[normalizedDesc].push(item);

    // 2. Length check (< 40 characters)
    if (desc.length < 40) {
      issues.push({
        slug: item.slug,
        name: item.name,
        type: item.type,
        issue: `Short Description (${desc.length} chars)`,
        value: desc,
        severity: 'MEDIUM'
      });
    }

    // 3. Pattern/label check
    QUALITY_PATTERNS.forEach(pat => {
      if (pat.regex.test(desc)) {
        issues.push({
          slug: item.slug,
          name: item.name,
          type: item.type,
          issue: `Flagged Pattern: "${pat.name}"`,
          value: desc,
          severity: pat.name.startsWith('Leaked') ? 'CRITICAL' : 'HIGH'
        });
      }
    });
  });

  // Find exact duplicates
  const duplicatesList = [];
  Object.entries(descriptionMap).forEach(([descText, items]) => {
    if (items.length > 1) {
      duplicatesList.push({
        description: items[0].description,
        count: items.length,
        items: items.map(item => ({ name: item.name, slug: item.slug, type: item.type }))
      });

      // Add duplicate issue for each item
      items.forEach(item => {
        issues.push({
          slug: item.slug,
          name: item.name,
          type: item.type,
          issue: `Duplicate Description (shared with ${items.length - 1} other profiles)`,
          value: item.description,
          severity: 'HIGH'
        });
      });
    }
  });

  // Ensure reports dir exists
  ensureDirExists('reports');

  // Generate description-quality.md
  let md = `# Description Quality Audit Report

Generated on: ${new Date().toISOString()}

## Summary Statistics

- **Total Profiles Scanned**: ${totalScanned}
- **Total Quality Issues Flagged**: ${issues.length}
- **Critical Issues (Leaked Labels)**: ${issues.filter(i => i.severity === 'CRITICAL').length}
- **High Severity (Empty / Template / Duplicates)**: ${issues.filter(i => i.severity === 'HIGH').length}
- **Medium Severity (Short descriptions)**: ${issues.filter(i => i.severity === 'MEDIUM').length}
- **Unique Duplicate Description Clusters**: ${duplicatesList.length}

## Critical Leaks & Pipeline Warnings

| Profile Name | Slug | Type | Identified Leak / Issue | Description Text |
| --- | --- | --- | --- | --- |
`;

  const criticalIssues = issues.filter(i => i.severity === 'CRITICAL');
  if (criticalIssues.length > 0) {
    criticalIssues.forEach(i => {
      md += `| **${i.name}** | \`${i.slug}\` | ${i.type} | ${i.issue} | \`${i.value}\` |\n`;
    });
  } else {
    md += `| *None* | *None* | *None* | *No critical pipeline leaks detected!* | - |\n`;
  }

  md += `
## Duplicate Description Clusters

The following description strings are shared identically across multiple profiles:

| Duplicate Count | Shared Profiles | Shared Description Text |
| --- | --- | --- |
`;

  if (duplicatesList.length > 0) {
    // Sort duplicates worst first (most items sharing)
    duplicatesList.sort((a, b) => b.count - a.count);
    duplicatesList.forEach(dup => {
      const profilesStr = dup.items.map(item => `**${item.name}** (\`${item.slug}\` - ${item.type})`).join('<br>');
      md += `| ${dup.count} | ${profilesStr} | \`${dup.description}\` |\n`;
    });
  } else {
    md += `| *None* | *No duplicate description clusters found!* | - |\n`;
  }

  md += `
## Worst Offenders List (High & Medium Severity Issues)

Top 30 worst quality issues identified during description audit:

| Profile Name | Slug | Type | Severity | Identified Quality Issue | Description Value |
| --- | --- | --- | --- | --- | --- |
`;

  const otherIssues = issues.filter(i => i.severity !== 'CRITICAL')
    .sort((a, b) => {
      const sevOrder = { HIGH: 1, MEDIUM: 2 };
      return sevOrder[a.severity] - sevOrder[b.severity] || a.name.localeCompare(b.name);
    });

  otherIssues.slice(0, 30).forEach(i => {
    md += `| **${i.name}** | \`${i.slug}\` | ${i.type} | **${i.severity}** | ${i.issue} | \`${i.value || '*empty*'}\` |\n`;
  });

  fs.writeFileSync('reports/description-quality.md', md);
  console.log('Wrote reports/description-quality.md.');
}

run();
