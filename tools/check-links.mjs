#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const distDir = path.join(repoRoot, 'dist');

const ATTRIBUTE_PATTERN = /(href|src)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>"']+))/gi;
const PROTOCOL_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

try {
  await ensureDirectory(distDir);
  const htmlFiles = await findHtmlFiles(distDir);
  const missing = [];

  for (const htmlFile of htmlFiles) {
    const htmlContent = await fs.readFile(htmlFile, 'utf8');
    const relativeHtml = toPosix(path.relative(distDir, htmlFile));

    for (const { attribute, value } of extractAttributes(htmlContent)) {
      if (shouldSkip(value)) {
        continue;
      }

      const candidates = resolveCandidates(value, htmlFile, attribute);
      if (candidates.length === 0) {
        continue;
      }

      const exists = await anyPathExists(candidates);
      if (!exists) {
        missing.push({
          source: relativeHtml,
          attribute,
          value
        });
      }
    }
  }

  if (missing.length > 0) {
    console.error('Broken local asset references detected:');
    for (const entry of missing) {
      console.error(
        ` - ${entry.source}: ${entry.attribute}="${entry.value}" -> missing in dist/`
      );
    }
    process.exit(1);
  }

  console.log('Local link check passed: all href/src targets exist in dist/.');
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}

function extractAttributes(html) {
  const results = [];
  let match;
  while ((match = ATTRIBUTE_PATTERN.exec(html)) !== null) {
    const attribute = match[1].toLowerCase();
    const rawValue = match[3] ?? match[4] ?? match[5] ?? '';
    const value = rawValue.trim();
    if (value.length === 0) {
      continue;
    }
    results.push({ attribute, value });
  }
  return results;
}

function shouldSkip(value) {
  if (value === '#' || value === '/' || value === './' || value === '..') {
    return true;
  }

  if (value.startsWith('#') || value.startsWith('?')) {
    return true;
  }

  if (value.startsWith('//')) {
    return true;
  }

  if (PROTOCOL_PATTERN.test(value)) {
    return true;
  }

  return false;
}

function resolveCandidates(rawValue, htmlFile, attribute) {
  const [withoutQuery] = rawValue.split(/[?#]/);
  const cleaned = withoutQuery.trim();

  if (!cleaned || cleaned === '.' || cleaned === './' || cleaned === '..') {
    return [];
  }

  const lastSegment = cleaned.split('/').pop() ?? cleaned;
  const looksLikeFile = lastSegment.includes('.');
  const hasTrailingSlash = cleaned.endsWith('/');

  if (
    attribute === 'href' &&
    cleaned.startsWith('/') &&
    !hasTrailingSlash &&
    !looksLikeFile
  ) {
    // Likely a client-side route handled by SPA fallback; skip verification.
    return [];
  }

  const targets = [];
  const isRootRelative = cleaned.startsWith('/');
  const normalized = isRootRelative ? cleaned.slice(1) : cleaned;
  const base = isRootRelative
    ? path.join(distDir, normalized)
    : path.resolve(path.dirname(htmlFile), normalized);

  addCandidate(targets, base);

  const extension = path.extname(cleaned);

  if (hasTrailingSlash) {
    addCandidate(targets, path.join(base, 'index.html'));
  }

  if (!extension) {
    addCandidate(targets, `${base}.html`);
    addCandidate(targets, path.join(base, 'index.html'));
  }

  return Array.from(new Set(targets));
}

function addCandidate(targets, candidatePath) {
  const normalized = path.normalize(candidatePath);
  const relative = path.relative(distDir, normalized);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return;
  }
  targets.push(normalized);
}

async function anyPathExists(candidates) {
  for (const candidate of candidates) {
    try {
      const stats = await fs.stat(candidate);
      if (stats.isFile() || stats.isDirectory()) {
        return true;
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
  return false;
}

async function ensureDirectory(directory) {
  const stats = await fs.stat(directory);
  if (!stats.isDirectory()) {
    throw new Error(`Expected ${toPosix(path.relative(repoRoot, directory))} to be a directory.`);
  }
}

async function findHtmlFiles(directory) {
  const stack = [directory];
  const results = [];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = await fs.readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}
