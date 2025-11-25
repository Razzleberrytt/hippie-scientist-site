import { randomUUID } from 'node:crypto'

import { readDatabase, writeDatabase, type PositionRecord } from '../data/db.ts'

export interface OpenPositionInput {
  userPublicKey: string
  baseMint: string
  quoteMint: string
  amount: number
  entryPriceUsd?: number
  metadata?: Record<string, unknown>
}

export interface ClosePositionInput {
  id: string
  exitPriceUsd?: number
  txId?: string
}

export async function listOpen(): Promise<PositionRecord[]> {
  const db = await readDatabase()
  return db.positions.filter(position => position.status === 'open')
}

export async function openPosition(input: OpenPositionInput): Promise<PositionRecord> {
  const db = await readDatabase()
  const record: PositionRecord = {
    id: randomUUID(),
    userPublicKey: input.userPublicKey,
    baseMint: input.baseMint,
    quoteMint: input.quoteMint,
    amount: input.amount,
    entryPriceUsd: input.entryPriceUsd,
    openedAt: new Date().toISOString(),
    status: 'open',
    metadata: input.metadata,
  }

  db.positions.push(record)
  await writeDatabase(db)
  return record
}

export async function closePosition(input: ClosePositionInput): Promise<PositionRecord | null> {
  const db = await readDatabase()
  const index = db.positions.findIndex(position => position.id === input.id)
  if (index === -1) {
    return null
  }

  const record = db.positions[index]
  record.status = 'closed'
  record.closedAt = new Date().toISOString()
  record.exitPriceUsd = input.exitPriceUsd
  record.txId = input.txId ?? record.txId

  db.positions[index] = record
  await writeDatabase(db)
  return record
}
