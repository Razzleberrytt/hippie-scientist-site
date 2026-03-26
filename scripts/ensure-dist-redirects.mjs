import { copyFile, access } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'

const source = path.resolve('public/_redirects')
const target = path.resolve('dist/_redirects')

try {
  await access(target, constants.F_OK)
  console.log('[ensure-dist-redirects] dist/_redirects already exists')
} catch {
  await copyFile(source, target)
  console.log('[ensure-dist-redirects] copied public/_redirects -> dist/_redirects')
}
