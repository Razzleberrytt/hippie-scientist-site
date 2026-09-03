#!/usr/bin/env node
// Cross-platform stand-in for the POSIX `VAR=value command` npm-script prefix.
//
// `npm run` executes scripts through cmd.exe on Windows, which has no inline
// env-var prefix syntax — `ANALYZE=true npm run build` fails there with
// "'ANALYZE' is not recognized as an internal or external command". This runner
// consumes leading NAME=value pairs into the child environment and then execs
// the rest of the argv, so the same npm script works on every platform.
//
// Usage: node scripts/with-env.mjs NAME=value [NAME=value...] <command> [args...]

import { spawnSync } from 'node:child_process'

const argv = process.argv.slice(2)
const env = { ...process.env }

let cursor = 0
for (; cursor < argv.length; cursor += 1) {
  const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(argv[cursor])
  if (!match) break
  env[match[1]] = match[2]
}

const [command, ...args] = argv.slice(cursor)
if (!command) {
  console.error('usage: node scripts/with-env.mjs NAME=value [NAME=value...] <command> [args...]')
  process.exit(2)
}

// `shell` is required on Windows so npm/npx (.cmd shims) resolve. Arguments come
// from package.json literals, never from untrusted input.
const result = spawnSync(command, args, { stdio: 'inherit', env, shell: process.platform === 'win32' })
if (result.error) {
  console.error(`[with-env] failed to run ${command}: ${result.error.message}`)
  process.exit(1)
}
process.exit(result.status ?? 1)
