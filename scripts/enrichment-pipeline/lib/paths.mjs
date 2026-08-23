import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

export const pipelineRoot = path.join(repoRoot, 'scripts/enrichment-pipeline')
export const contractDir = path.join(pipelineRoot, 'contract')
export const contractPath = path.join(contractDir, 'enrichment-contract.json')
export const sourceClassesPath = path.join(contractDir, 'source-classes.json')

/**
 * All mutable pipeline state lives under ops/enrichment. Nothing here is
 * canonical: it is a rebuildable queue, job ledger, and candidate store.
 *
 * ENRICHMENT_OPS_DIR relocates that state. Tests use it to get an isolated
 * ledger instead of writing over an operator's working queue; it has no other
 * intended use, and it can never widen what is writable because
 * `assertPipelineWritePath` is derived from whatever it resolves to.
 */
export const opsRoot = process.env.ENRICHMENT_OPS_DIR
  ? path.resolve(process.env.ENRICHMENT_OPS_DIR)
  : path.join(repoRoot, 'ops/enrichment')
export const queuePath = path.join(opsRoot, 'queue.json')
export const jobsPath = path.join(opsRoot, 'jobs.json')
export const candidatesDir = path.join(opsRoot, 'candidates')
export const reportsDir = path.join(opsRoot, 'reports')
export const researchIndexPath = path.join(opsRoot, 'research-index.json')
export const readinessPath = path.join(opsRoot, 'readiness.json')
export const exportsDir = path.join(opsRoot, 'exports')

/** Canonical production inputs — read-only for every pipeline component. */
export const workbookPath = path.join(repoRoot, 'data-sources/herb_monograph_master.xlsx')
export const publicDataDir = path.join(repoRoot, 'public/data')
export const workbookPatchesDir = path.join(repoRoot, 'data-sources/workbook-patches')

/**
 * Guard used by the candidate layer and the exporter: a pipeline-written path
 * must resolve inside ops/enrichment (or, for exported proposals, inside the
 * reviewable workbook-patch directory). Anything else is a canonical write
 * target and must be refused.
 */
export function assertPipelineWritePath(target, { allowPatchDir = false } = {}) {
  const resolved = path.resolve(target)
  const allowed = [opsRoot, ...(allowPatchDir ? [workbookPatchesDir] : [])]
  const ok = allowed.some((base) => {
    const rel = path.relative(base, resolved)
    return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
  })
  if (!ok) {
    throw new Error(
      `Refusing to write outside the pipeline state directory.\n` +
        `  target:  ${resolved}\n` +
        `  allowed: ${allowed.join(', ')}`,
    )
  }
  return resolved
}

export function relative(target) {
  return path.relative(repoRoot, target).split(path.sep).join('/')
}
