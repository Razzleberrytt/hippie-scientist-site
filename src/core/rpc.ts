import { createLogger } from './logger.ts'

const logger = createLogger('RpcState')

let activeRpcEndpoint: string | null = null
let rpcSwitchCount = 0

export function initializeRpc(primary?: string, fallbacks?: string): void {
  const fallbackList = fallbacks
    ?.split(',')
    .map(entry => entry.trim())
    .filter(Boolean)

  if (primary) {
    setRpcEndpoint(primary, false)
  } else if (fallbackList && fallbackList.length > 0) {
    setRpcEndpoint(fallbackList[0], false)
  }
}

export function setRpcEndpoint(endpoint: string, countSwitch = true): void {
  if (!endpoint) {
    return
  }

  if (activeRpcEndpoint === endpoint) {
    return
  }

  activeRpcEndpoint = endpoint
  if (countSwitch) {
    rpcSwitchCount += 1
    logger.info(`RPC endpoint switched to ${endpoint}`)
  }
}

export function getRpcEndpoint(): string | null {
  return activeRpcEndpoint
}

export function getRpcStats(): { endpoint: string | null; switches: number } {
  return { endpoint: activeRpcEndpoint, switches: rpcSwitchCount }
}
