# Survive 99: Evolved

[![CI](https://github.com/Razzleberrytt/survive-99-evolved/actions/workflows/ci.yml/badge.svg)](../../actions)
**Phase 3**: server policy/age gating, UI purchase guard, policy-aware ProcessReceipt, `/policycheck`, and `/navpreset base-safe`.

- Docs: [Playtest](docs/PLAYTEST.md) • [Release](docs/RELEASE.md)

# Survive 99: Evolved

[![CI](https://github.com/Razzleberrytt/survive-99-evolved/actions/workflows/ci.yml/badge.svg)](../../actions)
**Phase 2**: admin gating, centralized telemetry, server currency, stricter lint.

- Docs: [Playtest](docs/PLAYTEST.md) • [Release](docs/RELEASE.md)

# Survive 99: Evolved

[![CI](https://github.com/Razzleberrytt/survive-99-evolved/actions/workflows/ci.yml/badge.svg)](../../actions)
A Rojo/Wally Roblox project for a survive-the-night co-op experience with live-ops toggles and soft-launch discipline.

- **Docs:** [Playtest](docs/PLAYTEST.md) • [Release](docs/RELEASE.md)

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
