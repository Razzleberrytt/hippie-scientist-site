# SnipeBT Trading Bot

SnipeBT is a modular Solana trading bot focused on rapid liquidity events. Phase 1 introduces a clean project layout,
centralised configuration and a Telegram alert subsystem that can be shared across strategies.

## Prerequisites

- Node.js 20.x
- npm 9+
- A Solana RPC endpoint (devnet or mainnet)
- Optional: Telegram bot + chat/channel to receive alerts

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the sample environment file and update values as needed:
   ```bash
   cp .env.example .env
   ```
3. Adjust environment variables for your target network and alerting setup (see [Environment variables](#environment-variables)).
4. Run the bot entrypoint (example using tsx):
   ```bash
   npx tsx src/core/bot.ts
   ```

## Environment variables

| Variable                             | Description                                                                |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `NODE_ENV`                           | Runtime environment label used for logging context.                        |
| `BOT_MODE`                           | `dry-run` prevents trade execution, `live` allows execution logic to run.  |
| `LOG_LEVEL`                          | Global log verbosity (`debug`, `info`, `warn`, `error`).                   |
| `SOLANA_RPC_URL`                     | Primary Solana RPC endpoint for market + account data.                     |
| `SOLANA_KEYPAIR_PATH`                | Path to the keypair file used for signing live transactions.               |
| `SOLANA_COMMITMENT`                  | Commitment level for RPC requests (`processed`, `confirmed`, `finalized`). |
| `TELEGRAM_BOT_TOKEN`                 | Bot token from @BotFather used for alert delivery.                         |
| `TELEGRAM_CHAT_ID`                   | Target chat/channel ID that should receive alerts.                         |
| `DEFAULT_STRATEGY`                   | Strategy name loaded by `Bot.create`. Defaults to `liquiditySniper`.       |
| `LIQUIDITY_SNIPER_POLL_INTERVAL_MS`  | Polling cadence for the Liquidity Sniper strategy.                         |
| `LIQUIDITY_SNIPER_MIN_LIQUIDITY_USD` | Minimum liquidity threshold (USD) before acting.                           |

> **Soft fail behaviour:** If Telegram credentials are missing, alerts log a warning once and silently return so development work
> continues without interruption.

## Folder structure

```
src/
  alerts/             # Alert transports (Telegram, future email/webhooks)
  core/               # Configuration, logging and bot orchestration
  strategies/         # Base strategy interfaces and concrete strategies
logs/                  # Runtime logs (add .gitignore/.gitkeep as needed)
```

Additional application code (UI, reporting, etc.) continues to live alongside this layout inside `src/`.

## Running modes

- **Dry-run (`BOT_MODE=dry-run`)** – default. Strategies execute discovery logic but skip any trade execution routines. Use this for
  local testing and validation without risking funds.
- **Live (`BOT_MODE=live`)** – enables live execution paths. Ensure `SOLANA_RPC_URL`, wallet credentials and alert channels are fully
  configured before switching to this mode.

## Logging & alerts

- Logging is handled by `src/core/logger.ts`. Set `LOG_LEVEL` to control verbosity.
- Configuration is centralised in `src/core/config.ts`, which also normalises numeric values and updates the logger level.
- Telegram helpers (`src/alerts/telegram.ts`) provide `sendTradeAlert` and `sendErrorAlert` helpers that other modules can re-use
  without worrying about configuration checks.

## Strategies

- `src/strategies/baseStrategy.ts` defines the base lifecycle (`initialize`, `start`, `stop`) along with the shared context passed to
  strategies.
- `src/strategies/liquiditySniper.ts` is the example implementation. It performs a stubbed liquidity scan loop using the configured
  polling interval and can be extended with real execution logic.

## Next steps

Future phases will add richer Solana execution clients, deeper strategy implementations, automated risk controls and enhanced alert
channels.

## Phase 2 usage

- **Run the metrics server + collector:**
  1. Build the bot: `npm run build`
  2. Provide collector env vars (`COLLECTOR_IN`, `COLLECTOR_OUT`, `COLLECTOR_AMT`, optional `COLLECTOR_MS`).
  3. Start in dry-run mode: `npm run start:dry`
- **Record quotes without trades:** the collector stores quote telemetry in SQLite (or the JSON fallback) every interval so dashboards can be built offline later.
- **Try the naive live loop:**
  1. Ensure `DRY_RUN=false` and populate the `NAIVE_*` variables with a funded wallet + mint pair.
  2. Build (`npm run build`) and launch: `npm run start:live`
  3. The loop requests a Jupiter quote, builds the swap transaction, and attempts to submit/signal confirmations.
- **Reminder:** live execution requires a funded Solana wallet capable of signing Jupiter v6 swap transactions. Keep DRY-RUN as the default unless you understand the risks.
