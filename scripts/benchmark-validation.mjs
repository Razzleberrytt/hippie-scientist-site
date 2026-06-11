import { execSync } from 'child_process'
import { performance } from 'perf_hooks'

const commands = [
  { name: 'lint', cmd: 'npm run lint' },
  { name: 'typecheck', cmd: 'npm run typecheck' },
  { name: 'validate:content', cmd: 'npm run validate:content' },
  { name: 'validate:code', cmd: 'npm run validate:code' },
  { name: 'verify:build', cmd: 'npm run verify:build' },
  { name: 'build', cmd: 'npm run build' },
  { name: 'validate:release', cmd: 'npm run validate:release' }
]

console.log('╔════════════════════════════════════════════════╗')
console.log('║       Validation Pipeline Speed Benchmark      ║')
console.log('╚════════════════════════════════════════════════╝\n')
console.log('Running benchmarks for validation scripts in sequence...\n')

const results = []

for (const command of commands) {
  console.log(`⏱️  Running: ${command.name} (${command.cmd})...`)
  const start = performance.now()
  try {
    execSync(command.cmd, { stdio: 'ignore' })
    const duration = ((performance.now() - start) / 1000).toFixed(2)
    results.push({ name: command.name, cmd: command.cmd, duration: `${duration}s`, status: 'PASS' })
    console.log(`✓ Completed in ${duration}s\n`)
  } catch (err) {
    const duration = ((performance.now() - start) / 1000).toFixed(2)
    results.push({ name: command.name, cmd: command.cmd, duration: `${duration}s`, status: 'FAIL' })
    console.log(`✗ Failed in ${duration}s\n`)
  }
}

console.log('╔══════════════════════════════════════════════════════════════════╗')
console.log('║                      Benchmark Results                           ║')
console.log('╠══════════════════════╦══════════════════════════════╦════════════╣')
console.log('║ Script Name          ║ Timing                       ║ Status     ║')
console.log('╠══════════════════════╬══════════════════════════════╬════════════╣')
for (const r of results) {
  console.log(`║ ${r.name.padEnd(20)} ║ ${r.duration.padEnd(28)} ║ ${r.status.padEnd(10)} ║`)
}
console.log('╚══════════════════════╩══════════════════════════════╩════════════╝')
