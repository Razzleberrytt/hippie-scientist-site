# SnipeBT — Solana Liquidity Sniper Bot

`v1-local-sync` merges the locally maintained trading features into the public repo so the bot can run reproducibly on any Node 20 host. The bot is advisory-first (no private keys committed) and focuses on quick liquidity discovery with strict risk controls.

## Features

- **Telegram alerts** for buy fills, sell exits, session PnL milestones, and critical errors.
- **Multi-API discovery** with Raydium → Jupiter → Orca failover so routing stays resilient when a venue is degraded.
- **Rugcheck safety gate** that blocks entry when a token scores poorly or is explicitly flagged.
- **Accurate entry tracking** with weighted-average fills to avoid drift in partial fills.
- **Session PnL tiers** that roll forward new profit targets once the current tier is cleared.
- **Multiple strategies** selectable at runtime (momentum, mean reversion, sniper) with optional JSON overrides.

## Project Structure

```
├── src
│   ├── alerts/            # Telegram transport
│   ├── ai/Advisors/       # Advisory-only AI stubs
│   ├── config/            # Environment bootstrap
│   ├── discovery/         # Raydium/Jupiter/Orca discovery failover
│   ├── risk/              # Position sizing, stop losses, PnL tiers
│   ├── safety/            # Rugcheck validation
│   ├── session/           # Trading session orchestration
│   ├── strategies/        # Strategy implementations
│   ├── types/             # Shared trading types
│   └── utils/             # Logging utilities
├── logs/                  # Session log output (`logs/session.log`)
├── docs/                  # Architecture and operational docs
└── .github/workflows/     # Deployment pipeline
```

## Environment Variables

Create a `.env` file based on `.env.example`.

| Variable                | Description                                                               |
| ----------------------- | ------------------------------------------------------------------------- |
| `RPC_ENDPOINT`          | Solana RPC URL used for account reads (default mainnet-beta).             |
| `WS_ENDPOINT`           | Optional Solana websocket URL.                                            |
| `KEYPAIR_PATH`          | Local filesystem path to the bot operator keypair.                        |
| `TELEGRAM_BOT_TOKEN`    | Bot token used to send Telegram alerts.                                   |
| `TELEGRAM_CHAT_ID`      | Chat or channel ID that receives Telegram alerts.                         |
| `RAYDIUM_API_URL`       | Raydium discovery endpoint (defaults to public API).                      |
| `JUPITER_API_URL`       | Jupiter quote API base URL.                                               |
| `ORCA_API_URL`          | Orca quote API base URL.                                                  |
| `RUGCHECK_API_URL`      | Rugcheck validation API.                                                  |
| `SESSION_TARGET_PCT`    | Percent PnL to reach before the first session tier completes (default 5). |
| `SESSION_TIER_PCT`      | Percent increment to add after each tier completion (default 5).          |
| `ACCOUNT_RISK_PCT`      | Percent of account allocated per trade (default 3).                       |
| `STOPLOSS_PCT`          | Stop loss percentage applied to entries (default 20).                     |
| `MAX_CONCURRENT_TRADES` | Maximum open trades (default 5).                                          |
| `STRATEGIES`            | Comma-separated strategies to enable by default.                          |
| `LOG_FILE`              | Optional override path for the rolling session log.                       |

## CLI Usage

Install dependencies with `npm ci` and then run the CLI with `ts-node`:

```bash
npx ts-node src/main.ts --help
```

Common invocations:

```bash
# Run with defaults using SOL/USDC pair
npx ts-node src/main.ts

# Override strategies and account balance
npx ts-node src/main.ts --strategies momentum,meanReversion --balance 2500

# Supply inline strategy configs (JSON string)
npx ts-node src/main.ts --config '[{"name":"momentum","minConfidence":0.65,"allocationPct":12}]'
```

The CLI loads `.env` automatically, requests liquidity quotes, validates via Rugcheck, and only then evaluates the active strategies. Alerts are emitted for each material event.

## Development

```bash
npm ci
npx ts-node src/main.ts --help
```

The Node runtime must be v20.x. No private keys are stored in this repository—configure them locally via `.env`.

## Deployment

A minimal deployment target is provided via PM2 and GitHub Actions:

- `npm run start:pm2` (see `package.json`) starts the bot under PM2 using the compiled TypeScript entry.
- `.github/workflows/deploy.yml` ships the project to a remote server over SSH after pushes to `main`.

Ensure the remote host has Node 20, PM2, and a populated `.env` file before enabling the workflow.

## Documentation

Supplemental notes live under `docs/`. Start with [`docs/trading-session.md`](docs/trading-session.md) for an overview of the runtime flow.
