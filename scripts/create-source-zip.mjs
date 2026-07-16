#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const outputDir = path.join(root, 'scratch')
const outputArg = process.argv[2]

function fail(message) {
  console.error(message)
  process.exit(1)
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    ...options,
  })

  if (result.status !== 0) {
    const stderr = result.stderr?.trim()
    const stdout = result.stdout?.trim()
    fail(stderr || stdout || `Command failed: ${command} ${args.join(' ')}`)
  }

  return result.stdout.trim()
}

const gitDir = run('git', ['rev-parse', '--show-toplevel'])

if (path.resolve(gitDir) !== path.resolve(root)) {
  fail(`Run this from the repository root. Current root: ${root}`)
}

const shortSha = run('git', ['rev-parse', '--short', 'HEAD'])
const branch = run('git', ['branch', '--show-current']) || 'detached-head'
const safeBranch = branch.replace(/[^a-zA-Z0-9._-]/g, '-')

fs.mkdirSync(outputDir, { recursive: true })

const outputPath = path.resolve(
  root,
  outputArg || path.join('scratch', `hippie-scientist-site-${safeBranch}-${shortSha}.zip`),
)

if (!outputPath.endsWith('.zip')) {
  fail('Output path must end with .zip')
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true })

run('git', ['archive', '--format=zip', `--output=${outputPath}`, 'HEAD'], {
  stdio: ['ignore', 'pipe', 'pipe'],
})

const bytes = fs.statSync(outputPath).size
const mb = (bytes / 1024 / 1024).toFixed(2)

console.log(`Created clean source archive: ${path.relative(root, outputPath)}`)
console.log(`Size: ${mb} MB`)
console.log('Archive is built from tracked Git files only, so node_modules/ and other local-only folders are excluded.')
