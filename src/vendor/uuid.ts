import { opt } from './resolve'

function cryptoRandomUUID(): string {
  const g = globalThis as typeof globalThis & { crypto?: Crypto }
  if (g.crypto && typeof g.crypto.randomUUID === 'function') {
    return g.crypto.randomUUID()
  }
  const nodeCrypto = opt<typeof import('crypto')>('crypto')
  if (nodeCrypto && typeof nodeCrypto.randomUUID === 'function') {
    return nodeCrypto.randomUUID()
  }
  const arr = new Uint8Array(16)
  if (g.crypto && typeof g.crypto.getRandomValues === 'function') {
    g.crypto.getRandomValues(arr)
  } else if (nodeCrypto && typeof nodeCrypto.randomFillSync === 'function') {
    nodeCrypto.randomFillSync(arr)
  } else {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256)
    }
  }
  arr[6] = (arr[6] & 0x0f) | 0x40
  arr[8] = (arr[8] & 0x3f) | 0x80
  const hex = Array.from(arr, b => b.toString(16).padStart(2, '0'))
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex
    .slice(8, 10)
    .join('')}-${hex.slice(10, 16).join('')}`
}

export function uuidv4(): string {
  const uuid = opt<{ v4: () => string }>('uuid')
  if (uuid && typeof uuid.v4 === 'function') {
    return uuid.v4()
  }
  return cryptoRandomUUID()
}
