import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = join(process.cwd(), 'src', 'components')
const violations = []

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry)
    const st = statSync(abs)
    if (st.isDirectory()) {
      walk(abs)
      continue
    }

    const rel = abs.replace(`${process.cwd()}/`, '')
    if (!rel.endsWith('.tsx')) continue
    if (!rel.includes('Herb') || !rel.includes('Card')) continue
    if (rel === 'src/components/HerbCard.tsx') continue
    violations.push(rel)
  }
}

walk(root)

if (violations.length > 0) {
  console.error('[verify:herb-card-canonical] Only src/components/HerbCard.tsx is allowed.')
  for (const file of violations) {
    console.error(` - ${file}`)
  }
  process.exit(1)
}

console.log('[verify:herb-card-canonical] Canonical HerbCard check passed.')
