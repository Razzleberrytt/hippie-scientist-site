import fs from 'node:fs/promises'
import { writeFileSync as defaultWriteFileSync } from 'node:fs'

const TRANSIENT_WINDOWS_WRITE_CODES = new Set(['UNKNOWN', 'EBUSY', 'EPERM', 'EACCES'])

export async function writeFileWithTransientRetry(
  filePath,
  contents,
  options = 'utf8',
  {
    retries = 5,
    baseDelayMs = 25,
    writeFile = fs.writeFile,
    delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  } = {},
) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await writeFile(filePath, contents, options)
    } catch (error) {
      const code = String(error?.code || '')
      if (!TRANSIENT_WINDOWS_WRITE_CODES.has(code) || attempt >= retries) throw error
      await delay(baseDelayMs * (2 ** attempt))
    }
  }
}

export function writeFileSyncWithTransientRetry(
  filePath,
  contents,
  options = 'utf8',
  {
    retries = 5,
    baseDelayMs = 25,
    writeFileSync = defaultWriteFileSync,
    delay = (milliseconds) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds),
  } = {},
) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return writeFileSync(filePath, contents, options)
    } catch (error) {
      const code = String(error?.code || '')
      if (!TRANSIENT_WINDOWS_WRITE_CODES.has(code) || attempt >= retries) throw error
      delay(baseDelayMs * (2 ** attempt))
    }
  }
}
