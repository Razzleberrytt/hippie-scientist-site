import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

export interface PositionRecord {
  id: string
  userPublicKey: string
  baseMint: string
  quoteMint: string
  amount: number
  entryPriceUsd?: number
  exitPriceUsd?: number
  openedAt: string
  closedAt?: string
  status: 'open' | 'closed'
  txId?: string
  metadata?: Record<string, unknown>
}

export interface DatabaseSchema {
  positions: PositionRecord[]
  metadata: {
    lastUpdated: string
  }
}

const DATA_DIR = resolve(process.cwd(), 'data')
const DATABASE_FILE = resolve(DATA_DIR, 'positions.json')

async function ensureDatabase(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }

  if (!existsSync(DATABASE_FILE)) {
    const initial: DatabaseSchema = {
      positions: [],
      metadata: { lastUpdated: new Date().toISOString() },
    }

    await writeFile(DATABASE_FILE, JSON.stringify(initial, null, 2), 'utf-8')
  }
}

export async function readDatabase(): Promise<DatabaseSchema> {
  await ensureDatabase()
  const contents = await readFile(DATABASE_FILE, 'utf-8')
  try {
    const parsed = JSON.parse(contents) as DatabaseSchema
    if (!parsed.positions) {
      parsed.positions = []
    }
    if (!parsed.metadata) {
      parsed.metadata = { lastUpdated: new Date().toISOString() }
    }
    return parsed
  } catch {
    return { positions: [], metadata: { lastUpdated: new Date().toISOString() } }
  }
}

export async function writeDatabase(data: DatabaseSchema): Promise<void> {
  const payload = {
    ...data,
    metadata: { lastUpdated: new Date().toISOString() },
  }
  await ensureDatabase()
  await writeFile(DATABASE_FILE, JSON.stringify(payload, null, 2), 'utf-8')
}
