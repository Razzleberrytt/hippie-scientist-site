import { promises as fs } from 'node:fs';
import path from 'node:path';

const BLOG_DIR = path.resolve('content/blog');

const entries = await fs.readdir(BLOG_DIR, { withFileTypes: true });
const files = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
  .map((entry) => path.join(BLOG_DIR, entry.name));

let changedCount = 0;

for (const filePath of files) {
  const original = await fs.readFile(filePath, 'utf8');

  if (!original.startsWith('---\n')) {
    continue;
  }

  const closingIndex = original.indexOf('\n---\n', 4);
  if (closingIndex === -1) {
    continue;
  }

  const frontmatter = original.slice(4, closingIndex);
  const updatedFrontmatter = frontmatter.replace(
    /^(\s*draft\s*:\s*)true(\s*)$/m,
    '$1false$2'
  );

  if (frontmatter === updatedFrontmatter) {
    continue;
  }

  const updated = `${original.slice(0, 4)}${updatedFrontmatter}${original.slice(closingIndex)}`;
  await fs.writeFile(filePath, updated, 'utf8');
  changedCount += 1;
}

console.log(`Updated draft flag in ${changedCount} file(s).`);
