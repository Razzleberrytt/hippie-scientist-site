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

  if (!fs.existsSync(workbookPath)) {
    console.error(`Error: Workbook not found at ${workbookPath}`);
    process.exit(1);
  }

  // Load workbook data
  console.log(`Loading sheet 'Herb Master V3' from ${workbookPath}...`);
  const rows = await getSheetData(workbookPath, 'Herb Master V3');

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
      // If second part is typical botanical term, or not common English
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

      // Match condition 1: Normalized common names are identical
      if (herb1.normalizedName && herb1.normalizedName === herb2.normalizedName) {
        isMatch = true;
      }
      // Match condition 2: Latin slug of herb1 matches slug of herb2
      else if (herb1.latinSlug && herb1.latinSlug === herb2.slug) {
        isMatch = true;
      }
      // Match condition 3: Latin slug of herb2 matches slug of herb1
      else if (herb2.latinSlug && herb2.latinSlug === herb1.slug) {
        isMatch = true;
      }
      // Match condition 4: Common slug of one matches slug of another
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

  // Step 3: Process groups to determine common name, scientific name, and new composite slug
  const processedGroups = groups.map(group => {
    // Find best common name
    let bestCommon = '';
    let bestLatin = '';

    group.forEach(h => {
      if (!bestCommon || (h.commonName && h.commonName.length < bestCommon.length)) {
        bestCommon = h.commonName;
      }
      if (h.latinName) {
        bestLatin = h.latinName;
      }
    });

    // Fallback if no latin name found
    if (!bestLatin) {
      // check if any slug contains known Latin patterns
      group.forEach(h => {
        if (h.slug.includes('-') && h.slug !== bestCommon.toLowerCase()) {
          bestLatin = h.slug.replace(/-/g, ' ');
        }
      });
    }

    const commonSlug = slugify(bestCommon);
    const latinSlug = bestLatin ? slugify(bestLatin) : '';

    let compositeSlug = commonSlug;
    if (latinSlug && commonSlug !== latinSlug) {
      // Check if commonSlug already ends with latinSlug or has it
      if (!commonSlug.includes(latinSlug)) {
        compositeSlug = `${commonSlug}-${latinSlug}`;
      }
    }

    return {
      items: group,
      commonSlug,
      latinSlug,
      compositeSlug
    };
  });

  // Step 4: Map sitemap slugs to composite slugs & generate redirect map
  const redirectMap = {};
  const mappedResults = [];
  const sitemapOrphans = [];

  // Sort groups by compositeSlug to be deterministic
  processedGroups.sort((a, b) => a.compositeSlug.localeCompare(b.compositeSlug));

  // We want to generate redirects from any legacy slug in the group to the composite slug,
  // ONLY if they are different from the composite slug!
  processedGroups.forEach(group => {
    const targetPath = `/herbs/${group.compositeSlug}`;
    
    // Legacy slugs inside this group
    const legacySlugs = new Set();
    group.items.forEach(item => {
      legacySlugs.add(item.slug);
      if (item.commonSlug) legacySlugs.add(item.commonSlug);
      if (item.latinSlug) legacySlugs.add(item.latinSlug);
    });

    const matchedSitemapSlugs = [];
    legacySlugs.forEach(slug => {
      if (slug !== group.compositeSlug) {
        redirectMap[`/herbs/${slug}`] = targetPath;
      }
      if (sitemapSlugs.has(slug)) {
        matchedSitemapSlugs.push(slug);
      }
    });

    mappedResults.push({
      compositeSlug: group.compositeSlug,
      legacySlugs: Array.from(legacySlugs),
      sitemapMatches: matchedSitemapSlugs,
      workbookRows: group.items.map(h => `Row ${h.originalRowIndex} (${h.slug})`).join(', ')
    });
  });

  // Identify sitemap slugs that were NOT mapped to any group
  sitemapSlugs.forEach(slug => {
    let found = false;
    processedGroups.forEach(group => {
      const legacySlugs = new Set(group.items.flatMap(item => [item.slug, item.commonSlug, item.latinSlug]));
      if (legacySlugs.has(slug) || group.compositeSlug === slug) {
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
- **De-duplicated Herb Groups**: ${processedGroups.length}
- **Sitemap Herb Slugs Evaluated**: ${sitemapSlugs.size}
- **Mapped High-Confidence Redirect Rules**: ${Object.keys(redirectMap).length}
- **Orphaned Sitemap Slugs (Unmatched)**: ${sitemapOrphans.length}

## Mapped Duplicate Groups & Composite Slugs

| Target Composite Slug | Legacy Slugs | Sitemap Matches | Source Rows |
| --- | --- | --- | --- |
`;

  mappedResults.forEach(r => {
    md += `| **\`${r.compositeSlug}\`** | ${r.legacySlugs.map(s => `\`${s}\``).join(', ')} | ${r.sitemapMatches.map(s => `\`${s}\``).join(', ') || '*None*'} | ${r.workbookRows} |\n`;
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
