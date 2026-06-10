import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const pagesPath = path.join(process.cwd(), 'src/pages')
const tempPagesPath = path.join(process.cwd(), 'src/pages-temp')

let pagesMoved = false

let exitCode = 0

// Clean stale build artifacts before building to prevent Windows file-locking
// write errors when overwriting a prior out/ directory mid-export.
const outPath = path.join(process.cwd(), 'out')
const nextPath = path.join(process.cwd(), '.next')
for (const dir of [outPath, nextPath]) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
  }
}

try {
  if (fs.existsSync(pagesPath)) {
    console.log('[build] Temporarily moving src/pages to avoid Next.js routing conflicts...')
    fs.renameSync(pagesPath, tempPagesPath)
    pagesMoved = true
  }

  console.log('[build] Running next build...')
  execSync('npx next build', {
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096', NEXT_TELEMETRY_DISABLED: '1' },
  })
} catch (error) {
  console.error('[build] Build failed:', error)
  exitCode = 1
} finally {
  if (pagesMoved && fs.existsSync(tempPagesPath)) {
    console.log('[build] Restoring src/pages...')
    fs.renameSync(tempPagesPath, pagesPath)
  }
  if (exitCode !== 0) {
    process.exit(exitCode)
  }
}
