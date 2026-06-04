import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

function normalizeTitle(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // remove punctuation
    .replace(/\s+/g, ' ')   // normalize spaces
    .trim();
}

function main() {
  const blogDir = 'content/blog';
  if (!fs.existsSync(blogDir)) {
    console.log('[validate-blog-duplicates] No blog directory found, skipping.');
    process.exit(0);
  }

  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.mdx') || f.endsWith('.md'));
  const titleMap = new Map();
  let failed = false;

  for (const file of files) {
    const filePath = path.join(blogDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    let frontmatter;
    try {
      const parsed = matter(content);
      frontmatter = parsed.data;
    } catch (e) {
      console.error(`[validate-blog-duplicates] Error parsing frontmatter in ${file}:`, e.message);
      failed = true;
      continue;
    }

    const title = frontmatter.title;
    if (!title) {
      console.error(`[validate-blog-duplicates] Missing title frontmatter in ${file}`);
      failed = true;
      continue;
    }

    const normalized = normalizeTitle(title);
    if (titleMap.has(normalized)) {
      const prevFile = titleMap.get(normalized);
      console.error(`[validate-blog-duplicates] DUPLICATE DETECTED: Near-identical title "${title}" found in multiple files:\n  - ${prevFile}\n  - ${file}`);
      failed = true;
    } else {
      titleMap.set(normalized, file);
    }
  }

  if (failed) {
    console.error('[validate-blog-duplicates] FAIL: Duplicate or malformed blog titles detected.');
    process.exit(1);
  }

  console.log('[validate-blog-duplicates] PASS: No duplicate blog titles detected.');
}

main();
