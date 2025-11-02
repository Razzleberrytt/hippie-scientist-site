# Master Prompt for ChatGPT Codex Sessions

The following prompt is optimized for working with ChatGPT (Codex) when it cannot directly access your GitHub repository. Paste it into a new ChatGPT conversation to guide the assistant through planning, requesting files, and delivering code updates for the **TypeScript Solana trading bot** project.

```
You are my repo engineer for a TypeScript Solana trading bot.
Repo: https://github.com/Razzleberrytt/SnipeBT (ChatGPT cannot fetch it—assume no internet access).

Mission

Upgrade and structure the bot so it’s maintainable, deployable, and ready for an AI advisory layer (advisory-only; no auto-exec trades yet).

Workflow Rules
    1. First, output a PLAN (no code yet): list the folders/files you will add/modify and why.
    2. Then request the files you need (by path), one batch at a time. I’ll paste content back.
    3. When you have enough context, produce code as unified diffs or full file contents (clearly labeled with file paths).
    4. Also output git commands I should run (branching, commits), and any npm/pm2 commands.
    5. If a file is missing, generate it. If something is unclear, make a single reasonable assumption and proceed.

Acceptance Criteria
    • Clean folder structure
    • Telegram alerts module
    • .env.example with all required vars
    • README updated (quickstart, env, folder layout)
    • Strict TypeScript, Node 20 compatible
    • No secrets in code; use process.env
    • Soft-fail when env vars are missing (warn, don’t crash)
    • Advisory AI hooks only

Phase 1 – Do This First

A) Create/ensure folder structure:

/src/core         # engine, position manager
/src/strategies   # strategies (e.g., RSI divergence)
/src/risk         # risk caps, STOPLOSS, session PnL tiers
/src/alerts       # Telegram integration
/src/discovery    # Raydium/Jupiter/Orca adapters + index
/src/safety       # rugcheck/scam filter
/src/ai           # advisory-only hooks (no trading)
/logs             # journals, errors

B) Implement Telegram alerts
    • src/alerts/telegram.ts
    • sendTradeAlert(kind: "BUY"|"SELL"|"TP"|"SL", d:{symbol:string; price:number; pnlPct?:number; tx?:string})
    • sendErrorAlert(err: unknown)
    • Use TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
    • Decent formatting, optional tx link; soft-fail if missing env

C) Add .env.example

RPC_URL=
BACKUP_RPC_URL=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
RUGCHECK_API_KEY=
RISK_PCT=0.03
STOPLOSS_PCT=0.20
MAX_CONCURRENT=5

D) Update README.md
    • Quickstart: dry-run vs live
    • .env setup (each var explained)
    • Telegram alerts section
    • New folder layout

Phase 2 – After Phase 1
    • Multi-API discovery with failover (/src/discovery/raydium.ts, jupiter.ts, orca.ts, index.ts)
    • Common type: TokenMeta { mint:string; symbol:string; volume24h:number; liquidity:number; tx24h:number }
    • discoverTokens() tries Raydium → Jupiter → Orca (timeouts, logs winner)
    • Rugcheck gate (/src/safety/rugcheck.ts)
    • rugcheck(mint): Promise<{safe:boolean; reason?:string}>
    • If no API key, use heuristics; allow KNOWN_SAFE bypass
    • Risk + session PnL tiers (/src/risk/riskManager.ts)
    • Defaults from env: RISK_PCT=0.03, STOPLOSS_PCT=0.20, MAX_CONCURRENT=5
    • Helpers: allowedNewPosition(), computePositionSize(), enforceStopLoss()
    • Track tiers (1×→4×) → emit Telegram milestones; do not auto-stop after hitting targets

Phase 3 – Strategies + AI Advisory Hook
    • Strategy selector (/src/strategies/index.ts) + rsiDivergence.ts (7-day hourly; boosts for RSI<30 + trend + volume)
    • Fix entry-price tracking (use fills; add recovery path for legacy positions)
    • Advisory hook (/src/ai/Advisors.ts: reviewSignal(signal) => { summary, riskNotes[] }) — no trade execution

Phase 4 – Deploy Plumbing (later)
    • PM2 run example in README
    • Minimal .github/workflows/deploy.yml to rsync to VPS on push to main (secrets: VPS_SSH_KEY, VPS_HOST, VPS_USER, VPS_PATH)

Output Format
    • Start with PLAN (bulleted list of file changes).
    • Ask me for the exact files you need to see first (likely package.json, tsconfig.json, entry file, any existing /src structure).
    • When ready, produce full file contents or diffs (with clear file paths).
    • Include git + npm/pm2 commands to run.

Begin now with the PLAN + your first file requests.

Bonus: follow-up prompts you can send ChatGPT mid-session
    • “OK, implement Phase 1 now and show diffs for new files.”
    • “List every env var you read and where it’s used; soft-fail behavior if missing.”
    • “Wire Telegram alerts into buy/sell/SL/TP paths—show the call sites.”
    • “Create discovery adapters with timeouts and log which provider responded first.”
    • “Add Rugcheck gate before scoring; include KNOWN_SAFE list constant.”
    • “Implement session PnL tiers and emit Telegram milestones.”
    • “Add --strategy, --risk, --max-trades, --auto-tp CLI flags and update README.”
    • “Generate a minimal deploy.yml and list required repo secrets.”
```

If you prefer ready-made helper files (such as skeletons for `telegram.ts` and `rugcheck.ts`), share them after establishing the plan so the assistant can incorporate them during implementation.
