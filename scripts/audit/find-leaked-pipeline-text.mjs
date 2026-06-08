import fs from 'fs';
import path from 'path';

// Helper to ensure directory exists
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const LEAK_PATTERNS = [
  { regex: /lean bulk ingestion row/i, name: 'Lean bulk ingestion row' },
  { regex: /lean bulk/i, name: 'lean bulk' },
  { regex: /^ingestion row/i, name: 'Ingestion row (prefix)' },
  { regex: /\bTODO\b/i, name: 'TODO' },
  { regex: /\bFIXME\b/i, name: 'FIXME' },
  { regex: /\bPLACEHOLDER\b/i, name: 'PLACEHOLDER' },
  { regex: /\btest entry\b/i, name: 'test entry' },
  { regex: /\bdummy\b/i, name: 'dummy' }
];

// Fields that are displayed on the frontend to users
const USER_FACING_FIELDS = [
  'name',
  'summary',
  'description',
  'safety',
  'dosage',
  'typical_dosage',
  'contraindications',
  'interactions',
  'side_effects',
  'effects',
  'primary_effects'
];

function runAudit() {
  const herbsPath = 'public/data/herbs.json';
  const compoundsPath = 'public/data/compounds.json';

  if (!fs.existsSync(herbsPath) || !fs.existsSync(compoundsPath)) {
    console.error('Error: Required JSON files public/data/herbs.json or compounds.json are missing.');
    process.exit(1);
  }

  const herbs = JSON.parse(fs.readFileSync(herbsPath, 'utf8'));
  const compounds = JSON.parse(fs.readFileSync(compoundsPath, 'utf8'));

  const results = [];
  const affectedSlugs = new Set();

  const scanItem = (item, type) => {
    // Check for short description
    const desc = item.description || '';
    if (desc.trim().length > 0 && desc.trim().length < 15) {
      results.push({
        slug: item.slug,
        name: item.name,
        type,
        field: 'description',
        value: desc,
        issue: 'Description under 15 characters',
        severity: 'CRITICAL'
      });
      affectedSlugs.add(item.slug);
    }

    // Scan all properties
    for (const [key, value] of Object.entries(item)) {
      if (!value) continue;

      const isUserFacing = USER_FACING_FIELDS.includes(key);
      const checkString = (str, fieldName) => {
        for (const pattern of LEAK_PATTERNS) {
          if (pattern.regex.test(str)) {
            results.push({
              slug: item.slug,
              name: item.name,
              type,
              field: fieldName,
              value: str,
              issue: `Leaked text pattern: "${pattern.name}"`,
              severity: isUserFacing ? 'CRITICAL' : 'LOW'
            });
            affectedSlugs.add(item.slug);
          }
        }
      };

      if (typeof value === 'string') {
        checkString(value, key);
      } else if (Array.isArray(value)) {
        value.forEach((val, idx) => {
          if (typeof val === 'string') {
            checkString(val, `${key}[${idx}]`);
          }
        });
      } else if (typeof value === 'object') {
        // Nested properties
        try {
          const strVal = JSON.stringify(value);
          for (const pattern of LEAK_PATTERNS) {
            if (pattern.regex.test(strVal)) {
              results.push({
                slug: item.slug,
                name: item.name,
                type,
                field: key,
                value: strVal,
                issue: `Leaked text pattern in object: "${pattern.name}"`,
                severity: 'LOW' // nested objects are usually internal/metadata
              });
              affectedSlugs.add(item.slug);
            }
          }
        } catch (e) {
          // ignore cyclic or non-stringifiable
        }
      }
    }
  };

  herbs.forEach(item => scanItem(item, 'herb'));
  compounds.forEach(item => scanItem(item, 'compound'));

  // Ensure reports dir exists
  ensureDirExists('reports');

  // Write reports/leaked-slugs.json
  fs.writeFileSync('reports/leaked-slugs.json', JSON.stringify(Array.from(affectedSlugs), null, 2));
  console.log(`Wrote reports/leaked-slugs.json with ${affectedSlugs.size} affected slugs.`);

  // Write reports/leaked-pipeline-text.md
  let md = `# Leaked Pipeline Text Audit Report

Generated on: ${new Date().toISOString()}

## Summary Statistics

- **Total Issues Identified**: ${results.length}
- **Critical (User-Facing)**: ${results.filter(r => r.severity === 'CRITICAL').length}
- **Low (Internal/Metadata)**: ${results.filter(r => r.severity === 'LOW').length}
- **Unique Affected Slugs**: ${affectedSlugs.size}

## Details of Identified Issues

`;

  const criticalIssues = results.filter(r => r.severity === 'CRITICAL');
  const lowIssues = results.filter(r => r.severity === 'LOW');

  if (criticalIssues.length > 0) {
    md += `### CRITICAL — User-Facing Fields\n\n`;
    md += `| Profile Name | Slug | Type | Field | Issue | Value |\n`;
    md += `| --- | --- | --- | --- | --- | --- |\n`;
    criticalIssues.forEach(r => {
      md += `| **${r.name}** | \`${r.slug}\` | ${r.type} | \`${r.field}\` | ${r.issue} | \`${r.value}\` |\n`;
    });
    md += `\n`;
  } else {
    md += `### CRITICAL — User-Facing Fields\n\n*No critical leaks found in user-facing fields!*\n\n`;
  }

  if (lowIssues.length > 0) {
    md += `### LOW — Internal / Metadata Fields\n\n`;
    md += `| Profile Name | Slug | Type | Field | Issue | Value |\n`;
    md += `| --- | --- | --- | --- | --- | --- |\n`;
    lowIssues.forEach(r => {
      const truncatedVal = r.value.length > 100 ? r.value.substring(0, 97) + '...' : r.value;
      md += `| **${r.name}** | \`${r.slug}\` | ${r.type} | \`${r.field}\` | ${r.issue} | \`${truncatedVal}\` |\n`;
    });
  } else {
    md += `### LOW — Internal / Metadata Fields\n\n*No low severity leaks found in internal fields!*\n\n`;
  }

  fs.writeFileSync('reports/leaked-pipeline-text.md', md);
  console.log(`Wrote reports/leaked-pipeline-text.md.`);
}

runAudit();
