# Prioritization freshness and unlock contract

The authoritative backlog keeps exactly one score formula:

`Score = (Business Impact × User Value × Traffic Potential × Strategic Leverage × Confidence) / Effort`

This contract clarifies the inputs. It does not add a second score, bonus, or hidden queue.

## Strategic Leverage

Strategic Leverage remains a 1–5 backlog input. Any promoted item must record why its assigned value is justified using one or more explicit evidence classes:

- `dependency-unlock` — completing the item unblocks already-ranked downstream work;
- `shared-infrastructure` — the result is reusable by multiple routes/workflows/lanes;
- `recurring-throughput` — the result reduces repeated effort or increases governed throughput;
- `isolated` — the result has no material shared/unlock effect.

The contract validates that leverage evidence exists; it does not calculate a hidden leverage score. The backlog owner remains responsible for assigning the 1–5 Strategic Leverage input from the documented evidence.

## Freshness-sensitive Confidence

Items are externally contingent when their ranking materially depends on external demand, production state, analytics, platform behavior, or an unresolved technical assumption. A promoted externally contingent item must record both `last_verified` (`YYYY-MM-DD`) and a non-empty verification scope.

Freshness is deterministic against an explicit evaluation date:

| Age | State | Confidence cap | Promotion |
|---|---|---:|---|
| 0–30 days | CURRENT | 1.00 | allowed |
| 31–60 days | AGING | 0.75 | allowed, with capped Confidence |
| >60 days | STALE | 0.50 | blocked pending revalidation |
| missing date/scope | MISSING | 0.50 | blocked pending revalidation |

Revalidation may update the existing Confidence and other existing formula inputs only. It cannot create a separate priority channel. A recently verified null/negative result may lower Confidence even while freshness is CURRENT.

## Hard overrides

Scientific/safety/provenance/security/reliability incidents remain hard gates and may override numeric order when explicitly documented. Their override status is not a score bonus and is not weakened by freshness age.

## Determinism and proof

`scripts/ci/prioritization-contract.mjs` implements the contract. `scripts/ci/validate-prioritization-contract.mjs` replays fixtures covering:

1. a small dependency-unlock task outranking isolated polish through the existing Strategic Leverage input;
2. a stale high-traffic hypothesis becoming non-promotable;
3. a recently verified null result carrying lower Confidence without a second score;
4. a safety incident overriding numeric order.

Identical inputs and evaluation date must produce identical normalized states and queue order, with stable ID ordering as the final tie-break.
