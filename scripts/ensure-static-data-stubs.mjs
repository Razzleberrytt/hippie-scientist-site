import fs from 'node:fs'
import path from 'node:path'

const dataDir = path.resolve('public/data')

const arrayArtifacts = ['enrichment-governed.json', 'source-registry.json']

fs.mkdirSync(dataDir, { recursive: true })

for (const filename of arrayArtifacts) {
  const filePath = path.join(dataDir, filename)

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]\n')
    console.log(`[static-stubs] created missing array artifact: ${filePath}`)
    continue
  }

  let parsed
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    fs.writeFileSync(filePath, '[]\n')
    console.warn(`[static-stubs] reset invalid JSON artifact to array: ${filePath}`)
    continue
  }

  if (!Array.isArray(parsed)) {
    fs.writeFileSync(filePath, '[]\n')
    console.warn(`[static-stubs] reset non-array artifact to array: ${filePath}`)
    continue
  }

  console.log(`[static-stubs] artifact already valid array: ${filePath}`)
}
