import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { loadConfig } from '../config'
import { opt } from '../vendor/resolve'

export type TradeRow = {
  id: string
  position_id: string | null
  side: 'BUY' | 'SELL'
  mint: string
  price: number
  size: number
  tx_sig: string | null
  route: string | null
  fee_lamports: number | null
  created_at: number
}

export type QuoteRow = {
  ts: number
  inMint: string
  outMint: string
  amount: string
  outAmount?: string
  slippageBps: number
  latencyMs: number
}

type JsonStore = {
  trades: TradeRow[]
  quotes: QuoteRow[]
}

type SqliteHandle = {
  kind: 'sqlite'
  _db: any
}

type JsonHandle = {
  kind: 'json'
  path: string
  store: JsonStore
}

type DBHandle = SqliteHandle | JsonHandle

let handle: DBHandle | null = null

function ensureDir(filePath: string) {
  const dir = dirname(filePath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function loadJson(path: string): JsonStore {
  if (!existsSync(path)) {
    ensureDir(path)
    const initial: JsonStore = { trades: [], quotes: [] }
    writeFileSync(path, JSON.stringify(initial, null, 2))
    return initial
  }
  try {
    const buf = readFileSync(path, 'utf8')
    const parsed = JSON.parse(buf)
    return {
      trades: Array.isArray(parsed.trades) ? parsed.trades : [],
      quotes: Array.isArray(parsed.quotes) ? parsed.quotes : [],
    }
  } catch {
    return { trades: [], quotes: [] }
  }
}

function persistJson(handle: JsonHandle) {
  const payload: JsonStore = { trades: handle.store.trades, quotes: handle.store.quotes }
  writeFileSync(handle.path, JSON.stringify(payload, null, 2))
}

export function getDB(): DBHandle {
  if (handle) return handle
  const cfg = loadConfig()
  const sqlite = opt<any>('better-sqlite3')
  if (sqlite) {
    const dbPath = cfg.DB_PATH ? resolve(cfg.DB_PATH) : resolve('./snipebt.db')
    ensureDir(dbPath)
    const db = new sqlite(dbPath)
    db.pragma('journal_mode = WAL')
    db.exec(`
      CREATE TABLE IF NOT EXISTS trades(
        id TEXT PRIMARY KEY,
        position_id TEXT,
        side TEXT,
        mint TEXT,
        price REAL,
        size REAL,
        tx_sig TEXT,
        route TEXT,
        fee_lamports INTEGER,
        created_at INTEGER
      );
      CREATE TABLE IF NOT EXISTS quotes(
        ts INTEGER,
        inMint TEXT,
        outMint TEXT,
        amount TEXT,
        outAmount TEXT,
        slippageBps INTEGER,
        latencyMs INTEGER
      );
    `)
    handle = { kind: 'sqlite', _db: db }
    return handle
  }
  const jsonPath = cfg.DB_PATH ? resolve(cfg.DB_PATH) : resolve('./snipebt.json')
  const store = loadJson(jsonPath)
  handle = { kind: 'json', path: jsonPath, store }
  return handle
}

export function insertTrade(row: TradeRow) {
  const db = getDB()
  if (db.kind === 'sqlite') {
    db._db
      .prepare(
        `INSERT INTO trades(id,position_id,side,mint,price,size,tx_sig,route,fee_lamports,created_at)
        VALUES(@id,@position_id,@side,@mint,@price,@size,@tx_sig,@route,@fee_lamports,@created_at)`
      )
      .run(row)
  } else {
    db.store.trades.push(row)
    persistJson(db)
  }
}

export function insertQuote(q: QuoteRow) {
  const provider = getDB()
  const raw = (provider as any)._db || provider
  if ('prepare' in (raw as any)) {
    const stmt = (raw as any).prepare(
      `INSERT INTO quotes(ts,inMint,outMint,amount,outAmount,slippageBps,latencyMs)
      VALUES(@ts,@inMint,@outMint,@amount,@outAmount,@slippageBps,@latencyMs)`
    )
    stmt.run(q)
  } else if ((provider as JsonHandle).kind === 'json') {
    const jsonHandle = provider as JsonHandle
    jsonHandle.store.quotes.push(q)
    persistJson(jsonHandle)
  }
}
