/**
 * One contract for "this check needs the build output".
 *
 * Nine post-build validators each open-coded the same shape:
 *
 *     if (!fs.existsSync(outDir)) {
 *       console.log('[name] SKIP: out/ not found. Run npm run build first.')
 *       process.exit(0)
 *     }
 *
 * Exit 0 means "passed". A validator that inspected nothing had not passed —
 * it had not run. Every one of these is invoked from `verify:postbuild` or
 * `verify:build:parallel`, both of which build first, so a missing `out/` is a
 * broken invocation, not an expected state. Reporting success for it is how a
 * green pipeline can coexist with an unvalidated build.
 *
 * The distinction this module enforces:
 *
 *   REQUIRED (default) — the output is missing, so the check cannot run.
 *   Exit non-zero with a message naming what was expected.
 *
 *   OPTIONAL (`--optional` on the command line, or `optional: true`) — the
 *   caller has explicitly said a skip is acceptable. Log `SKIPPED: <reason>`
 *   so it is visible in the log rather than silent, and exit 0.
 *
 * A second guard covers the subtler failure: output that exists but is far too
 * small. Every check downstream iterates a list, and an empty list satisfies
 * all of them, so a near-empty `out/` produces a clean report rather than an
 * error. `minFiles` refuses that.
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * Count files matching an extension anywhere under a directory.
 *
 * @param {string} dir
 * @param {string} extension
 * @returns {number}
 */
export function countFiles(dir, extension = '.html') {
  let total = 0
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === '_next') continue
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith(extension)) total += 1
    }
  }
  walk(dir)
  return total
}

/**
 * Assert that build output exists and is substantial enough to validate.
 *
 * Exits the process on failure; returns the resolved path on success.
 *
 * @param {object} options
 * @param {string} options.name        Log prefix, e.g. 'audit-seo-routes'.
 * @param {string} [options.dir]       Directory that must exist. Defaults to `out/`.
 * @param {boolean} [options.optional] Treat absence as an acceptable skip.
 * @param {number} [options.minFiles]  Minimum matching files; 0 disables the check.
 * @param {string} [options.extension] Extension counted by `minFiles`.
 * @returns {string} The resolved directory path.
 */
export function requireBuildOutput({
  name,
  dir = path.join(process.cwd(), 'out'),
  optional = process.argv.includes('--optional'),
  minFiles = 0,
  extension = '.html',
} = {}) {
  const relative = path.relative(process.cwd(), dir) || dir

  if (!fs.existsSync(dir)) {
    if (optional) {
      console.log(`[${name}] SKIPPED: ${relative} not found and a skip was explicitly allowed.`)
      process.exit(0)
    }
    console.error(`[${name}] FAILED: ${relative} not found, so nothing was inspected.`)
    console.error('Run `npm run build` first, or pass --optional if a skip is genuinely intended.')
    process.exit(1)
  }

  if (minFiles > 0) {
    const found = countFiles(dir, extension)
    if (found < minFiles) {
      console.error(
        `[${name}] FAILED: found ${found} ${extension} file(s) under ${relative}, below the ${minFiles} minimum.`,
      )
      console.error('The build output looks incomplete, so a clean result here would mean nothing.')
      process.exit(1)
    }
  }

  return dir
}
