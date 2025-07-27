const fs = require('fs/promises');
const path = require('path');

async function copyHerbFile() {
  const src = path.join(process.cwd(), 'herbs_enriched_converted.ts');
  const dest = path.join(process.cwd(), 'src', 'data', 'herbs', 'herbsfull.ts');
  try {
    await fs.mkdir(path.dirname(dest), { recursive: true });
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

const herbImportPattern = /import\s+([\s\S]*?)\s+from\s+['"]([^'"]*herbs[^'"]*)['"];?/gm;

async function updateImports() {
  const targetDirs = ['src/hooks', 'src/components', 'src/pages'];
  const destPath = path.join('src', 'data', 'herbs', 'herbsfull');
  let scanned = 0;
  let modified = 0;

  for (const dir of targetDirs) {
    const files = await collectFiles(dir);
    for (const file of files) {
      scanned++;
      let text;
      try {
        text = await fs.readFile(file, 'utf8');
      } catch (err) {
        console.error(`Failed to read ${file}: ${err.message}`);
        continue;
      }
      if (!herbImportPattern.test(text)) {
        continue;
      }
      herbImportPattern.lastIndex = 0; // reset regex
      const relative = path.relative(path.dirname(file), destPath).replace(/\\/g, '/');
      const finalPath = relative.startsWith('.') ? relative : './' + relative;
      const updated = text.replace(herbImportPattern, (match, specifiers) => `import ${specifiers} from '${finalPath}'`);
      if (updated !== text) {
        try {
          await fs.writeFile(file, updated);
          modified++;
          console.log(`Updated imports in ${file}`);
        } catch (err) {
          console.error(`Failed to write ${file}: ${err.message}`);
        }
      }
    }
  }

  console.log(`Scanned ${scanned} files. Modified ${modified} files.`);
}

async function run() {
  await copyHerbFile();
  await updateImports();
}

run().catch(err => {
  console.error('Unexpected error:', err);
});
