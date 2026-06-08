import fs from 'fs';
import path from 'path';

// Pairs that the similarity algorithm incorrectly groups — these are distinct substances
// that happen to have similar slug names. Never auto-redirect these.
const DENY_REDIRECT_PAIRS = new Set([
  'iron|boron', 'boron|iron',
  'iron|morin', 'morin|iron',
  'dim|msm', 'msm|dim',
  'lutein|actein', 'actein|lutein',
  'kava|gaba', 'gaba|kava',
  'kavain|papain', 'papain|kavain',
  'loganin|wogonin', 'wogonin|loganin',
  'taurine|matrine', 'matrine|taurine',
  'carnosol|farnesol', 'farnesol|carnosol',
  'choline|proline', 'proline|choline',
  'maca|cacao', 'cacao|maca',
  'hmb|bhb', 'bhb|hmb',
  'nr|nmn', 'nmn|nr',
]);

// Helper to ensure directory exists
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Levenshtein distance helper
function levenshtein(s1, s2) {
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[len1][len2];
}

// Clean and normalize strings for matching
function cleanName(name) {
  if (!name) return '';
  return name.replace(/\s*[([].*?[\])]\s*/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

// Extract scientific/Latin names in parentheses
function getScientificNames(name) {
  if (!name) return [];
  const matches = [...name.matchAll(/[([](.*?)[\])]/g)].map(m => m[1].trim().toLowerCase());
  return matches.filter(m => m.length > 2);
}

// Normalize words by removing generic botanical/compound suffixes
const genericWords = new Set(['extract', 'blend', 'complex', 'powder', 'root', 'berry', 'leaf', 'oil', 'standardized', 'capsule', 'tablet', 'form', 'use', 'sleep', 'active', 'aged']);
function getCoreWords(name) {
  return cleanName(name)
    .split(/[\s-]+/)
    .filter(w => w.length > 1 && !genericWords.has(w));
}

// Calculate completeness score (based on Task 2 logic)
function calculateCompleteness(item) {
  let filled = 0;
  const total = 7;
  
  // 1. Description
  const desc = item.description || '';
  if (desc && !desc.toLowerCase().includes('evidence-aware') && !desc.toLowerCase().includes('needs review') && !desc.toLowerCase().includes('safety review pending')) {
    filled++;
  }
  // 2. Safety
  const safetyVal = item.safety || '';
  if (safetyVal && !safetyVal.toLowerCase().includes('needs review') && !safetyVal.toLowerCase().includes('safety review pending')) {
    filled++;
  }
  // 3. Evidence
  if (item.evidence_tier || item.evidence_grade) {
    filled++;
  }
  // 4. Mechanism
  if (item.mechanisms && item.mechanisms.length > 0) {
    filled++;
  }
  // 5. Best for / Effects
  const effects = item.effects || [];
  if (effects.length > 0 && !effects.includes('research_only') && !effects.includes('research-pending')) {
    filled++;
  }
  // 6. Dosing
  if (item.dosage || item.typical_dosage) {
    filled++;
  }
  // 7. Interactions
  if (item.interactions && item.interactions.length > 0) {
    filled++;
  }

  return filled / total;
}

// Main execution
function runAudit() {
  const herbsPath = 'public/data/herbs.json';
  const compoundsPath = 'public/data/compounds.json';

  if (!fs.existsSync(herbsPath) || !fs.existsSync(compoundsPath)) {
    console.error('Error: Required JSON files public/data/herbs.json or compounds.json are missing.');
    process.exit(1);
  }

  const herbs = JSON.parse(fs.readFileSync(herbsPath, 'utf8'));
  const compounds = JSON.parse(fs.readFileSync(compoundsPath, 'utf8'));

  console.log('--- Loading public/data/herbs.json and compounds.json ---');
  console.log('Herbs sample (first 3):');
  herbs.slice(0, 3).forEach(h => console.log(`  - Name: "${h.name}", Slug: "${h.slug}"`));
  console.log('Compounds sample (first 3):');
  compounds.slice(0, 3).forEach(c => console.log(`  - Name: "${c.name}", Slug: "${c.slug}"`));
  console.log('-----------------------------------------------------\n');

  // We want to run audit separately on herbs and compounds to avoid incorrect cross-type redirects.
  // Wait, let's keep them separate as duplicates inside herbs and duplicates inside compounds.
  const auditGroups = [
    { type: 'herbs', items: herbs, prefix: '/herbs' },
    { type: 'compounds', items: compounds, prefix: '/compounds' }
  ];

  const allRedirects = {};
  const allGroups = [];

  for (const { type, items, prefix } of auditGroups) {
    console.log(`Auditing duplicates within ${type}...`);
    const visited = new Set();
    const groups = [];

    for (let i = 0; i < items.length; i++) {
      const item1 = items[i];
      if (visited.has(item1.slug)) continue;

      const group = [item1];
      const matchDetails = [];

      for (let j = i + 1; j < items.length; j++) {
        const item2 = items[j];
        if (visited.has(item2.slug)) continue;

        let isMatch = false;
        let confidence = 'LOW';
        let reason = '';

        const clean1 = cleanName(item1.name);
        const clean2 = cleanName(item2.name);
        const scis1 = getScientificNames(item1.name);
        const scis2 = getScientificNames(item2.name);
        const slug1 = item1.slug.toLowerCase();
        const slug2 = item2.slug.toLowerCase();
        const slugName1 = slug1.replace(/-/g, ' ');
        const slugName2 = slug2.replace(/-/g, ' ');

        // Match Rule A: Exact clean name match
        if (clean1 === clean2 && clean1.length > 0) {
          isMatch = true;
          confidence = 'HIGH';
          reason = 'Exact name match';
        }
        // Match Rule B: Levenshtein distance of slugs < 3
        else if (levenshtein(slug1, slug2) < 3) {
          isMatch = true;
          confidence = slug1.length > 5 ? 'HIGH' : 'MEDIUM';
          reason = `Slug Levenshtein distance = ${levenshtein(slug1, slug2)}`;
        }
        // Match Rule C: Scientific/Latin name matching clean name or slug
        else if (
          scis1.some(s => s === clean2 || s === slug2 || s.replace(/\s+/g, '-') === slug2) ||
          scis2.some(s => s === clean1 || s === slug1 || s.replace(/\s+/g, '-') === slug1)
        ) {
          isMatch = true;
          confidence = 'HIGH';
          reason = 'Latin / Scientific name mapping match';
        }
        // Match Rule D: Core words match (spelling variation or synonym)
        else {
          const core1 = getCoreWords(item1.name);
          const core2 = getCoreWords(item2.name);
          const coreSlug1 = getCoreWords(slugName1);
          const coreSlug2 = getCoreWords(slugName2);

          const setsEqual = (arr1, arr2) => {
            if (arr1.length === 0 || arr2.length === 0) return false;
            const s1 = new Set(arr1);
            const s2 = new Set(arr2);
            if (s1.size !== s2.size) return false;
            for (const x of s1) if (!s2.has(x)) return false;
            return true;
          };

          if (setsEqual(core1, core2) || setsEqual(coreSlug1, coreSlug2)) {
            isMatch = true;
            confidence = 'HIGH';
            reason = 'Core words match';
          }
          // Sub-form or overlap (e.g. Garlic vs Garlic Extract)
          else if (
            (core1.length > 0 && core1.every(w => core2.includes(w))) ||
            (core2.length > 0 && core2.every(w => core1.includes(w)))
          ) {
            // If one is generic form and other is extract, we can group as MEDIUM or LOW duplicate
            isMatch = true;
            confidence = 'MEDIUM';
            reason = 'One name is subset of other name (e.g. extract / berry variation)';
          }
        }

        // Deny-list check: skip known false-positive pairs regardless of algorithm confidence
        if (isMatch && DENY_REDIRECT_PAIRS.has(`${slug1}|${slug2}`)) {
          isMatch = false;
        }

        if (isMatch) {
          group.push(item2);
          matchDetails.push({ slug: item2.slug, confidence, reason });
        }
      }

      if (group.length > 1) {
        group.forEach(item => visited.add(item.slug));

        // Canonical Selection Algorithm
        // Score each candidate:
        // - Prefer shorter slug
        // - Prefer no parenthesis in name
        // - Prefer sitemap included
        // - Prefer higher completeness
        const candidates = group.map(item => {
          const completeness = calculateCompleteness(item);
          let score = 0;
          score += (25 - item.slug.length); // shorter is better
          if (!item.name.includes('(')) score += 10;
          if (item.sitemap_included) score += 5;
          score += completeness * 15;

          return { item, score, completeness };
        });

        candidates.sort((a, b) => b.score - a.score);
        const canonical = candidates[0].item;
        
        groups.push({
          type,
          prefix,
          canonical,
          candidates,
          matches: matchDetails
        });
      }
    }

    allGroups.push(...groups);

    // Build the redirect map for HIGH and MEDIUM confidence groups
    groups.forEach(g => {
      const canonicalPath = `${prefix}/${g.canonical.slug}`;
      g.candidates.forEach(c => {
        if (c.item.slug !== g.canonical.slug) {
          // Find match details to check confidence
          const match = g.matches.find(m => m.slug === c.item.slug);
          const conf = match ? match.confidence : 'LOW';
          if (conf === 'HIGH') {
            const redirectPath = `${prefix}/${c.item.slug}`;
            allRedirects[redirectPath] = canonicalPath;
          }
        }
      });
    });
  }

  // Ensure reports directory exists
  ensureDirExists('reports');

  // Write JSON redirects
  fs.writeFileSync('reports/slug-redirects.json', JSON.stringify(allRedirects, null, 2));
  console.log(`Wrote reports/slug-redirects.json containing ${Object.keys(allRedirects).length} redirects.`);

  // Write Markdown report
  let md = `# Duplicate Slug Audit Report

Generated on: ${new Date().toISOString()}
Total Duplicate Groups Found: ${allGroups.length}

## Summary Table

| Library | Primary / Canonical Slug | Duplicate Slugs Found | Group Confidence | Recommended Action |
| --- | --- | --- | --- | --- |
`;

  allGroups.sort((a, b) => a.type.localeCompare(b.type));

  allGroups.forEach(g => {
    const dups = g.candidates
      .filter(c => c.item.slug !== g.canonical.slug)
      .map(c => c.item.slug)
      .join(', ');

    // Determine group confidence (max confidence among matches)
    const confs = g.candidates
      .filter(c => c.item.slug !== g.canonical.slug)
      .map(c => {
        const match = g.matches.find(m => m.slug === c.item.slug);
        return match ? match.confidence : 'LOW';
      });
    
    let groupConf = 'LOW';
    if (confs.includes('HIGH')) groupConf = 'HIGH';
    else if (confs.includes('MEDIUM')) groupConf = 'MEDIUM';

    md += `| ${g.type} | \`${g.canonical.slug}\` | \`${dups}\` | **${groupConf}** | Redirect to canonical |\n`;
  });

  md += `\n## Detailed Duplicate Groups\n\n`;

  allGroups.forEach((g, idx) => {
    md += `### Group ${idx + 1}: ${g.canonical.name} (${g.type})\n\n`;
    md += `- **Recommended Canonical Slug**: \`${g.canonical.slug}\`\n`;
    md += `- **Candidates in Group**:\n`;

    g.candidates.forEach(c => {
      const isCanonical = c.item.slug === g.canonical.slug;
      const match = g.matches.find(m => m.slug === c.item.slug) || { confidence: 'HIGH', reason: 'Original base entry' };
      const details = isCanonical ? '(Canonical Recommended)' : `(Redirect recommended, Match Confidence: **${match.confidence}**, Reason: ${match.reason})`;
      md += `  - \`${g.prefix}/${c.item.slug}\` - Name: "${c.item.name}" - Completeness: ${(c.completeness * 100).toFixed(0)}% ${details}\n`;
    });
    md += `\n`;
  });

  fs.writeFileSync('reports/duplicate-slugs.md', md);
  console.log(`Wrote reports/duplicate-slugs.md.`);
}

runAudit();
