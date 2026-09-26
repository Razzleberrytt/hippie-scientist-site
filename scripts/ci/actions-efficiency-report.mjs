import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { pathToFileURL } from 'node:url'

const exec = promisify(execFile)
const controllerName = 'Autonomous merge controller'
const validationNames = new Set(['CI', 'Site Health Check', 'Build Check', 'Atomic upgrade gate',
  'Build quality regression', 'Workbook Patch Check', 'Evidence Graph Identity Check',
  'Production Content Lint', 'Production Content Invariants', 'Schema and Media Governance',
  'Lighthouse CI', 'Crawl Governance', 'Technical SEO Monitor', 'Crawl experiment guard',
  'Botanical Activity Atlas Coverage', 'Research Distribution', 'Swarm Runtime Resilience'])
const countBy = (rows, key) => rows.reduce((counts, row) => {
  const value = key(row)
  counts[value] = (counts[value] || 0) + 1
  return counts
}, {})
const ratio = (n, d) => d > 0 ? Number((n / d).toFixed(3)) : null

export function summarize({ runs, jobs, prs, usefulPrNumbers = [], from, to }) {
  const controllers = runs.filter(run => run.name === controllerName)
  const runById = new Map(runs.map(run => [run.id, run]))
  const uniqueJobs = [...new Map(jobs.map(job => [job.id, job])).values()]
  const workflowMinutes = {}
  for (const job of uniqueJobs) {
    const name = runById.get(job.run_id)?.name || 'Unknown workflow'
    const elapsed = job.started_at && job.completed_at ? Math.max(0, (Date.parse(job.completed_at) - Date.parse(job.started_at)) / 60000) : 0
    workflowMinutes[name] = (workflowMinutes[name] || 0) + elapsed
  }
  const seconds = uniqueJobs.reduce((sum, job) => sum + (job.started_at && job.completed_at
    ? Math.max(0, (Date.parse(job.completed_at) - Date.parse(job.started_at)) / 1000) : 0), 0)
  const executed = uniqueJobs.filter(job => job.steps?.some(step => step.conclusion !== 'skipped'))
  const executedRunIds = new Set(executed.map(job => job.run_id))
  const validations = runs.filter(run => executedRunIds.has(run.id) && validationNames.has(run.name))
  const duplicateCandidates = Object.entries(countBy(validations, run => `${run.name}@${run.head_sha}`))
    .filter(([, count]) => count > 1).map(([key, count]) => ({ key, count }))
  const buildSteps = uniqueJobs.flatMap(job => (job.steps || []).filter(step =>
    step.conclusion !== 'skipped' && /^(?:Build app(?:lication)?|Build governed fallback on artifact miss or mismatch|Build static export(?: fallback| for rendered-output verification)?|Build production output fallback|Build production site)$/.test(step.name)
  ).map(step => ({ runId: job.run_id, jobId: job.id, workflow: runById.get(job.run_id)?.name,
    headSha: runById.get(job.run_id)?.head_sha, name: step.name, conclusion: step.conclusion })))
  const useful = prs.filter(pr => usefulPrNumbers.includes(pr.number))
  const readyToMerge = prs.map(pr => ({ number: pr.number,
    createdToMergeMinutes: ratio(Date.parse(pr.mergedAt) - Date.parse(pr.createdAt), 60000),
    readyToMergeMinutes: null,
    mergeToDeployMinutes: (() => {
      const deployments = runs.filter(run => run.name === 'Deploy to Cloudflare Pages' &&
        run.head_sha === pr.mergeCommit?.oid && run.conclusion === 'success')
      const ends = deployments.map(run => Math.max(...uniqueJobs.filter(job => job.run_id === run.id && job.completed_at)
        .map(job => Date.parse(job.completed_at)))).filter(time => Number.isFinite(time) && time >= Date.parse(pr.mergedAt))
      return ends.length ? ratio(Math.min(...ends) - Date.parse(pr.mergedAt), 60000) : null
    })(),
  }))
  return {
    from, to, cohort: 'Workflow runs created in [from,to); all available attempts and full job durations for those runs. PRs merged in the same window. Period throughput, not causal PR attribution.',
    limitations: ['Job elapsed minutes are approximate runner usage, not billed/rounded minutes.',
      'Same-workflow/same-SHA repetitions are candidates, not proof of equivalent inputs/base/artifact.',
      'Build step names are diagnostics; inspect commands and logs before claiming duplicate builds. Validation names use an explicit core audit cohort.',
      'No-op success cannot be inferred from conclusion alone. Zero executed steps are reported separately.',
      'PR ready timestamps and missing/later deployment receipts remain unknown; creation is not readiness.'],
    totalRuns: runs.length, conclusions: countBy(runs, run => run.conclusion || run.status),
    workflowCounts: countBy(runs, run => run.name), events: countBy(runs, run => run.event),
    approximateJobMinutes: ratio(seconds, 60), jobs: uniqueJobs.length,
    jobMinutesByWorkflow: Object.fromEntries(Object.entries(workflowMinutes).sort((a, b) => b[1] - a[1]).map(([name, minutes]) => [name, Number(minutes.toFixed(3))])),
    unfinishedJobs: uniqueJobs.filter(job => job.started_at && !job.completed_at).length,
    zeroExecutedStepRuns: runs.filter(run => !executedRunIds.has(run.id)).length,
    retryAttempts: runs.reduce((sum, run) => sum + Math.max(0, (run.run_attempt || 1) - 1), 0),
    controllerInvocations: controllers.length,
    controllerCancellations: controllers.filter(run => run.conclusion === 'cancelled').length,
    controllerCancellationPercent: ratio(controllers.filter(run => run.conclusion === 'cancelled').length * 100, controllers.length),
    executedValidationRuns: validations.length, duplicateCandidates, expensiveBuildExecutions: buildSteps.length, buildSteps,
    sameShaBuildCandidates: Object.entries(countBy(buildSteps, step => step.headSha)).filter(([, count]) => count > 1).map(([headSha, count]) => ({ headSha, count })),
    mergedPrs: prs.map(pr => ({ number: pr.number, title: pr.title, url: pr.url })),
    usefulPrNumbers: useful.map(pr => pr.number),
    minutesPerUsefulMerge: ratio(seconds / 60, useful.length),
    runsPerUsefulMerge: ratio(runs.length, useful.length),
    minutesPerAllMerges: ratio(seconds / 60, prs.length), runsPerAllMerges: ratio(runs.length, prs.length),
    mergeTimings: readyToMerge,
  }
}

async function api(endpoint) {
  const { stdout } = await exec('gh', ['api', '--paginate', '--slurp', endpoint], { maxBuffer: 64 * 1024 * 1024 })
  return JSON.parse(stdout)
}

async function main() {
  const args = Object.fromEntries(process.argv.slice(2).map(arg => {
    const [key, ...value] = arg.replace(/^--/, '').split('='); return [key, value.join('=')]
  }))
  if (args.inventory) {
    const { load } = await import('js-yaml')
    const directory = '.github/workflows'
    const rows = fs.readdirSync(directory).filter(file => /\.ya?ml$/.test(file)).sort().map(file => {
      const source = fs.readFileSync(path.join(directory, file), 'utf8')
      const workflow = load(source)
      return { file, name: workflow.name, triggers: workflow.on, concurrency: workflow.concurrency || null,
        permissions: workflow.permissions || null,
        jobs: Object.entries(workflow.jobs || {}).map(([id, job]) => ({ id, if: job.if || null,
          concurrency: job.concurrency || null, uses: job.uses || null,
          steps: (job.steps || []).filter(step => step.run || step.uses).map(step => ({
            name: step.name || step.uses || step.run.split('\n')[0], if: step.if || null,
            uses: step.uses || null, run: step.run || null,
          })),
        })),
      }
    })
    fs.mkdirSync(args.inventory, { recursive: true })
    fs.writeFileSync(path.join(args.inventory, 'workflow-inventory.json'), JSON.stringify(rows, null, 2) + '\n')
    const table = rows.map(row => {
      const events = Object.entries(row.triggers || {}).map(([event, config]) => event === 'schedule'
        ? `schedule (${config.map(entry => entry.cron).join('; ')})` : event === 'workflow_run'
          ? `workflow_run (${config.workflows.join(', ')})` : `${event}${config?.paths || config?.['paths-ignore'] ? ' [path-filtered]' : ''}`)
      const jobs = row.jobs.map(job => job.uses ? `${job.id}: ${job.uses}` : job.id).join(', ')
      const execution = row.jobs.flatMap(job => job.steps || []).map(step => step.run || '').join('\n')
      return `| ${row.file} | ${events.join('; ')} | ${row.concurrency ? (typeof row.concurrency === 'string' ? row.concurrency : `${row.concurrency.group}; cancel=${row.concurrency['cancel-in-progress']}`) : 'None at workflow level'} | ${jobs} | ${/npm ci/.test(execution) ? 'install; ' : ''}${/npm run (?:-s )?build(?::deploy)?\b/.test(execution) ? 'build command; ' : ''}${/governed-static-export\.mjs verify/.test(execution) ? 'receipt verification; ' : ''}${/dispatches|gh workflow run/.test(execution) ? 'dispatch; ' : ''}${/gh pr create|create-pull-request/.test(execution) ? 'PR creation' : ''} |`
    })
    fs.writeFileSync(path.join(args.inventory, 'workflow-inventory.md'), '# Actions orchestration inventory\n\nGenerated with `node scripts/ci/actions-efficiency-report.mjs --inventory=<directory>`. Static inventory; the command also emits full job/step predicates as JSON (kept outside version control to avoid duplicating workflow source). Build-command presence does not imply execution. Indirect script dispatches are described in the audit edge register.\n\n| File | Triggers | Workflow concurrency | Jobs / reusable edges | Work classes present |\n|---|---|---|---|---|\n' + table.join('\n') + '\n')
    console.log(`Inventoried ${rows.length} workflows`)
    return
  }
  const { from, to, out, repo = 'Razzleberrytt/hippie-scientist-site' } = args
  if (!from || !to || !out || !(Date.parse(from) < Date.parse(to))) throw new Error('Use --from=ISO --to=ISO --out=directory [--useful=PR,PR] [--snapshot=file]')
  fs.mkdirSync(out, { recursive: true })
  const snapshotFile = path.join(out, 'snapshot.json')
  let snapshot
  if (args.snapshot) snapshot = JSON.parse(fs.readFileSync(args.snapshot, 'utf8'))
  else {
    // Hourly shards avoid the Actions search API 1,000-result ceiling. Refuse truncation.
    const allRuns = []
    for (let start = Date.parse(from); start < Date.parse(to); start += 3600000) {
      const end = Math.min(start + 3600000, Date.parse(to))
      const pages = await api(`repos/${repo}/actions/runs?per_page=100&created=${new Date(start).toISOString()}..${new Date(end).toISOString()}`)
      if (pages[0].total_count >= 1000) throw new Error('Hourly shard reaches API limit; use a narrower window')
      allRuns.push(...pages.flatMap(page => page.workflow_runs))
    }
    const runs = [...new Map(allRuns.filter(run => Date.parse(run.created_at) >= Date.parse(from) && Date.parse(run.created_at) < Date.parse(to)).map(run => [run.id, run])).values()]
    const jobs = []
    let cursor = 0
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (cursor < runs.length) {
        const run = runs[cursor++]
        const pages = await api(`repos/${repo}/actions/runs/${run.id}/jobs?filter=all&per_page=100`)
        jobs.push(...pages.flatMap(page => page.jobs))
        if (cursor % 50 === 0) process.stdout.write(`Collected ${cursor}/${runs.length} run job histories\n`)
      }
    }))
    const { stdout } = await exec('gh', ['pr', 'list', '--repo', repo, '--state', 'merged', '--limit', '1000', '--search', `merged:${from}..${to}`,
      '--json', 'number,title,createdAt,mergedAt,mergeCommit,headRefOid,url'], { maxBuffer: 16 * 1024 * 1024 })
    const prs = JSON.parse(stdout).filter(pr => Date.parse(pr.mergedAt) >= Date.parse(from) && Date.parse(pr.mergedAt) < Date.parse(to))
    if (prs.length >= 1000) throw new Error('PR query limit reached')
    snapshot = { from, to, repo, capturedAt: new Date().toISOString(), runs, jobs, prs }
    fs.writeFileSync(snapshotFile, JSON.stringify(snapshot))
  }
  if (snapshot.from !== from || snapshot.to !== to) throw new Error('Snapshot window mismatch')
  const result = summarize({ ...snapshot, usefulPrNumbers: (args.useful || '').split(',').filter(Boolean).map(Number) })
  fs.writeFileSync(path.join(out, 'summary.json'), JSON.stringify(result, null, 2) + '\n')
  process.stdout.write(JSON.stringify({ ...result, buildSteps: result.buildSteps.length, duplicateCandidates: result.duplicateCandidates.length }, null, 2) + '\n')
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error); process.exitCode = 1 })
