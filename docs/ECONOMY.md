# Economy & Storefront

**Real-money**: Developer Products under `Config/Store.lua` → handled by `Monetization/ProcessReceipt.server.lua` with policy checks and cooldowns via `Monetization/Eligibility.server.lua`.

**Soft currency**: `Systems/Currency.server.lua` with server-authoritative sinks declared in `Config/SoftSinks.lua` and invoked via `Systems/Sinks.server.lua`.

**Lifecycle**

- Client UI calls `StoreRemotes.CheckEligibility(productId)` → on ok, client calls `MarketplaceService:PromptProductPurchase`.
- After success, server grants currency and sets a product-specific cooldown (`SKU.cooldownSec`).
- Sinks spend soft currency via `StoreRemotes.SpendSoft`.

**Retention**

- `FTUAndRetention.server.lua` grants first-time cash and comeback bonuses after N days away (config in `Config/Retention.lua`).

**Wire your UI**

- In your button handler: `require(StarterPlayerScripts.Store.StoreBridge).tryPurchase(1001)`
- For sinks: `Remotes.Store.SpendSoft:InvokeServer("repair")` etc.
