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
  // Next.js 15 static export on Windows occasionally throws an ENOENT when it tries to
  // rename .next/export/500.html -> .next/server/pages/500.html after a successful page
  // generation pass (all 1250+ pages exported).  The out/ directory is fully populated
  // at this point so the export itself succeeded.  We catch only that specific race and
  // treat the build as passing; all other errors still fail the pipeline.
  const isKnown500Rename =
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 'ENOENT' &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.includes('500.html')

  // Also detect when the error is wrapped inside a child_process exec error whose
  // stderr / stdout contains the ENOENT rename message.
  const execMsg = error && typeof error === 'object' && 'stderr' in error
    ? String(error.stderr)
    : ''
  const isKnown500RenameExec =
    execMsg.includes('500.html') && execMsg.includes('ENOENT')

  const outExists = fs.existsSync(path.join(process.cwd(), 'out', 'index.html'))

  if ((isKnown500Rename || isKnown500RenameExec) && outExists) {
    console.warn(
      '[build] WARNING: Next.js threw a known Windows rename error for 500.html, but the ' +
      'out/ directory was populated successfully. Treating as a successful export.',
    )
  } else {
    console.error('[build] Build failed:', error)
    exitCode = 1
  }
} finally {
  if (pagesMoved && fs.existsSync(tempPagesPath)) {
    console.log('[build] Restoring src/pages...')
    fs.renameSync(tempPagesPath, pagesPath)
  }
  if (exitCode !== 0) {
    process.exit(exitCode)
  }
}
