# SnipeBT Runbook

## Overview

This runbook captures the operational steps for running the SnipeBT trading bot in both dry-run and live environments. It documents required configuration, validation, command usage, and standard operating procedures for incidents and recoveries.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment file and adjust values:
   ```bash
   cp .env.example .env
   ```
3. Populate RPC endpoints, wallet credentials, and Telegram bot information. The bot honours `RPC_PRIMARY` and optional comma-separated `RPC_FALLBACKS`.
4. Verify Node.js 20.x is installed when deploying to production.

## Dry-run vs. Live

- **Dry-run** (`BOT_MODE=dry-run`) is safe for local testing. Transactions, liquidations, and sell commands are logged but never broadcast.
- **Live** (`BOT_MODE=live`) enables Jupiter swap submission and position closing. Ensure funding, key management, and alerting are fully configured before switching.

## Commands

- `npm run build` – Validates the TypeScript project and static assets.
- `npm run start:dry` – Boots the bot in dry-run mode with polling, Telegram handlers, and the health endpoint.
- `npm run start:live` – Boots the bot in live mode, enabling trade execution and liquidations.
- `npm run status` – Prints operational status: DRY_RUN flag, RPC endpoint, wallet balance, and open position count.

## Telegram Operations

- `/positions` – Lists active positions with base mint, amount, and entry price.
- `/liquidate_all [MINT]` – Triggers liquidation of open positions filtered by base mint when provided. Command is blocked in dry-run mode.
- `/sell <MINT> <AMOUNT>` – Queues a manual sell request (blocked in dry-run). Use sparingly in live mode.

## Liquidation Flow

1. `liquidateAll` pulls open positions from the JSON data store.
2. Risk checks should have been performed before the position opened; liquidation will simulate or submit a Jupiter swap.
3. On success, `closePosition` records the exit price, transaction signature, and closure timestamp.
4. Failures are logged and surfaced through Telegram alerts when enabled.

## Data Management

- Positions persist under `./data/positions.json`.
- Create backups prior to upgrades:
  ```bash
  cp data/positions.json data/backups/positions-$(date +%Y%m%d).json
  ```
- Restore from backup by copying the desired file back to `data/positions.json` and restarting the bot.

## Key Rotation

1. Generate a new Solana keypair and fund it as needed.
2. Update `SOLANA_KEYPAIR_PATH` (and `SOLANA_WALLET_PUBKEY` if provided explicitly) in the environment file.
3. Restart the bot; the status command confirms the active wallet and balance.

## Deploy & Rollback

- **Deploy:**
  ```bash
  docker compose -f docker-compose.prod.yml up -d --build
  ```
  The compose file mounts `./data` for persistence and exposes a `/health` endpoint for monitoring.
- **Rollback:**
  ```bash
  docker compose -f docker-compose.prod.yml down
  git checkout <known-good-commit>
  docker compose -f docker-compose.prod.yml up -d --build
  ```
  Restore position backups if necessary.

## Service Level Objectives

- **Availability:** Health endpoint responds with HTTP 200 within 2 seconds.
- **Alerting:** Low-balance and RPC-switch alerts delivered to Telegram within 1 minute of detection when Telegram is configured.
- **Data Integrity:** Position store updates succeed on each open/close action; verify via `npm run status` and Telegram `/positions`.

## Incident Response

1. **Alert received** – Acknowledge in the relevant channel.
2. **Triage** – Use `npm run status` to confirm wallet balance, RPC endpoint, and position counts.
3. **Mitigation** – Adjust RPC endpoints or fund wallet as required. For stuck positions, trigger `/liquidate_all` or manual `/sell`.
4. **Post-incident** – Record a brief summary, update runbook if gaps were identified, and schedule a retrospective when severity warrants.
