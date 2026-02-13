/* eslint-disable no-console */

import { getConfig } from '../core/config.ts'
import { getRpcEndpoint, getRpcStats } from '../core/rpc.ts'
import { listOpen } from '../positions/index.ts'
import { equityFromSol, getSolBalance } from '../solana/balance.ts'

async function main(): Promise<void> {
  const config = getConfig()
  const rpcStats = getRpcStats()
  const activeRpc = getRpcEndpoint() ?? config.solana.rpcUrl ?? 'n/a'

  console.log(`DRY_RUN: ${config.dryRun}`)
  console.log(`Active RPC: ${activeRpc}`)
  console.log(`RPC switches: ${rpcStats.switches}`)
  console.log(`Wallet pubkey: ${config.solana.walletPublicKey ?? 'n/a'}`)

  const lamports = await getSolBalance(config.solana.walletPublicKey)
  if (lamports !== null) {
    const equity = equityFromSol(lamports)
    console.log(`SOL balance: ${equity.sol.toFixed(6)} SOL (${lamports.toLocaleString()} lamports)`)
  } else {
    console.log('SOL balance: unavailable')
  }

  const openPositions = await listOpen()
  console.log(`Open positions: ${openPositions.length}`)
}

main().catch(error => {
  console.error('Status command failed.', error)
  process.exitCode = 1
})
