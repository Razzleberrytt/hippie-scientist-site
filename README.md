# Survive 99: Evolved

[![CI](https://github.com/Razzleberrytt/survive-99-evolved/actions/workflows/ci.yml/badge.svg)](../../actions)
**Phase 5**: mobile big-tap + low-flash preset, FPS auto-fallback, and FOV guard.

- Docs: [Mobile](docs/MOBILE.md) • [Fairness](docs/FAIRNESS.md) • [Playtest](docs/PLAYTEST.md)

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

---

# The Hippie Scientist (Web App Notes)

[![Daily Blog Post](https://github.com/Razzleberrytt/survive-99-evolved/actions/workflows/daily-blog.yml/badge.svg)](https://github.com/Razzleberrytt/survive-99-evolved/actions/workflows/daily-blog.yml)

## Data enrichment from CSV

Run the enrichment pipeline (expects CSV files at `/home/oai/share/psychoactive_herbs_enriched_full.csv` and `/home/oai/share/psychoactive_herbs_enriched_full 3.csv`):

```bash
npm run data:enrich
```

This updates:

- `public/data/herbs.json`
- `public/data/compounds.json`

## Updated dataset sync (recommended)

When you receive new enriched JSON files, place:

- `herbs_combined_updated.json`
- `compounds_combined_updated.json`

in `data-sources/` (preferred), repo root, or `/home/oai/share`, then run:

```bash
npm run update-data
```

The script copies and renames them to:

- `public/data/herbs.json`
- `public/data/compounds.json`

## Manual herb/compound updates

1. Edit `public/data/herbs.json` and/or `public/data/compounds.json`.
2. Keep records keyed by stable `id` values.
3. Add `lastUpdated` ISO timestamps and `sources` arrays for new evidence.
4. Re-run:

```bash
npm run prerender:entities
npm run build:blog
```

## Blog front-matter fields

MDX front-matter now supports:

```yaml
author: 'Auto-Generator'
sources: []
lastUpdated: '2026-03-21'
```

Daily generated posts include `author` and `sources` placeholders by default.

To add references manually in front-matter, use:

```yaml
sources:
  - title: 'Review article title'
    url: 'https://example.org/paper'
    note: 'Optional context'
```

## Accessibility testing

Recommended checks:

```bash
npm run build
npx eslint src --ext .ts,.tsx
```

Use Lighthouse or axe DevTools in the browser to validate color contrast and labeling.

## Deployment + prerender

`npm run build` now prerenders static herb and compound detail pages into `public/herbs/*` and `public/compounds/*`.
This improves crawler visibility and JS-disabled fallback behavior on static hosts (GitHub Pages/Netlify/Vercel static deployments).

## Route-based chunk verification

Run and inspect bundle split output:

```bash
npm run build
```

Then inspect `dist/assets/` and verify route chunks are emitted instead of one large app bundle.

## SPA prerender configuration (Vite)

This project uses `vite-plugin-prerender` in `vite.config.ts`.

During `vite build`, the config reads:

- `public/data/herbs.json`
- `public/data/compounds.json`

and builds static route lists for:

- `/`
- `/herbs`
- `/herbs/:slug` (all slugs in `herbs.json`)
- `/compounds`
- `/compounds/:slug` (all slugs in `compounds.json`)
- `/blog`

This improves crawler coverage while preserving the HashRouter SPA runtime (`#/path`).

### Rebuild and deploy

```bash
npm ci
npm run build
```

Deploy workflow (`.github/workflows/deploy.yml`) publishes `dist/` to `gh-pages`.

## Dataset counts + missing-field report

Generate build-time home counters from `public/data/*.json`:

```bash
node scripts/calc-counts.js
```

This writes `src/data/site-counts.json` (herb + compound counts).
If `public/data/compounds.json` includes a `psychoactive` boolean field, the compound counter uses only entries where `psychoactive === true`; otherwise it counts all compounds.

Generate a detailed missing-fields report used by `/data-report`:

```bash
npm run data:missing
```

This writes `public/data/missing-fields-report.json` and summarizes missing core fields (`class`, `activeCompounds`, `therapeuticUses`, `contraindications`, `interactions`).

## Community contributions

- New contributor guide route: `/contribute`
- Herb/compound detail pages show a contextual “Help us fill in missing data” CTA when core evidence fields are incomplete.
- Evidence issue template: `https://github.com/Razzleberrytt/survive-99-evolved/issues/new?template=evidence-update.yml`

## Monthly data sync workflow

A scheduled workflow is available at `.github/workflows/update-data.yml`.

- Schedule: `0 0 1 * *` (monthly)
- Manual trigger: GitHub → **Actions** → **Monthly data sync** → **Run workflow**
- Steps:
  1. checks out repo
  2. runs `node scripts/sync-updated-datasets.mjs`
  3. runs `npm run data:missing` for missing field metrics
  4. commits/pushes updates to `public/data/herbs.json` + `public/data/compounds.json` when changed

The workflow uses `BOT_GITHUB_TOKEN` (fallback `GITHUB_TOKEN`) for push permissions.
