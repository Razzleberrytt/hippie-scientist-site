import fs from 'fs';
import path from 'path';

function runGenerateRedirects() {
  const jsonPath = 'reports/slug-redirects.json';
  const redirectsPath = 'public/_redirects';

  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: Duplicate slug redirect map "${jsonPath}" is missing.`);
    console.error('Please run the duplicate slug audit first: npm run audit:duplicates');
    process.exit(1);
  }

  const newRedirects = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let existingContent = '';
  if (fs.existsSync(redirectsPath)) {
    existingContent = fs.readFileSync(redirectsPath, 'utf8');
  }

  // Parse existing redirects
  const existingLines = existingContent.split(/\r?\n/);
  
  // Extract all existing source paths (normalized) to avoid duplicate redirects for the same path
  const existingSources = new Set();
  const existingRules = new Set();

  existingLines.forEach(line => {
    const cleanLine = line.trim();
    if (!cleanLine || cleanLine.startsWith('#')) return;
    
    // Split by whitespace
    const parts = cleanLine.split(/\s+/);
    if (parts.length >= 2) {
      const from = parts[0].toLowerCase();
      const to = parts[1].toLowerCase();
      existingSources.add(from);
      existingRules.add(`${from} ${to}`);
    }
  });

  const rulesToAdd = [];
  let addedCount = 0;
  let existedCount = 0;
  let skippedCount = 0;

  // Process each redirect in JSON
  for (const [fromPath, toPath] of Object.entries(newRedirects)) {
    const cleanFrom = fromPath.endsWith('/') ? fromPath.slice(0, -1) : fromPath;
    const cleanTo = toPath.endsWith('/') ? toPath.slice(0, -1) : toPath;

    const cases = [
      { from: cleanFrom, to: cleanTo },
      { from: `${cleanFrom}/`, to: `${cleanTo}/` }
    ];

    cases.forEach(({ from, to }) => {
      const ruleKey = `${from.toLowerCase()} ${to.toLowerCase()}`;
      const sourceKey = from.toLowerCase();

      if (existingRules.has(ruleKey)) {
        existedCount++;
      } else if (existingSources.has(sourceKey)) {
        skippedCount++;
        console.log(`Skipped: Source path "${from}" is already redirected in _redirects (likely to another target).`);
      } else {
        rulesToAdd.push(`${from} ${to} 301`);
        addedCount++;
        // Add to our sets to prevent adding duplicates within this run
        existingSources.add(sourceKey);
        existingRules.add(ruleKey);
      }
    });
  }

  if (rulesToAdd.length > 0) {
    let newContent = existingContent;
    if (!newContent.endsWith('\n') && newContent.length > 0) {
      newContent += '\n';
    }
    
    newContent += '\n# AUTO-GENERATED DUPLICATE SLUG REDIRECTS\n';
    newContent += rulesToAdd.join('\n') + '\n';

    fs.writeFileSync(redirectsPath, newContent);
    console.log(`Successfully updated "${redirectsPath}".`);
  } else {
    console.log(`No new redirects needed to be added to "${redirectsPath}".`);
  }

  console.log('--- Redirect Generator Summary ---');
  console.log(`  Added:           ${addedCount} redirect rules`);
  console.log(`  Already existed: ${existedCount} rules`);
  console.log(`  Skipped:         ${skippedCount} source collisions`);
  console.log('----------------------------------');
}

runGenerateRedirects();
