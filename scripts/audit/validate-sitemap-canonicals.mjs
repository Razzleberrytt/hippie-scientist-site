import fs from 'fs';
import path from 'path';
import https from 'https';

// Helper to ensure directory exists
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Helper to fetch live sitemap with a timeout
function fetchSitemap(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { timeout: 5000 }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch sitemap: HTTP ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    });
    
    request.on('error', (err) => { reject(err); });
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Sitemap fetch request timed out'));
    });
  });
}

// Helper to check URL status code
function checkUrlStatus(url) {
  return new Promise((resolve) => {
    const request = https.get(url, { timeout: 3000 }, (res) => {
      resolve({ url, status: res.statusCode, error: null });
    });
    
    request.on('error', (err) => {
      resolve({ url, status: null, error: err.message });
    });
    
    request.on('timeout', () => {
      request.destroy();
      resolve({ url, status: null, error: 'Timed out' });
    });
  });
}

async function runSitemapAudit() {
  const liveSitemapUrl = 'https://www.thehippiescientist.net/sitemap.xml';
  const localSitemapPath = 'out/sitemap.xml';
  const herbsPath = 'public/data/herbs.json';
  const compoundsPath = 'public/data/compounds.json';

  let sitemapContent = '';
  let source = 'live';

  console.log(`Attempting to fetch live sitemap from ${liveSitemapUrl}...`);
  try {
    sitemapContent = await fetchSitemap(liveSitemapUrl);
    console.log('Successfully fetched live sitemap.');
  } catch (err) {
    console.warn(`Warning: Live sitemap fetch failed (${err.message}). Falling back to local ${localSitemapPath}...`);
    if (fs.existsSync(localSitemapPath)) {
      sitemapContent = fs.readFileSync(localSitemapPath, 'utf8');
      source = 'local';
      console.log('Successfully loaded local sitemap.');
    } else {
      console.error(`Error: Local sitemap ${localSitemapPath} is also missing. Cannot continue.`);
      process.exit(1);
    }
  }

  // Parse all <loc> entries
  const locRegex = /<loc>(.*?)<\/loc>/g;
  const urls = [];
  let match;
  while ((match = locRegex.exec(sitemapContent)) !== null) {
    urls.push(match[1]);
  }

  console.log(`Found ${urls.length} URLs in the sitemap.`);

  if (urls.length === 0) {
    console.error('Error: No URLs found in sitemap content.');
    process.exit(1);
  }

  // Check canonical domains (www vs non-www)
  let wwwCount = 0;
  let nonWwwCount = 0;
  let otherDomainsCount = 0;

  urls.forEach(u => {
    if (u.startsWith('https://www.thehippiescientist.net')) {
      wwwCount++;
    } else if (u.startsWith('https://thehippiescientist.net')) {
      nonWwwCount++;
    } else {
      otherDomainsCount++;
    }
  });

  const wwwPct = ((wwwCount / urls.length) * 100).toFixed(1);
  const nonWwwPct = ((nonWwwCount / urls.length) * 100).toFixed(1);
  const otherPct = ((otherDomainsCount / urls.length) * 100).toFixed(1);

  // Sample 20 random URLs and fetch them
  const shuffled = [...urls].sort(() => 0.5 - Math.random());
  const sampleSize = Math.min(20, shuffled.length);
  const sampledUrls = shuffled.slice(0, sampleSize);

  console.log(`Sampling and fetching status codes for ${sampleSize} random URLs...`);
  const statusResults = [];
  for (const sUrl of sampledUrls) {
    const res = await checkUrlStatus(sUrl);
    statusResults.push(res);
  }

  // Cross-reference sitemap slugs with JSON data
  if (!fs.existsSync(herbsPath) || !fs.existsSync(compoundsPath)) {
    console.error('Error: Required JSON files public/data/herbs.json or compounds.json are missing.');
    process.exit(1);
  }

  const herbs = JSON.parse(fs.readFileSync(herbsPath, 'utf8'));
  const compounds = JSON.parse(fs.readFileSync(compoundsPath, 'utf8'));

  const herbSlugs = new Set(herbs.map(h => h.slug));
  const compoundSlugs = new Set(compounds.map(c => c.slug));

  const sitemapHerbs = new Set();
  const sitemapCompounds = new Set();

  urls.forEach(u => {
    try {
      const parsedUrl = new URL(u);
      const parts = parsedUrl.pathname.split('/').filter(Boolean);
      if (parts[0] === 'herbs' && parts[1]) {
        sitemapHerbs.add(parts[1]);
      } else if (parts[0] === 'compounds' && parts[1]) {
        sitemapCompounds.add(parts[1]);
      }
    } catch (e) {
      console.warn(`Warning: Invalid URL in sitemap: ${u}`);
    }
  });

  // Identify orphaned sitemap entries (in sitemap but not in data)
  const orphanedHerbs = [...sitemapHerbs].filter(slug => !herbSlugs.has(slug));
  const orphanedCompounds = [...sitemapCompounds].filter(slug => !compoundSlugs.has(slug));

  // Identify missing sitemap entries (in data but not in sitemap)
  // Wait, does sitemap_included control if it should be in sitemap?
  // Yes, the JSON data has a field `sitemap_included`. Let's check against both all database entries and sitemap_included eligible ones.
  const missingHerbs = [...herbSlugs].filter(slug => {
    const herbObj = herbs.find(h => h.slug === slug);
    const eligible = herbObj ? herbObj.sitemap_included !== false : true;
    return eligible && !sitemapHerbs.has(slug);
  });
  
  const missingCompounds = [...compoundSlugs].filter(slug => {
    const compObj = compounds.find(c => c.slug === slug);
    const eligible = compObj ? compObj.sitemap_included !== false : true;
    return eligible && !sitemapCompounds.has(slug);
  });

  const brokenUrls = statusResults.filter(r => r.status !== 200);

  // Generate sitemap-audit.md report
  let md = `# Sitemap Canonical Validation Report

Generated on: ${new Date().toISOString()}
Sitemap Source: ${source === 'live' ? `Live URL (${liveSitemapUrl})` : `Local Fallback (${localSitemapPath})`}

## Canonical Domain Analysis

- **Total URLs Analyzed**: ${urls.length}
- **WWW Canonical (\`https://www.thehippiescientist.net\`)**: ${wwwCount} URLs (${wwwPct}%)
- **Non-WWW Canonical (\`https://thehippiescientist.net\`)**: ${nonWwwCount} URLs (${nonWwwPct}%)
- **Other/Mixed Domains**: ${otherDomainsCount} URLs (${otherPct}%)

*Recommendation: Standardize on WWW canonicals across the entire sitemap (100% split).*

## URL Accessibility Sampling (Sample Size: ${sampleSize})

We fetched ${sampleSize} random URLs from the sitemap. Here are the status codes:

| URL | Status | Error Details / Warning |
| --- | --- | --- |
`;

  statusResults.forEach(r => {
    const statusText = r.status ? `HTTP ${r.status}` : '**FAILED**';
    const errText = r.error ? `Connection Error: ${r.error}` : (r.status === 200 ? 'OK' : 'Non-200 Response');
    md += `| \`${r.url}\` | ${statusText} | ${errText} |\n`;
  });

  md += `
### Accessibility Summary
- **Successful (HTTP 200)**: ${statusResults.filter(r => r.status === 200).length} / ${sampleSize}
- **Broken / Non-200**: ${brokenUrls.length} / ${sampleSize}

## Cross-Reference & Indexability Audit

### Orphaned Sitemap Entries
These are slugs found in the sitemap under \`/herbs/\` or \`/compounds/\` but are missing from \`herbs.json\` or \`compounds.json\`.

- **Orphaned Herbs** (${orphanedHerbs.length}): ${orphanedHerbs.length > 0 ? orphanedHerbs.map(s => `\`${s}\``).join(', ') : '*None*'}
- **Orphaned Compounds** (${orphanedCompounds.length}): ${orphanedCompounds.length > 0 ? orphanedCompounds.map(s => `\`${s}\``).join(', ') : '*None*'}

### Missing Sitemap Entries
These are active slugs found in \`herbs.json\` or \`compounds.json\` (where sitemap eligibility is enabled) but are missing from the sitemap.

- **Missing Herbs** (${missingHerbs.length}): ${missingHerbs.length > 0 ? missingHerbs.map(s => `\`${s}\``).join(', ') : '*None*'}
- **Missing Compounds** (${missingCompounds.length}): ${missingCompounds.length > 0 ? missingCompounds.map(s => `\`${s}\``).join(', ') : '*None*'}

`;

  ensureDirExists('reports');
  fs.writeFileSync('reports/sitemap-audit.md', md);
  console.log('Wrote reports/sitemap-audit.md.');
}

runSitemapAudit();
