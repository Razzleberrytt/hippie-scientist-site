import fs from 'fs';
import path from 'path';

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function run() {
  const mapPath = 'reports/slug-redirect-map.json';
  const redirectsPath = 'public/_redirects';

  if (!fs.existsSync(mapPath)) {
    console.error(`Error: Redirect map not found at ${mapPath}. Run dual-slug-audit first.`);
    process.exit(1);
  }

  if (!fs.existsSync(redirectsPath)) {
    console.error(`Error: Redirects file not found at ${redirectsPath}`);
    process.exit(1);
  }

  const redirectMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  let redirectsContent = fs.readFileSync(redirectsPath, 'utf8');

  // Truncate any previous SYSTEM SLUG DE-DUPLICATION REDIRECTS or AUTO-GENERATED sections
  const indexSystem = redirectsContent.indexOf('# SYSTEM SLUG DE-DUPLICATION REDIRECTS');
  const indexAuto = redirectsContent.indexOf('# AUTO-GENERATED DUPLICATE SLUG REDIRECTS');
  let sectionHeaderIndex = -1;
  if (indexSystem !== -1 && indexAuto !== -1) {
    sectionHeaderIndex = Math.min(indexSystem, indexAuto);
  } else if (indexSystem !== -1) {
    sectionHeaderIndex = indexSystem;
  } else if (indexAuto !== -1) {
    sectionHeaderIndex = indexAuto;
  }
  if (sectionHeaderIndex !== -1) {
    console.log('Truncating previous system slug de-duplication redirects section...');
    redirectsContent = redirectsContent.substring(0, sectionHeaderIndex).trim() + '\n';
    fs.writeFileSync(redirectsPath, redirectsContent, 'utf8');
  }

  // Split into lines and normalize whitespace to easily check for existing lines in the cleaned file
  const existingRules = new Set(
    redirectsContent.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => line.replace(/\s+/g, ' '))
  );

  let addedCount = 0;
  let skippedCount = 0;
  const newLines = [];

  // Sort keys to have deterministic output order
  const sortedKeys = Object.keys(redirectMap).sort();

  sortedKeys.forEach(oldPath => {
    const newPath = redirectMap[oldPath];

    // Normalize paths to remove any trailing slashes for clean formatting
    const cleanOld = oldPath.replace(/\/+$/, '');
    const cleanNew = newPath.replace(/\/+$/, '');

    // Form both non-trailing-slash and trailing-slash rules
    const rules = [
      { rule: `${cleanOld} ${cleanNew} 301` },
      { rule: `${cleanOld}/ ${cleanNew}/ 301` }
    ];

    rules.forEach(({ rule }) => {
      if (existingRules.has(rule)) {
        skippedCount++;
      } else {
        newLines.push(rule);
        addedCount++;
      }
    });
  });

  if (newLines.length > 0) {
    // Append a section header
    const header = `\n# SYSTEM SLUG DE-DUPLICATION REDIRECTS (Generated ${new Date().toLocaleDateString()})\n`;
    const appendContent = header + newLines.join('\n') + '\n';
    fs.appendFileSync(redirectsPath, appendContent, 'utf8');
    console.log(`Successfully appended ${newLines.length} new redirect rules to ${redirectsPath}.`);
  } else {
    console.log('No new redirect rules needed. All rules are already present.');
  }

  console.log(`Summary stats:`);
  console.log(`  - Total mappings evaluated: ${Object.keys(redirectMap).length * 2} rules`);
  console.log(`  - Rules skipped (already exist): ${skippedCount}`);
  console.log(`  - Rules added: ${addedCount}`);
}

run();
