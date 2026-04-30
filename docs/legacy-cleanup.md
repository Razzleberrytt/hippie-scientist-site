# Legacy Cleanup Log

## 2026-04-30

- ErrorBoundary was **kept** because it is reachable from active infrastructure: `src/components/EntityDatabasePage.tsx` imports and renders `src/components/ErrorBoundary.tsx`.
- `src/utils/devMessages.ts` was created as a tiny compatibility utility to satisfy active infrastructure imports after legacy cleanup removed the old module.
- This change is infrastructure-only (diagnostic logging shim); it adds no herb/compound/product/effect/evidence/reference data and does not restore any deleted data modules.
