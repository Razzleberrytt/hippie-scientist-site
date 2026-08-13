import fs from 'fs';
import path from 'path';

const strictMode = process.argv.includes('--strict');

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
  { regex: /\bdummy\b/i, name: 'dummy' },
  { regex: /is linked here to/i, name: 'mechanism-link template' },
  { regex: /lean herb row|lean monograph row/i, name: 'lean row template' },
  { regex: /high.speed phytochemical/i, name: 'phytochemical ingestion template' },
  { regex: /internal cross-linking supports/i, name: 'cross-linking template' },
  { regex: /\bis tracked for\b/i, name: 'tracked-for template' },
  { regex: /it\s+(?:is|should be)\s+(?:best\s+)?framed\b/i, name: 'framing-instruction template' },
  { regex: /decision-ready summary/i, name: 'decision-ready summary prefix' },
  { regex: /evidence level:/i, name: 'evidence-level template' },
  { regex: /scispace evidence pass|evidence pass/i, name: 'evidence-pass template' },
  { regex: /enriched in bulk|bulk mode/i, name: 'bulk-enrichment template' },
  {
    regex: /evidence-aware\s+(?:compound|botanical)\s+profile\s+with\s+mechanism,?\s+safety,?\s+and\s+practical\s+context/i,
    name: 'generic evidence-aware profile placeholder',
  },
  { regex: /^conservative evidence framing applied\.?$/i, name: 'conservative-framing placeholder' },
  { regex: /^varying compliance\.?$/i, name: 'varying-compliance placeholder' },
  { regex: /canonical profile pending.*static route exists/i, name: 'build-system route message' },
];

const USER_FACING_FIELDS = [
  'name',
  'summary',
  'description',
  'overview',
  'safety',
  'safety_summary',
  'dosage',
  'typical_dosage',
  'contraindications',
  'interactions',
  'side_effects',
  'effects',
  'primary_effects',
  'evidence_summary',
  'best_for',
  'why_people_stop',
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
    const desc = item.description || '';
    if (desc.trim().length > 0 && desc.trim().length < 15) {
      results.push({
        slug: item.slug,
        name: item.name,
        type,
        field: 'description',
        value: desc,
        issue: 'Description under 15 characters',
        severity: 'CRITICAL',
      });
      affectedSlugs.add(item.slug);
    }

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
              severity: isUserFacing ? 'CRITICAL' : 'LOW',
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
                severity: 'LOW',
              });
              affectedSlugs.add(item.slug);
            }
          }
        } catch {
          // Ignore non-stringifiable metadata objects.
        }
      }
    }
  };

  herbs.forEach(item => scanItem(item, 'herb'));
  compounds.forEach(item => scanItem(item, 'compound'));

  ensureDirExists('reports');

  fs.writeFileSync('reports/leaked-slugs.json', JSON.stringify(Array.from(affectedSlugs), null, 2));
  console.log(`Wrote reports/leaked-slugs.json with ${affectedSlugs.size} affected slugs.`);

  const criticalIssues = results.filter(r => r.severity === 'CRITICAL');
  const lowIssues = results.filter(r => r.severity === 'LOW');

  let md = `# Leaked Pipeline Text Audit Report\n\nGenerated on: ${new Date().toISOString()}\n\n## Summary Statistics\n\n- **Total Issues Identified**: ${results.length}\n- **Critical (User-Facing)**: ${criticalIssues.length}\n- **Low (Internal/Metadata)**: ${lowIssues.length}\n- **Unique Affected Slugs**: ${affectedSlugs.size}\n\n## Details of Identified Issues\n\n`;

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
  console.log('Wrote reports/leaked-pipeline-text.md.');

  if (strictMode && criticalIssues.length > 0) {
    console.error(`Strict audit failed: ${criticalIssues.length} critical user-facing leak(s) detected.`);
    process.exitCode = 1;
  }
}

runAudit();
