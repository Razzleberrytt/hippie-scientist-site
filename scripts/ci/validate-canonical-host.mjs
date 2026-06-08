import fs from 'node:fs'
import path from 'node:path'

const directories = ['app', 'components', 'lib', 'src']
const target = 'https://www.thehippiescientist.net'

function getFiles(dir) {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = entries.flatMap((entry) => {
    const res = path.join(dir, entry.name)
    return entry.isDirectory() ? getFiles(res) : res
  })
  return files
}

let failed = false
const violatedFiles = []

for (const dir of directories) {
  const allFiles = getFiles(dir)
  for (const file of allFiles) {
    if (/\.(js|ts|mjs|tsx|jsx|json)$/.test(file)) {
      const content = fs.readFileSync(file, 'utf8')
      if (content.includes(target)) {
        const normalizedPath = path.normalize(file).replace(/\\/g, '/')
        violatedFiles.push(normalizedPath)
        failed = true
      }
    }
  }
}

if (failed) {
  console.error(`[validate-canonical-host] FAIL: References to ${target} detected in the following files:`)
  violatedFiles.forEach(f => console.error(`  - ${f}`))
  process.exit(1)
}

console.log('[validate-canonical-host] PASS: No www.thehippiescientist.net references found in active code.')
