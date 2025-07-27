const fs = require('fs/promises');
const path = require('path');

async function copyHerbFile() {
  const src = path.join(process.cwd(), 'herbs_enriched_converted.ts');
  const dest = path.join(process.cwd(), 'src', 'data', 'herbs', 'herbsfull.ts');
  try {
    await fs.copyFile(src, dest);
    console.log(`Copied ${src} to ${dest}`);
  } catch (err) {
    console.error(`Failed to copy file: ${err.message}`);
  }
}

async function collectFiles(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    console.error(`Failed to read directory ${dir}: ${err.message}`);
    return [];
  }
  const files = await Promise.all(entries.map(async entry => {
    const res = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return await collectFiles(res);
    }
    if (res.endsWith('.ts') || res.endsWith('.tsx')) {
      return res;
    }
    return null;
  }));
  return files.flat().filter(Boolean);
}

function getHerbImportRegex() {
  return /from\s+(['"])[^'"\n]*herbs_enriched(?:\.ts)?\1/g;
}

async function updateImports() {
  const targets = ['src/hooks', 'src/components'];
  const destPath = path.join('src', 'data', 'herbs', 'herbsfull');
  let changedFiles = [];

  for (const dir of targets) {
    const files = await collectFiles(dir);
    for (const file of files) {
      let text;
      try {
        text = await fs.readFile(file, 'utf8');
      } catch (err) {
        console.error(`Failed to read ${file}: ${err.message}`);
        continue;
      }
      const regex = getHerbImportRegex();
      if (!regex.test(text)) {
        continue;
      }
      const relative = path.relative(path.dirname(file), destPath).replace(/\\/g, '/');
      const finalPath = relative.startsWith('.') ? relative : './' + relative;
      const updated = text.replace(regex, (_m, quote) => `from ${quote}${finalPath}${quote}`);
      try {
        await fs.writeFile(file, updated);
        changedFiles.push(file);
        console.log(`Updated imports in ${file}`);
      } catch (err) {
        console.error(`Failed to write ${file}: ${err.message}`);
      }
    }
  }
  console.log(`Import updates complete. Files changed: ${changedFiles.length}`);
}

async function run() {
  await copyHerbFile();
  await updateImports();
}

run().catch(err => {
  console.error('Unexpected error:', err);
});
