# The Hippie Scientist

this shit is always broke. This project is a Vite + React + TypeScript site exploring herbal and psychedelic education. It uses Tailwind CSS for styling and framer-motion for animations.

Recent updates introduced an expanded Learn section, a dedicated About page and a placeholder Store for future merchandise. The navigation bar was rebuilt for better responsiveness and easier access to these pages.

## Quickstart

### Dry-run simulation

1. Copy the sample environment file and fill in the required values:
   ```bash
   cp .env.example .env
   ```
2. Leave trading-specific variables (such as RPC endpoints or API keys) empty or pointed at public devnet resources to ensure no live execution occurs.
3. Launch the project locally in dry-run mode to verify configuration and UI flows:
   ```bash
   npm run dev
   ```

### Live-ready configuration

1. Populate `.env` with production-ready values (RPC endpoints, Telegram credentials, risk caps, etc.).
2. Review risk, safety and alert modules before enabling live execution.
3. Build and deploy the application or service with your preferred target (VPS, serverless host, etc.).

## Environment setup

Create a `.env` file (see `.env.example`) and provide values for the following variables:

- `RPC_URL` – primary Solana RPC endpoint used for on-chain reads.
- `BACKUP_RPC_URL` – fallback RPC endpoint for resiliency.
- `TELEGRAM_BOT_TOKEN` – bot token generated via @BotFather for alerts.
- `TELEGRAM_CHAT_ID` – chat or channel ID that should receive alerts.
- `RUGCHECK_API_KEY` – API token for Rugcheck safety scoring.
- `RISK_PCT` – default portfolio allocation per trade (decimal form).
- `STOPLOSS_PCT` – percentage drop that triggers stop-loss checks.
- `MAX_CONCURRENT` – cap on simultaneously open positions.

## Telegram alerts

Telegram messaging is handled through `src/alerts/telegram.ts`. The module sends trade lifecycle notifications (BUY/SELL/TP/SL) and error reports to the configured chat. If `TELEGRAM_BOT_TOKEN` or `TELEGRAM_CHAT_ID` are missing, the alerts subsystem soft-fails after logging a single warning so local development remains unaffected.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   ![Deploy Status](https://github.com/razzleberrytt/hippie-scientist-site/actions/workflows/pages/pages-build-deployment/badge.svg)

Additional scripts are available:

- `npm run build` – build the site for production
- `npm run preview` – preview the production build
- `npm run deploy` – publish the `dist/` folder to GitHub Pages
- `npm test` – placeholder script

## Folder layout

Key directories now include:

```
src/
  ai/           # advisory-only AI hooks (placeholder for future work)
  alerts/       # Telegram and other alert transports
  core/         # engine, portfolio and execution wiring stubs
  discovery/    # Raydium/Jupiter/Orca discovery adapters
  risk/         # risk management helpers and session PnL tiers
  safety/       # rugcheck integrations and allowlists
  strategies/   # trading strategies (e.g., RSI divergence)
logs/           # runtime logs and journals (git-ignored)
```

Existing site pages remain under `src/pages`, shared components under `src/components`, and build output continues to emit into `dist/`.

## Features

- **Database** – interactive herbal index with tag filtering
- **Learn** – animated lessons with curated resources
- **Blog** – markdown-style posts served from the `posts` data file
- **Community & Safety** – guidelines for responsible exploration
- **Store** – upcoming merch and digital resources
- **Theming** – light/dark modes persisted with local storage
- **Bookmarks** – save favorite blog posts for later

## Educational Resources

This repository includes a variety of learning materials:

- Over twenty short articles in `src/data/posts.ts` on topics like neuroscience, cultural traditions and field research.
- A detailed herb database in `src/data/herbs/herbsData.ts` with pharmacology notes and images.
- Modular lessons and tutorials on the Learn page (`src/pages/Learn.tsx`).

## Potential Upgrades

- Add search and tag filters for blog posts.
- Allow users to bookmark herbs or lessons. _(Posts can already be bookmarked)_
- Integrate interactive quizzes from the Learn section.
- Enable offline access via a service worker.
- Expand the store with downloadable resources.

## Contributing

Pull requests and issue reports are welcome. Please open an issue first if you would like to discuss a major change.

### Data maintenance

- Refresh + validate dataset locally: `npm run data:refresh`
- Refresh + validate + build: `npm run data:refresh+build`

### Merging a patched dataset

- Download JSON from /data-report (Quick-Fill): `herbs_patched.json`
- Merge + validate:

  ```bash
  npm run data:merge -- herbs_patched.json
  npm run data:refresh
  ```

- One-liner (merge → convert/autofill/validate/audit):

  ```bash
  npm run data:merge+refresh -- herbs_patched.json
  ```

- Full rebuild after merge:

  ```bash
  npm run data:merge+build -- herbs_patched.json
  ```
