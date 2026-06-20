import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p: string) => fs.existsSync(path.join(root, p));

const pageFilePattern = /^page\.(tsx|ts|jsx|js)$/;
const errors: string[] = [];
const warnings: string[] = [];

// Helper to collect files recursively
function collectFiles(dir: string, matcher: ((name: string) => boolean) | null = null): string[] {
  const absDir = path.join(root, dir);
  if (!fs.existsSync(absDir)) return [];

  const files: string[] = [];

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!entry.isFile()) continue;

      if (matcher && !matcher(entry.name)) continue;

      files.push(path.relative(root, fullPath).split(path.sep).join('/'));
    }
  }

  walk(absDir);
  return files;
}

// 1. Scan app pages
const pageFiles = collectFiles('app', (name) => pageFilePattern.test(name));

const isExemptRoute = (filePath: string) => {
  const normalizedPath = filePath.toLowerCase();
  return (
    normalizedPath.includes('/admin/') ||
    normalizedPath.includes('/api/') ||
    normalizedPath.includes('/drafts/') ||
    normalizedPath.includes('/preview/') ||
    normalizedPath.includes('[style]') // category/style routes are handled dynamically or noindex
  );
};

console.log(`Checking ${pageFiles.length} pages for metadata coverage...`);

for (const file of pageFiles) {
  if (isExemptRoute(file)) continue;

  const content = read(file);
  const hasMetadata =
    content.includes('export const metadata') ||
    content.includes('export async function generateMetadata') ||
    content.includes('export function generateMetadata') ||
    content.includes('buildPageMetadata(') ||
    content.includes('generateDetailMetadata(');

  if (!hasMetadata) {
    errors.push(`Page missing metadata or generateMetadata export: ${file}`);
  }
}

// 2. Validate canonical URLs in page metadata (should end with trailing slash)
console.log('Checking canonical URLs in page.tsx files...');
const canonicalRegex = /canonical\s*:\s*(['"`])([^'"`\s\+]+)(['"`])/g;

for (const file of pageFiles) {
  if (isExemptRoute(file)) continue;

  const content = read(file);
  let match;
  while ((match = canonicalRegex.exec(content)) !== null) {
    const val = match[2];
    if (val !== '/' && !val.endsWith('/') && !val.includes('$') && !val.includes('{') && !val.includes('*')) {
      errors.push(`Canonical URL missing trailing slash in ${file}: "${val}"`);
    }
  }
}

// 3. Validate redirects targets (public/_redirects)
if (exists('public/_redirects')) {
  console.log('Checking public/_redirects targets...');
  const redirectsContent = read('public/_redirects');
  const lines = redirectsContent.split('\n');

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) return;

    const target = parts[1];
    if (target.startsWith('http://') || target.startsWith('https://')) return;
    if (target.includes(':splat') || target.includes(':placeholder') || target.includes('*')) return;
    if (/\.[a-z0-9]+$/i.test(target.split('?')[0].split('#')[0])) return; // Skip files

    const pathname = target.split('?')[0];
    if (pathname !== '/' && !pathname.endsWith('/')) {
      errors.push(`Redirect target in public/_redirects on line ${idx + 1} is missing trailing slash: "${target}"`);
    }
  });
} else {
  warnings.push('public/_redirects file does not exist.');
}

// 4. Check for missing public asset references in structured data (logo.png vs logo.svg)
console.log('Checking for logo.png references in schemas/code...');
const sourceFiles = [
  ...collectFiles('app'),
  ...collectFiles('components'),
  ...collectFiles('lib'),
  ...collectFiles('src'),
];

for (const file of sourceFiles) {
  // Skip binary/unrelated extensions
  if (!/\.(tsx|ts|jsx|js|mjs|cjs)$/.test(file)) continue;
  if (file.includes('validate-seo.ts')) continue; // skip this file

  const content = read(file);
  if (content.includes('logo.png')) {
    errors.push(`Reference to missing asset "logo.png" found in ${file}. Use "logo.svg" instead.`);
  }
}

// 5. Verify sitemap.ts lastModified build date fallback
if (exists('app/sitemap.ts')) {
  console.log('Checking app/sitemap.ts for currentDate fallback...');
  const sitemapContent = read('app/sitemap.ts');
  
  // Verify that currentDate is not used as a general sitemap route fallback
  if (sitemapContent.includes('currentDate') && sitemapContent.includes('lastModified: lastModified || currentDate')) {
    errors.push('app/sitemap.ts is falling back to current build date (currentDate) for routes.');
  }
} else {
  errors.push('app/sitemap.ts not found.');
}

// Print results and exit
if (warnings.length) {
  console.log('\nWarnings:');
  warnings.forEach((w) => console.warn(`- ${w}`));
}

if (errors.length) {
  console.error('\nSEO Validation Failures:');
  errors.forEach((e) => console.error(`- ${e}`));
  process.exit(1);
}

console.log('\nAll SEO validation checks passed successfully!');
process.exit(0);
