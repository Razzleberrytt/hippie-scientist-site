# Trading Session Overview

This document captures the new local trading session architecture used in the `v1-local-sync` branch.

## Module Layout

- `src/alerts/`: Notification pipelines (currently Telegram).
- `src/discovery/`: Liquidity discovery and price routing with Raydium → Jupiter → Orca failover.
- `src/strategies/`: Portfolio of trading strategies with runtime selection.
- `src/risk/`: Session risk controls, stop-loss calculations, and PnL tracking tiers.
- `src/safety/`: Rugcheck safety integrations and token validation.
- `src/session/`: Session orchestration combining discovery, risk, strategies, and alerts.
- `src/ai/Advisors/`: Advisory-only agent stubs for human-in-the-loop review.
- `logs/`: Plaintext session logs captured via `src/utils/logger`.

## Session Flow

1. Environment configuration is loaded from `.env` (see `.env.example`).
2. Liquidity discovery queries Raydium, Jupiter, and Orca in order until a viable quote is found.
3. Rugcheck validates the base token mint before strategies are evaluated.
4. Enabled strategies emit signals which are filtered by risk and confidence rules.
5. Risk manager applies entry-price averaging to avoid drift and enforces the max concurrent trades limit.
6. Session tracker advances the PnL tier once the current target is reached and continues monitoring.
7. Telegram alerts are dispatched for fills, exits, PnL updates, and fatal errors.

## Future Work

- Incorporate live Solana RPC connections for fills and account updates.
- Persist trade history to a dedicated datastore instead of rolling logs.
- Expand the advisory network to support multiple AI sources.
