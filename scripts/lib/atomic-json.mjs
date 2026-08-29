/**
 * Atomic, lock-tolerant JSON writes for the data pipeline.
 *
 * Why this exists
 * ---------------
 * `npm run build` rewrites the same ~1,800 files under `public/data` eight or
 * more times back to back (normalize-evidence-grades → postprocess →
 * apply-participant-counts → quarantine-citations → governance-overlay →
 * sanitize → apply-pubmed → sync-detail-indexability). Each stage opens a file
 * for truncating write within milliseconds of the previous stage closing it.
 *
 * On Windows, a file that was just written is immediately opened by the
 * real-time scanner (Defender) and by the Search Indexer. Those handles are
 * short-lived, but while one is held, re-opening the same path for truncation
 * returns a sharing violation. libuv has no POSIX errno for that NT status, so
 * it surfaces as `UNKNOWN: unknown error, open '...'` rather than EBUSY. That
 * is the exact failure the build wrapper hit — most visibly on
 * `public/data/herbs-detail/berberis-aristata.json`, which is only notable for
 * being early in the directory enumeration, not for anything about the slug.
 *
 * Two pipeline scripts had already grown their own private retry loops for
 * this; six others wrote raw and stayed exposed. This module replaces all of
 * them with one implementation so the behaviour is uniform and testable.
 *
 * The fix has three parts, and all of them matter:
 *
 *  1. Write to a sibling temp file, fsync, close, then `rename` over the
 *     target. Rename replaces the directory entry instead of truncating a file
 *     another process has open, and the explicit close beforehand guarantees
 *     we are never the ones still holding a handle. This also makes the write
 *     crash-safe: the target holds either the old bytes or the new bytes in
 *     full, never a half-written JSON file. Recovering by hand from truncated
 *     generated data is what made the original failure expensive.
 *
 *  2. Fall back to a direct write when rename loses. The two operations fail
 *     under opposite lock shapes and neither dominates the other: rename needs
 *     the holder to have opened with FILE_SHARE_DELETE, a truncating write
 *     needs FILE_SHARE_WRITE. A scanner typically grants both; another Node
 *     process reading the file grants only the latter, and there rename fails
 *     with EPERM where a plain write would have succeeded. Trying rename first
 *     and a direct write second covers both, and since the bytes are identical
 *     the fallback costs only atomicity — never correctness.
 *
 *  3. Bounded retry across both paths, because the underlying lock is
 *     transient by nature. Retry is a backstop, not the mechanism: it is
 *     bounded, it covers only codes known to be transient, and it rethrows
 *     with context when exhausted. It never swallows a real error.
 */

import fs from 'node:fs'
import path from 'node:path'

/** NT sharing violations and lock states libuv maps into these codes. */
const TRANSIENT_CODES = new Set(['UNKNOWN', 'EBUSY', 'EPERM', 'EACCES', 'EEXIST'])

const MAX_ATTEMPTS = 8

let tempCounter = 0

/**
 * Block the calling thread. The pipeline scripts are synchronous top to bottom
 * and have no event loop turn available, so a timer-based await would not
 * yield the delay we need here.
 */
function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

function isTransient(error) {
  return Boolean(error) && typeof error === 'object' && TRANSIENT_CODES.has(error.code)
}

function tempPathFor(filePath) {
  tempCounter += 1
  return path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${process.pid}.${tempCounter}.tmp`
  )
}

/**
 * Write `contents` to `filePath`, atomically where the OS allows it.
 *
 * On the normal path the target holds either the previous bytes or the new
 * bytes in full, never a partial write. Only the direct-write fallback in (2)
 * above gives that up, and it is reached solely when rename is refused — a
 * case where the pre-existing code wrote directly anyway.
 *
 * @param {string} filePath absolute or cwd-relative path to the target file
 * @param {string} contents exact bytes to write
 * @param {{ encoding?: BufferEncoding }} [options]
 */
export function writeFileAtomic(filePath, contents, options = {}) {
  const encoding = options.encoding || 'utf8'
  const target = path.resolve(filePath)

  fs.mkdirSync(path.dirname(target), { recursive: true })

  let lastError
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const temp = tempPathFor(target)
    try {
      // Write and flush through an explicit descriptor so the handle is
      // provably closed before the rename below asks the OS to replace the
      // target's directory entry.
      const fd = fs.openSync(temp, 'w')
      try {
        fs.writeFileSync(fd, contents, encoding)
        fs.fsyncSync(fd)
      } finally {
        fs.closeSync(fd)
      }

      try {
        fs.renameSync(temp, target)
        return
      } catch (renameError) {
        if (!isTransient(renameError)) throw renameError
        lastError = renameError
        // The holder opened the target without FILE_SHARE_DELETE. A truncating
        // write may still be permitted; the bytes are the same either way.
        fs.writeFileSync(target, contents, encoding)
        return
      }
    } catch (error) {
      lastError = error
      if (!isTransient(error) || attempt === MAX_ATTEMPTS) break
      // Back off linearly. Scanner handles on a small JSON file clear in well
      // under a second; 8 attempts spans ~1.8s, far past the observed window.
      sleepSync(attempt * 50)
    } finally {
      try {
        fs.rmSync(temp, { force: true })
      } catch {
        // A temp file we could not remove is not a reason to fail the write;
        // every attempt uses a fresh name, and a stale temp is inert.
      }
    }
  }

  const reason = lastError?.code ? `${lastError.code}: ${lastError.message}` : String(lastError)
  const error = new Error(
    `[atomic-json] failed to write ${path.relative(process.cwd(), target)} after ${MAX_ATTEMPTS} attempts (${reason}). ` +
      'On Windows this usually means another process holds the file open; ' +
      'check for a running dev server, editor preview, or antivirus scan over public/data.'
  )
  error.cause = lastError
  error.code = lastError?.code
  throw error
}

/**
 * Serialize `value` as the pipeline's canonical JSON shape and write it
 * atomically. Byte-for-byte identical to the `JSON.stringify(value, null, 2)`
 * plus trailing newline the pipeline scripts already emitted.
 *
 * @param {string} filePath target file
 * @param {unknown} value value to serialize
 * @param {{ trailingNewline?: boolean, indent?: number }} [options]
 */
export function writeJsonAtomic(filePath, value, options = {}) {
  const indent = options.indent ?? 2
  const trailingNewline = options.trailingNewline ?? true
  const body = JSON.stringify(value, null, indent)
  writeFileAtomic(filePath, trailingNewline ? `${body}\n` : body)
}

export default { writeFileAtomic, writeJsonAtomic }
