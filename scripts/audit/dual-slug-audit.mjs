import fs from 'fs';
import path from 'path';
import { getSheetData } from '../utils/read-workbook-exceljs.mjs';

function slugify(text) {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/[’'""`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalize(text) {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/[’'""`]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractParentheses(text) {
  if (!text) return null;
  const match = text.match(/\(([^)]+)\)/);
  return match ? match[1].trim() : null;
}

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function run() {
  const workbookPath = 'data-sources/herb_monograph_master.xlsx';
  const sitemapPath = 'out/sitemap.xml';
  const herbsJsonPath = 'public/data/herbs.json';

  if (!fs.existsSync(workbookPath)) {
    console.error(`Error: Workbook not found at ${workbookPath}`);
    process.exit(1);
  }

  // Load workbook data
  console.log(`Loading sheet 'Herb Master V3' from ${workbookPath}...`);
  const rows = await getSheetData(workbookPath, 'Herb Master V3');

  // Load public herbs JSON to calculate completeness of existing profiles
  let herbsJson = [];
  if (fs.existsSync(herbsJsonPath)) {
    herbsJson = JSON.parse(fs.readFileSync(herbsJsonPath, 'utf8'));
  }
  const herbsJsonMap = new Map(herbsJson.map(h => [h.slug, h]));

  const checkSafety = (val) => {
    if (!val) return false;
    const s = String(val).toLowerCase();
    return !['needs review', 'safety review pending', 'placeholder', 'pending'].some(p => s.includes(p));
  };
  const checkDescription = (val) => {
    if (!val) return false;
    const s = String(val).toLowerCase();
    return s.length >= 15 && !['evidence-aware', 'needs review', 'placeholder'].some(p => s.includes(p));
  };
  const checkBestFor = (val) => {
    if (!val) return false;
    const s = String(val).toLowerCase();
    return !['research pending', 'research_only', 'placeholder'].some(p => s.includes(p));
  };
  const getCompleteness = (slug) => {
    const h = herbsJsonMap.get(slug);
    if (!h) return -1; // doesn't exist
    let filled = 0;
    if (checkDescription(h.description || h.summary)) filled++;
    if (checkSafety(h.safety)) filled++;
    if (h.evidence_tier || h.evidence_grade) filled++;
    if (h.canonical_mechanisms && h.canonical_mechanisms.length > 0) filled++;
    if (checkBestFor(h.effects || h.primary_effects)) filled++;
    if (h.dosage || h.typical_dosage) filled++;
    if (h.interactions && h.interactions.length > 0) filled++;
    return filled / 7;
  };

  // Load sitemap URLs
  let sitemapUrls = [];
  if (fs.existsSync(sitemapPath)) {
    console.log(`Reading sitemap from ${sitemapPath}...`);
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    sitemapUrls = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  } else if (fs.existsSync('public/sitemap.xml')) {
    console.log(`Reading sitemap from public/sitemap.xml...`);
    const sitemapContent = fs.readFileSync('public/sitemap.xml', 'utf8');
    sitemapUrls = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  } else {
    console.warn('Warning: sitemap.xml not found. Using empty sitemap.');
  }

  const sitemapSlugs = new Set();
  sitemapUrls.forEach(url => {
    const match = url.match(/\/herbs\/([^/]+)/);
    if (match && match[1]) {
      sitemapSlugs.add(match[1]);
    }
  });

  console.log(`Found ${sitemapSlugs.size} herb slugs in sitemap.`);

  // Step 1: Parse workbook rows into normalized Herb info
  const herbs = [];
  rows.forEach((row, idx) => {
    const rawSlug = String(row.slug || '').trim();
    if (!rawSlug) return;

    const rawName = String(row.name || '').trim();
    const parenthetical = extractParentheses(rawName);
    
    let commonName = rawName;
    let latinName = String(row.latin_name || '').trim();

    if (parenthetical) {
      commonName = rawName.replace(/\([^)]+\)/, '').trim();
      latinName = parenthetical;
    }

    // Heuristics for latin name detection from slug if not set
    if (!latinName && rawSlug.includes('-')) {
      const parts = rawSlug.split('-');
      const botanicalWords = ['sativum', 'erinaceus', 'lucidum', 'chamomilla', 'officinale', 'somnifera', 'monnieri', 'rosea', 'sinensis', 'vulgaris', 'odorata'];
      if (botanicalWords.includes(parts[parts.length - 1])) {
        latinName = parts.join(' ');
      }
    }

    herbs.push({
      originalRowIndex: idx + 2,
      slug: rawSlug,
      name: rawName,
      commonName,
      latinName,
      commonSlug: slugify(commonName),
      latinSlug: latinName ? slugify(latinName) : '',
      normalizedName: normalize(commonName)
    });
  });

  // Step 2: Group duplicates based on name/slug matching
  const groups = [];
  const visitedIndices = new Set();

  for (let i = 0; i < herbs.length; i++) {
    if (visitedIndices.has(i)) continue;

    const herb1 = herbs[i];
    const group = [herb1];
    visitedIndices.add(i);

    for (let j = i + 1; j < herbs.length; j++) {
      if (visitedIndices.has(j)) continue;

      const herb2 = herbs[j];
      let isMatch = false;

      if (herb1.normalizedName && herb1.normalizedName === herb2.normalizedName) {
        isMatch = true;
      }
      else if (herb1.latinSlug && herb1.latinSlug === herb2.slug) {
        isMatch = true;
      }
      else if (herb2.latinSlug && herb2.latinSlug === herb1.slug) {
        isMatch = true;
      }
      else if (herb1.commonSlug && herb1.commonSlug === herb2.slug) {
        isMatch = true;
      }
      else if (herb2.commonSlug && herb2.commonSlug === herb1.slug) {
        isMatch = true;
      }

      if (isMatch) {
        group.push(herb2);
        visitedIndices.add(j);
      }
    }

    groups.push(group);
  }

  // Step 3: Process groups to determine canonical and redirect mapping
  const redirectMap = {};
  const mappedResults = [];
  const sitemapOrphans = [];

  // Sort groups deterministically by their first item's slug
  groups.sort((a, b) => a[0].slug.localeCompare(b[0].slug));

  groups.forEach(group => {
    const DEPRECATED_HERB_CANONICALS = {
      'allium-sativum': 'garlic',
      'valeriana-officinalis': 'valerian',
      'hericium-erinaceus': 'lions-mane',
      'passiflora-incarnata': 'passionflower',
      'piper-methysticum': 'kava',
      'ganoderma-lucidum': 'reishi',
      'hypericum-perforatum': 'st-johns-wort',
      'silybum-marianum': 'milk-thistle',
    };

    let forceSlug = '';
    group.forEach(item => {
      if (DEPRECATED_HERB_CANONICALS[item.slug]) {
        forceSlug = DEPRECATED_HERB_CANONICALS[item.slug];
      }
    });

    let bestSlug = '';
    if (forceSlug) {
      bestSlug = forceSlug;
    } else {
      let bestScore = -2;
      group.forEach(item => {
        const score = getCompleteness(item.slug);
        if (score > bestScore) {
          bestScore = score;
          bestSlug = item.slug;
        }
      });
      if (!bestSlug) {
        bestSlug = group[0].slug;
      }
    }

    const targetPath = `/herbs/${bestSlug}`;
    
    // Legacy slugs inside this group
    const legacySlugs = new Set();
    group.forEach(item => {
      legacySlugs.add(item.slug);
      if (item.commonSlug) legacySlugs.add(item.commonSlug);
      if (item.latinSlug) legacySlugs.add(item.latinSlug);
    });

    const matchedSitemapSlugs = [];
    legacySlugs.forEach(slug => {
      if (slug !== bestSlug) {
        redirectMap[`/herbs/${slug}`] = targetPath;
      }
      if (sitemapSlugs.has(slug)) {
        matchedSitemapSlugs.push(slug);
      }
    });

    mappedResults.push({
      canonicalSlug: bestSlug,
      legacySlugs: Array.from(legacySlugs),
      sitemapMatches: matchedSitemapSlugs,
      workbookRows: group.map(h => `Row ${h.originalRowIndex} (${h.slug})`).join(', ')
    });
  });

  // Identify sitemap slugs that were NOT mapped to any group
  sitemapSlugs.forEach(slug => {
    let found = false;
    groups.forEach(group => {
      const legacySlugs = new Set(group.flatMap(item => [item.slug, item.commonSlug, item.latinSlug]));
      if (legacySlugs.has(slug)) {
        found = true;
      }
    });
    if (!found) {
      sitemapOrphans.push(slug);
    }
  });

  // Ensure reports dir exists
  ensureDirExists('reports');

  // Write reports/slug-redirect-map.json
  fs.writeFileSync('reports/slug-redirect-map.json', JSON.stringify(redirectMap, null, 2));
  console.log(`Wrote reports/slug-redirect-map.json with ${Object.keys(redirectMap).length} mappings.`);

  // Generate dual-slug-map.md
  let md = `# Dual Slug Reconciler Audit Report

Generated on: ${new Date().toISOString()}

## Summary Statistics

- **Total Workbook Profiles Processed**: ${herbs.length}
- **De-duplicated Herb Groups**: ${groups.length}
- **Sitemap Herb Slugs Evaluated**: ${sitemapSlugs.size}
- **Mapped High-Confidence Redirect Rules**: ${Object.keys(redirectMap).length}
- **Orphaned Sitemap Slugs (Unmatched)**: ${sitemapOrphans.length}

## Mapped Duplicate Groups & Canonical Targets

| Target Canonical Slug | Legacy Slugs | Sitemap Matches | Source Rows |
| --- | --- | --- | --- |
`;

  mappedResults.forEach(r => {
    md += `| **\`${r.canonicalSlug}\`** | ${r.legacySlugs.map(s => `\`${s}\``).join(', ')} | ${r.sitemapMatches.map(s => `\`${s}\``).join(', ') || '*None*'} | ${r.workbookRows} |\n`;
  });

  md += `\n## Orphaned Sitemap Slugs\n\n`;
  if (sitemapOrphans.length > 0) {
    md += `These herb slugs were found in the sitemap but could not be matched to any workbook profile group:\n\n`;
    sitemapOrphans.forEach(slug => {
      md += `- \`${slug}\`\n`;
    });
  } else {
    md += `*None! All sitemap slugs successfully mapped to a workbook group.*\n`;
  }

  fs.writeFileSync('reports/dual-slug-map.md', md);
  console.log(`Wrote reports/dual-slug-map.md.`);
}

run().catch(console.error);
