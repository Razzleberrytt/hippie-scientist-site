#!/usr/bin/env node
/**
 * Developer-only incremental validation for a cohesive batch of changes.
 * Production approval ALWAYS requires normal protected PR CI and exact-head
 * build/SEO/science/security/deployment checks. This script never merges.
 *
 * Usage: node scripts/dev/batch-preflight.mjs --base=origin/main --mode=edit
 *        node scripts/dev/batch-preflight.mjs --base=origin/main --mode=checkpoint --run
 *        node scripts/dev/batch-preflight.mjs --base=origin/main --mode=release
 */
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { classifyReleaseImpact } from '../ci/classify-release-impact.mjs'

const MODES = new Set(['edit', 'checkpoint', 'release'])
const isNodeSuite = f => /(?:^|\/)[^/]+\.node-test\.mjs$/.test(f)
const isTest = f => isNodeSuite(f) || /(?:^|\/)(?:__tests__\/)?[^/]+\.(?:test|spec)\.[cm]?[jt]sx?$/.test(f)
const isCode = f => /\.(?:[cm]?[jt]sx?|css)$/.test(f)
const isUi = f => /^(?:app\/|components\/|styles\/)/.test(f)
const isScientific = f => /^(?:data-sources\/|public\/data\/|scripts\/data\/|app\/herbs\/|app\/compounds\/|lib\/.*(?:evidence|clinical|research)|components\/ui\/.*(?:Evidence|Safety))/.test(f)
const isSecurity = f => /^(?:security\/|\.github\/workflows\/|scripts\/ci\/.*(?:security|authorization|controller)|app\/api\/)/.test(f)
const isOperational = f => /^(?:scripts\/ci\/|ops\/project-control\/|docs\/(?:CURRENT_SPRINT|MASTER_BACKLOG)\.md)/.test(f)

export function planBatch(files, { mode = 'checkpoint', head = '' } = {}) {
  if (!MODES.has(mode)) throw Error('Unsupported mode')
  const normalized = [...new Set(files.map(x => String(x || '').trim().replaceAll('\\','/')).filter(Boolean))]
  if (!normalized.length) return { mode, head, files: [], risk: [], classifier: classifyReleaseImpact([]),
    commands: [], summary: 'No changes', releaseAuthorized: false }
  const impact = classifyReleaseImpact(normalized)
  const changedTests = normalized.filter(f => isTest(f) && !isNodeSuite(f))
  const changedNodeSuites = normalized.filter(isNodeSuite)
  const sourceFiles = normalized.filter(f => isCode(f) && !isTest(f))
  const risk = [
    ...(normalized.some(isScientific) ? ['scientific'] : []),
    ...(normalized.some(isSecurity) ? ['security'] : []),
    ...(normalized.some(isOperational) ? ['operations'] : []),
    ...(normalized.some(isUi) ? ['user-interface'] : []),
  ]
  const commands = []
  // Docs-only never silently changes into a release-green verdict.
  if (mode !== 'release' && !impact.docsOnly) {
    const lintFiles = normalized.filter(f => /\.[cm]?[jt]sx?$/.test(f) && !f.endsWith('.d.ts'))
    // Keep lint a cheap changed-file check in edit mode; comprehensive lint once per checkpoint.
    if (lintFiles.length) commands.push({
      name: 'Changed-file lint', argv: ['npx','eslint',...lintFiles,'--max-warnings=0'],
    })
    if (sourceFiles.length || changedTests.length) {
      if (sourceFiles.length) commands.push({
        name: 'Affected Vitest', argv: ['npx','vitest','related',...sourceFiles,'--run','--passWithNoTests'],
      })
      if (changedTests.length) commands.push({
        name: 'Explicit changed tests', argv: ['npx','vitest','run',...changedTests],
      })
      if (changedNodeSuites.length) commands.push({
        name: 'Explicit native node:test suites', argv: ['node','--test',...changedNodeSuites],
      })
    }
    if (mode === 'checkpoint') {
      commands.push({ name: 'Typecheck', argv: ['npm','run','typecheck'] })
      if (risk.includes('user-interface')) commands.push({
        name: 'Explicit accessibility gate', argv: ['npm','run','test:a11y'],
      })
      if (risk.includes('scientific')) {
        for (const script of ['validate:evidence-grades','validate:evidence-language',
          'validate:claim-discipline','validate:safety-visibility','validate:citation-integrity']) {
          commands.push({ name: script, argv: ['npm','run',script] })
        }
      }
      if (risk.includes('security')) commands.push({ name: 'Dependency/security audit',
        argv: ['npm','run','audit:high'] })
      if (risk.includes('operations')) commands.push({
        name: 'Control/impact regression', argv: ['npx','vitest','run',
          'scripts/ci/classify-release-impact.test.mjs',
          'scripts/ci/reconcile-project-control.test.mjs'],
      })
    }
  } else if (mode !== 'release' && impact.docsOnly) {
    commands.push({ name: 'Documentation link contract',
      argv: ['node','scripts/ci/validate-doc-links.mjs'] })
  }
  return {
    mode, head, files: normalized, risk, classifier: impact, commands,
    summary: mode === 'release'
      ? 'Release-ready is NOT granted: open one scoped PR, run all exact-head required checks, guarded merge and deployment.'
      : 'Incremental developer-only feedback; never release authorization.',
    releaseAuthorized: false,
  }
}

export function runBatch(plan, { runner = spawnSync } = {}) {
  const executed = []
  for (const command of plan.commands) {
    const [cmd, ...args] = command.argv
    const started = Date.now()
    const result = runner(cmd, args, { encoding: 'utf8', stdio: 'inherit', shell: false })
    const item = { name: command.name, argv: command.argv,
      exitCode: result.status ?? 1, durationMs: Date.now() - started }
    executed.push(item)
    if (result.error || result.signal || item.exitCode !== 0) break
  }
  return {
    ...plan, executed, success: executed.length === plan.commands.length &&
      executed.every(x => x.exitCode === 0),
    releaseAuthorized: false,
  }
}

function main() {
  const args = process.argv.slice(2)
  const option = (name, fallback) => args.find(x => x.startsWith('--' + name + '='))?.split('=').slice(1).join('=') || fallback
  const base = option('base', 'origin/main')
  const mode = option('mode', 'edit')
  const receipt = option('receipt', '')
  if (!/^[\w./-]+$/.test(base) || base.startsWith('-')) throw Error('Unsafe base revision')
  const git = (argv) => execFileSync('git', argv, { encoding: 'utf8', stdio: ['ignore','pipe','pipe'] })
  const changed = git(['diff','--name-only','-z',base]).split('\0')
  const untracked = git(['ls-files','--others','--exclude-standard','-z']).split('\0')
  const plan = planBatch([...changed, ...untracked], { mode, head: git(['rev-parse','HEAD']).trim() })
  const result = args.includes('--run') ? runBatch(plan) : plan
  if (receipt) {
    const dest = path.resolve(receipt)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.writeFileSync(dest, JSON.stringify({
      createdAt: new Date().toISOString(), source: 'developer-only', ...result,
    }, null, 2) + '\n')
  }
  console.log(JSON.stringify(result, null, 2))
  if (args.includes('--run') && !result.success) process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href)
  main()
