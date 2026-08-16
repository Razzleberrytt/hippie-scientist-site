import fs from 'fs';
import path from 'path';
import { evaluateProfileCompleteness } from '../../lib/profile-completeness.mjs';

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
  'boron|morin', 'morin|boron',
  'bacoside-a|bacoside-b', 'bacoside-b|bacoside-a',
  'baicalin|baicalein', 'baicalein|baicalin',
  'daidzin|daidzein', 'daidzein|daidzin',
  'crocin|crocetin', 'crocetin|crocin',
  'eleutheroside-b|eleutheroside-e', 'eleutheroside-e|eleutheroside-b',
  'atractylenolide-i|atractylenolide-ii', 'atractylenolide-ii|atractylenolide-i',
  'atractylenolide-i|atractylenolide-iii', 'atractylenolide-iii|atractylenolide-i',
  'atractylenolide-ii|atractylenolide-iii', 'atractylenolide-iii|atractylenolide-ii',
  'l-carnitine|acetyl-l-carnitine', 'acetyl-l-carnitine|l-carnitine',
  'caffeine|caffeine-l-theanine', 'caffeine-l-theanine|caffeine',
  'magnesium|electrolytes-magnesium-blend', 'electrolytes-magnesium-blend|magnesium',
]);

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function levenshtein(s1, s2) {
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[len1][len2];
}

function cleanName(name) {
  if (!name) return '';
  return name.replace(/\s*[([].*?[\])]\s*/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

function getScientificNames(name) {
  if (!name) return [];
  const matches = [...name.matchAll(/[([](.*?)[\])]/g)].map(m => m[1].trim().toLowerCase());
  return matches.filter(m => m.length > 2);
}

const genericWords = new Set(['extract', 'blend', 'complex', 'powder', 'root', 'berry', 'leaf', 'oil', 'standardized', 'capsule', 'tablet', 'form', 'use', 'sleep', 'active', 'aged']);
function getCoreWords(name) {
  return cleanName(name).split(/[\s-]+/).filter(w => w.length > 1 && !genericWords.has(w));
}

function runAudit() {
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

  console.log('--- Loading public/data/herbs.json and compounds.json ---');
  console.log('Herbs sample (first 3):');
  herbs.slice(0, 3).forEach(h => console.log(`  - Name: "${h.name}", Slug: "${h.slug}"`));
  console.log('Compounds sample (first 3):');
  compounds.slice(0, 3).forEach(c => console.log(`  - Name: "${c.name}", Slug: "${c.slug}"`));
  console.log('-----------------------------------------------------\n');

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

        if (clean1 === clean2 && clean1.length > 0) {
          isMatch = true;
          confidence = 'HIGH';
          reason = 'Exact name match';
        } else if (levenshtein(slug1, slug2) < 3) {
          isMatch = true;
          confidence = slug1.length > 5 ? 'HIGH' : 'MEDIUM';
          reason = `Slug Levenshtein distance = ${levenshtein(slug1, slug2)}`;
        } else if (
          scis1.some(s => s === clean2 || s === slug2 || s.replace(/\s+/g, '-') === slug2) ||
          scis2.some(s => s === clean1 || s === slug1 || s.replace(/\s+/g, '-') === slug1)
        ) {
          isMatch = true;
          confidence = 'HIGH';
          reason = 'Latin / Scientific name mapping match';
        } else {
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
          } else if (
            (core1.length > 0 && core1.every(w => core2.includes(w))) ||
            (core2.length > 0 && core2.every(w => core1.includes(w)))
          ) {
            isMatch = true;
            confidence = 'MEDIUM';
            reason = 'One name is subset of other name (e.g. extract / berry variation)';
          }
        }

        if (isMatch && DENY_REDIRECT_PAIRS.has(`${slug1}|${slug2}`)) isMatch = false;

        if (isMatch) {
          const mechanisms1 = new Set(item1.mechanisms || []);
          const mechanisms2 = new Set(item2.mechanisms || []);
          const effects1 = new Set(item1.effects || []);
          const effects2 = new Set(item2.effects || []);

          const hasDifferentMechanisms = mechanisms1.size > 0 && mechanisms2.size > 0 &&
            (![...mechanisms1].every(m => mechanisms2.has(m)) || ![...mechanisms2].every(m => mechanisms1.has(m)));
          const hasDifferentEffects = effects1.size > 0 && effects2.size > 0 &&
            (![...effects1].every(e => effects2.has(e)) || ![...effects2].every(e => effects1.has(e)));
          const hasDistinctEvidence = item1.evidence_tier && item2.evidence_tier &&
            item1.evidence_tier.toLowerCase().trim() !== item2.evidence_tier.toLowerCase().trim();
          const hasDistinctEvidenceGrade = item1.evidence_grade && item2.evidence_grade &&
            item1.evidence_grade.toLowerCase().trim() !== item2.evidence_grade.toLowerCase().trim();

          if (hasDifferentMechanisms || hasDifferentEffects || hasDistinctEvidence || hasDistinctEvidenceGrade) isMatch = false;
        }

        if (isMatch) {
          group.push(item2);
          matchDetails.push({ slug: item2.slug, confidence, reason });
        }
      }

      if (group.length > 1) {
        group.forEach(item => visited.add(item.slug));

        const candidates = group.map(item => {
          const completeness = evaluateProfileCompleteness(item, { interactionEdgesMap }).completeness;
          let score = 0;
          score += (25 - item.slug.length);
          if (!item.name.includes('(')) score += 10;
          if (item.sitemap_included === true || String(item.sitemap_included).toLowerCase() === 'true') score += 5;
          score += completeness * 15;
          return { item, score, completeness };
        });

        candidates.sort((a, b) => b.score - a.score);
        const canonical = candidates[0].item;

        groups.push({ type, prefix, canonical, candidates, matches: matchDetails });
      }
    }

    allGroups.push(...groups);

    groups.forEach(g => {
      const canonicalPath = `${prefix}/${g.canonical.slug}`;
      g.candidates.forEach(c => {
        if (c.item.slug !== g.canonical.slug) {
          const match = g.matches.find(m => m.slug === c.item.slug);
          const conf = match ? match.confidence : 'LOW';
          if (conf === 'HIGH') allRedirects[`${prefix}/${c.item.slug}`] = canonicalPath;
        }
      });
    });
  }

  ensureDirExists('reports');
  fs.writeFileSync('reports/slug-redirects.proposed.json', JSON.stringify(allRedirects, null, 2));
  console.log(`Wrote reports/slug-redirects.proposed.json containing ${Object.keys(allRedirects).length} redirects.`);

  let md = `# Duplicate Slug Audit Report\n\nGenerated on: ${new Date().toISOString()}\nTotal Duplicate Groups Found: ${allGroups.length}\n\n## Summary Table\n\n| Library | Primary / Canonical Slug | Duplicate Slugs Found | Group Confidence | Recommended Action |\n| --- | --- | --- | --- | --- |\n`;

  allGroups.sort((a, b) => a.type.localeCompare(b.type));

  allGroups.forEach(g => {
    const dups = g.candidates.filter(c => c.item.slug !== g.canonical.slug).map(c => c.item.slug).join(', ');
    const confs = g.candidates.filter(c => c.item.slug !== g.canonical.slug).map(c => {
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
  console.log('Wrote reports/duplicate-slugs.md.');
}

runAudit();
