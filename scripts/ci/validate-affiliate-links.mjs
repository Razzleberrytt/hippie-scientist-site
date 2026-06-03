import fs from 'node:fs'
import path from 'node:path'

const IGNORED_FILES = [
  'config/affiliate.ts',
  'src/lib/affiliate-registry.ts',
  'src/lib/affiliate.ts',
  'src/lib/curatedProducts.ts', // legacy quarantined file
]

const TARGET_DIRS = [
  'src/components',
  'src/lib',
  'app',
]

function getFilesRecursively(dir) {
  let results = []
  if (!fs.existsSync(dir)) return results
  const list = fs.readdirSync(dir)
  for (const file of list) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath))
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.tsx')) {
        results.push(filePath)
      }
    }
  }
  return results
}

let hasErrors = false
const errors = []

// Scan all target directories
for (const targetDir of TARGET_DIRS) {
  const files = getFilesRecursively(targetDir)

  for (const file of files) {
    // Normalize path to use forward slashes for cross-platform matching
    const normalizedFile = file.replace(/\\/g, '/')
    if (IGNORED_FILES.some(ignored => normalizedFile.endsWith(ignored))) {
      continue
    }

    const content = fs.readFileSync(file, 'utf8')
    if (content.includes('amazon.com') || content.includes('amazon.co.uk')) {
      const hasConfigRef =
        content.includes('AFFILIATE_TAGS') ||
        content.includes('AMAZON_ASSOCIATE_ID')

      if (!hasConfigRef) {
        errors.push({
          file: normalizedFile,
          reason: 'Contains references to amazon.com links but does not import or use central AFFILIATE_TAGS or AMAZON_ASSOCIATE_ID configurations to enforce affiliate tracking.',
        })
        hasErrors = true
      }
    }
  }
}

if (hasErrors) {
  console.error('\x1b[31m[FAIL] Affiliate Link Compliance Errors Found:\x1b[0m')
  errors.forEach(err => {
    console.error(`- ${err.file}:${err.line}: "${err.content}"`)
    console.error(`  Reason: ${err.reason}`)
  })
  process.exit(1)
} else {
  console.log('\x1b[32m[PASS] All Amazon links are compliant with affiliate tagging regulations.\x1b[0m')
  process.exit(0)
}
