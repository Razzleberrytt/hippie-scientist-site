import { loadConfig } from '../config'
import { opt } from '../vendor/resolve'

type Conn = any // real type from @solana/web3.js when present

let _primary: Conn | null = null
let _backup: Conn | null = null
let active: 'primary' | 'backup' = 'primary'
let errorStreak = 0
let switches = 0

function mkConnection(url: string | undefined): Conn | null {
  const web3 = opt<any>('@solana/web3.js')
  if (!url || !web3) return null
  return new web3.Connection(url, { commitment: 'confirmed' })
}

export function connection(): Conn | null {
  const { RPC_PRIMARY, RPC_BACKUP } = loadConfig()
  _primary ??= mkConnection(RPC_PRIMARY)
  _backup ??= mkConnection(RPC_BACKUP)
  if (active === 'primary') return _primary ?? _backup
  return _backup ?? _primary
}

export function noteRpcError() {
  errorStreak++
  if (errorStreak >= 3) {
    active = active === 'primary' ? 'backup' : 'primary'
    switches++
    errorStreak = 0
  }
}

export function noteRpcSuccess() {
  errorStreak = 0
}
export function stats() {
  return { active, errorStreak, switches }
}

export async function confirmTx(sig: string, timeoutMs = 20_000): Promise<boolean> {
  const conn = connection()
  if (!conn) return true // offline stub
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await conn.getSignatureStatus(sig, { searchTransactionHistory: false })
      if (
        r?.value?.confirmationStatus === 'confirmed' ||
        r?.value?.confirmationStatus === 'finalized'
      ) {
        noteRpcSuccess()
        return true
      }
    } catch {
      noteRpcError()
    }
    await new Promise(r => setTimeout(r, 750))
  }
  noteRpcError()
  return false
}
