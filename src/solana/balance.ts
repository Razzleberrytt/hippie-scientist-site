import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'

import { getConfig } from '../core/config.ts'
import { createLogger } from '../core/logger.ts'
import { getRpcEndpoint } from '../core/rpc.ts'

const logger = createLogger('SolanaBalance')

let cachedConnection: Connection | null = null
let cachedRpcEndpoint: string | null = null

function getConnection(): Connection {
  const { commitment } = getConfig().solana
  const rpcEndpoint = getRpcEndpoint()

  if (!rpcEndpoint) {
    throw new Error('No RPC endpoint configured. Set RPC_PRIMARY or SOLANA_RPC_URL.')
  }

  if (!cachedConnection || cachedRpcEndpoint !== rpcEndpoint) {
    cachedRpcEndpoint = rpcEndpoint
    cachedConnection = new Connection(rpcEndpoint, commitment)
  }

  return cachedConnection
}

function resolvePublicKey(pubkey?: string): PublicKey | null {
  if (pubkey) {
    try {
      return new PublicKey(pubkey)
    } catch (error) {
      logger.warn('Failed to parse provided wallet public key.', error)
      return null
    }
  }

  const { keypairPath } = getConfig().solana
  if (!keypairPath) {
    return null
  }

  try {
    const filePath = resolve(keypairPath)
    const contents = readFileSync(filePath, 'utf-8')
    const secret = JSON.parse(contents) as number[]
    const keypair = Keypair.fromSecretKey(Uint8Array.from(secret))
    return keypair.publicKey
  } catch (error) {
    logger.warn('Unable to derive wallet public key from keypair file.', error)
    return null
  }
}

export async function getSolBalance(pubkey?: string): Promise<number | null> {
  const publicKey = resolvePublicKey(pubkey)
  if (!publicKey) {
    logger.warn('SOL balance request skipped: no wallet public key available.')
    return null
  }

  try {
    const connection = getConnection()
    return await connection.getBalance(publicKey)
  } catch (error) {
    logger.error('Failed to fetch SOL balance.', error)
    return null
  }
}

export function equityFromSol(lamports: number, priceUsd?: number): { sol: number; usd: number } {
  const sol = lamports / LAMPORTS_PER_SOL
  const usd = priceUsd ? sol * priceUsd : 0
  return { sol, usd }
}
