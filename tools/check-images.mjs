#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const MAX_SIZE_BYTES = 250 * 1024;
const RASTER_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.bmp',
  '.tif',
  '.tiff',
  '.avif'
]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const allowlistPath = path.join(__dirname, 'image-allowlist.json');
let allowlistEntries = [];
try {
  const raw = await fs.readFile(allowlistPath, 'utf8');
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) {
    allowlistEntries = parsed;
  } else if (parsed && Array.isArray(parsed.allow)) {
    allowlistEntries = parsed.allow;
  }
} catch (error) {
  if (error.code !== 'ENOENT') {
    throw error;
  }
}

const allowlist = new Set(
  allowlistEntries
    .filter((value) => typeof value === 'string' && value.trim().length > 0)
    .map((value) => toPosix(value.trim()))
);

const targetDirectories = ['public', path.join('src', 'assets')];
const offenders = [];

for (const relativeDir of targetDirectories) {
  const absoluteDir = path.join(repoRoot, relativeDir);
  let stats;
  try {
    stats = await fs.stat(absoluteDir);
  } catch (error) {
    if (error.code === 'ENOENT') {
      continue;
    }

    throw error;
  }

  if (!stats.isDirectory()) {
    continue;
  }

  await inspectDirectory(absoluteDir);
}

if (offenders.length > 0) {
  console.error(`Found ${offenders.length} raster image(s) exceeding 250 KB:`);
  for (const { filePath, size } of offenders) {
    console.error(` - ${filePath} (${formatBytes(size)})`);
  }
  console.error(`To allow a specific file, add its relative path to ${toPosix(path.relative(repoRoot, allowlistPath))}.`);
  process.exit(1);
}

console.log('Image budget check passed: no rasters over 250 KB detected.');

async function inspectDirectory(directoryPath) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      await inspectDirectory(fullPath);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!RASTER_EXTENSIONS.has(extension)) {
      continue;
    }

    const stats = await fs.stat(fullPath);
    if (stats.size <= MAX_SIZE_BYTES) {
      continue;
    }

    const relativePath = toPosix(path.relative(repoRoot, fullPath));
    if (allowlist.has(relativePath)) {
      continue;
    }

    offenders.push({
      filePath: relativePath,
      size: stats.size
    });
  }
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}
