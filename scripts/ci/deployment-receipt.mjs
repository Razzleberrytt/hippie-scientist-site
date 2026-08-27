import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_ORIGIN = 'https://thehippiescientist.net'

function requiredEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function buildReceipt({ commit, workflowRunId, repository }) {
  return {
    schemaVersion: 1,
    commit,
    repository,
    workflowRunId,
  }
}

export function receiptMatches(receipt, expectedCommit) {
  return Boolean(receipt && receipt.schemaVersion === 1 && receipt.commit === expectedCommit)
}

function writeReceipt() {
  const outputPath = requiredEnv('DEPLOY_RECEIPT_PATH')
  const commit = requiredEnv('DEPLOY_SHA')
  const workflowRunId = requiredEnv('GITHUB_RUN_ID')
  const repository = requiredEnv('GITHUB_REPOSITORY')
  const receipt = buildReceipt({ commit, workflowRunId, repository })

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8')
  console.log(`Wrote deployment receipt for ${commit} to ${outputPath}`)
}

async function verifyReceipt() {
  const expectedCommit = requiredEnv('DEPLOY_SHA')
  const origin = (process.env.PRODUCTION_ORIGIN || DEFAULT_ORIGIN).replace(/\/$/, '')
  const attempts = Math.max(1, Number(process.env.DEPLOY_RECEIPT_ATTEMPTS || 30))
  const intervalMs = Math.max(1, Number(process.env.DEPLOY_RECEIPT_INTERVAL_SECONDS || 10)) * 1000
  const baseUrl = `${origin}/.well-known/deployment.json`
  let lastObservation = 'no response'

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const url = `${baseUrl}?expected=${encodeURIComponent(expectedCommit)}&attempt=${attempt}&t=${Date.now()}`
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          'User-Agent': 'hippie-scientist-deployment-receipt-verifier',
        },
        cache: 'no-store',
        redirect: 'follow',
      })

      const text = await response.text()
      if (!response.ok) {
        lastObservation = `HTTP ${response.status}: ${text.slice(0, 200)}`
      } else {
        let receipt
        try {
          receipt = JSON.parse(text)
        } catch {
          lastObservation = `non-JSON response: ${text.slice(0, 200)}`
          receipt = null
        }

        if (receiptMatches(receipt, expectedCommit)) {
          console.log(`Production receipt verified at ${baseUrl}: ${expectedCommit}`)
          return
        }

        lastObservation = `observed commit ${receipt?.commit || '<missing>'}`
      }
    } catch (error) {
      lastObservation = error instanceof Error ? error.message : String(error)
    }

    console.log(`Receipt attempt ${attempt}/${attempts} not ready: ${lastObservation}`)
    if (attempt < attempts) await sleep(intervalMs)
  }

  throw new Error(`Production did not expose exact deploy receipt ${expectedCommit} after ${attempts} attempts; last observation: ${lastObservation}`)
}

async function main() {
  const command = process.argv[2]
  if (command === 'write') return writeReceipt()
  if (command === 'verify') return verifyReceipt()
  throw new Error('Usage: node scripts/ci/deployment-receipt.mjs <write|verify>')
}

const isMain = process.argv[1] && new URL(import.meta.url).pathname === new URL(`file://${process.argv[1]}`).pathname
if (isMain) {
  main().catch((error) => {
    console.error(error?.stack || error)
    process.exitCode = 1
  })
}
