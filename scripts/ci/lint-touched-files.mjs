#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

try {
  // Find modified/staged files relative to HEAD
  const stdout = execSync('git diff --name-only HEAD', { encoding: 'utf8' })
  const files = stdout.split('\n')
    .map(f => f.trim())
    .filter(f => f && (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.mjs')) && fs.existsSync(f))

  if (files.length === 0) {
    console.log('[lint-touched] No modified JS/TS files found. Skipping lint.');
    process.exit(0);
  }

  console.log(`[lint-touched] Linting ${files.length} modified files...`);
  // Map files to absolute or clean relative paths and invoke eslint
  execSync(`npx eslint ${files.join(' ')} --max-warnings=0 --no-warn-ignored`, { stdio: 'inherit' })
} catch (err) {
  console.error('[lint-touched] Linting failed or eslint returned errors.');
  process.exit(1);
}
