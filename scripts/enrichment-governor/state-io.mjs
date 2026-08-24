import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
export const repoRoot = path.resolve(here, '..', '..')
export const stateDir = path.join(repoRoot, 'ops', 'enrichment-governor')
export const writerLockPath = path.join(stateDir, '.lock')

export function statePath(name) {
  return path.join(stateDir, name)
}

export function loadJsonStrict(file, fallback) {
  if (!fs.existsSync(file)) return fallback
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    throw new Error(`Unreadable persistent JSON at ${file}: ${error.message}`)
  }
}

export function atomicJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`)
  fs.renameSync(temp, file)
}

export function appendJsonl(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.appendFileSync(file, `${JSON.stringify(value)}\n`)
}

export function withWriterLock(fn) {
  fs.mkdirSync(stateDir, { recursive: true })
  let fd
  try {
    fd = fs.openSync(writerLockPath, 'wx')
    fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, acquiredAt: new Date().toISOString() }))
  } catch (error) {
    if (error.code === 'EEXIST') throw new Error('enrichment governor state is locked by another writer')
    throw error
  }

  let result
  let operationError = null
  try {
    result = fn()
  } catch (error) {
    operationError = error
  }

  let cleanupError = null
  try {
    fs.closeSync(fd)
  } catch (error) {
    if (error?.code !== 'EBADF') cleanupError = error
  }
  try {
    fs.unlinkSync(writerLockPath)
  } catch (error) {
    if (error?.code !== 'ENOENT' && !cleanupError) cleanupError = error
  }

  if (operationError) throw operationError
  if (cleanupError) throw cleanupError
  return result
}
