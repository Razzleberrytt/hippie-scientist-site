#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const BLOG_DIR = path.resolve('content/blog');
const MIN_SUBSTANTIVE_CHARS = 200;

function splitFrontmatter(fileText) {
  if (!fileText.startsWith('---\n')) return null;
  const closingIndex = fileText.indexOf('\n---\n', 4);
  if (closingIndex === -1) return null;

  return {
    frontmatter: fileText.slice(4, closingIndex),
    body: fileText.slice(closingIndex + 5),
    closingIndex,
  };
}

function stripSkeletonContent(body) {
  const lines = body.split(/\r?\n/);
  const filtered = [];
  let inHighlightsSection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) continue;

    if (/^#\s+/.test(trimmed)) continue;
    if (/^_.*_$/.test(trimmed)) continue;
    if (/^\*Filed in:/i.test(trimmed)) continue;

    if (/^##\s+Highlights\s*$/i.test(trimmed)) {
      inHighlightsSection = true;
      continue;
    }

    if (inHighlightsSection) {
      if (/^##\s+/.test(trimmed)) {
        inHighlightsSection = false;
      } else if (/^-\s+(Context and traditional use|Pharmacology snapshot and key actives|Practical tips: preparation, dosing ranges, safety)\s*$/i.test(trimmed)) {
        continue;
      } else if (/^-\s+/.test(trimmed)) {
        continue;
      }
    }

    if (/^##\s+Quick Blend Idea\s*$/i.test(trimmed)) continue;
    if (/^Try pairing\s+\*\*.+\*\*\s+with\s+\*\*.+\*\*\s+for a complementary effect profile\. Start low, go slow\.?$/i.test(trimmed)) continue;

    if (/^##\s+Further Reading\s*$/i.test(trimmed)) continue;
    if (/^-\s+Placeholder reference [A-Z]\s*$/i.test(trimmed)) continue;

    filtered.push(trimmed);
  }

  return filtered.join(' ').replace(/\s+/g, ' ').trim();
}

const entries = await fs.readdir(BLOG_DIR, { withFileTypes: true });
const files = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
  .map((entry) => path.join(BLOG_DIR, entry.name));

let publishedCount = 0;
let keptDraftCount = 0;
let processedCount = 0;

for (const filePath of files) {
  const original = await fs.readFile(filePath, 'utf8');
  const parsed = splitFrontmatter(original);

  if (!parsed) continue;

  const { frontmatter, body, closingIndex } = parsed;

  if (!/^\s*draft\s*:\s*true\s*$/m.test(frontmatter)) {
    continue;
  }

  processedCount += 1;

  const remainingBody = stripSkeletonContent(body);

  if (remainingBody.length < MIN_SUBSTANTIVE_CHARS) {
    keptDraftCount += 1;
    continue;
  }

  const updatedFrontmatter = frontmatter.replace(/^([ \t]*draft\s*:\s*)true([ \t]*)$/m, '$1false$2');
  const updated = `${original.slice(0, 4)}${updatedFrontmatter}${original.slice(closingIndex)}`;

  await fs.writeFile(filePath, updated, 'utf8');
  publishedCount += 1;
}

console.log(`Published count: ${publishedCount}`);
console.log(`Kept-as-draft count: ${keptDraftCount}`);
console.log(`Total processed: ${processedCount}`);
