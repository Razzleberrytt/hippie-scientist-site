local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local function safeRequire(path)
	local ok, mod = pcall(function() return require(path) end)
	return ok and mod or nil
end

local Telemetry = safeRequire(script.Parent.Parent:WaitForChild("Ops"):WaitForChild("Telemetry")) or { log = function() end }
local Currency = safeRequire(script.Parent.Parent:WaitForChild("Systems"):WaitForChild("Currency"))
local PolicyGuard = safeRequire(script.Parent:WaitForChild("Policy"):WaitForChild("PolicyGuard"))
local SKU = require(script.Parent:WaitForChild("SKU"))
local Eligibility = require(script.Parent:WaitForChild("Eligibility"))
local ReceiptsDS = DataStoreService:GetDataStore("PurchaseReceipts_v1")

local function grantProduct(player, productId)
	local def = SKU.get(productId)
	if not def then
		Telemetry.log("purchase_unknown_product", { userId = player.UserId, productId = productId })
		return false, "unknown_product"
	end
	if Currency then
		local newBal = Currency.add(player.UserId, def.amount)
		Telemetry.log("purchase_grant", { userId = player.UserId, productId = productId, amount = def.amount, balance = newBal })
	else
		Telemetry.log("purchase_grant_nocurrency", { userId = player.UserId, productId = productId, amount = def.amount })
	end
	return true, "granted"
end

local function processReceipt(receiptInfo)
	local player = Players:GetPlayerByUserId(receiptInfo.PlayerId)
	if not player then
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end

	-- Re-check policy on server for safety
	if PolicyGuard and not PolicyGuard.canMonetize(player) then
		Telemetry.log("purchase_blocked_policy", { userId = receiptInfo.PlayerId, productId = receiptInfo.ProductId })
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end

	-- Idempotency
	local key = string.format("%d:%s", receiptInfo.PlayerId, receiptInfo.PurchaseId)
	local okGet, already = pcall(function() return ReceiptsDS:GetAsync(key) end)
	if not okGet then
		Telemetry.log("receipt_datastore_error", { stage = "get" })
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end
	if already then
		return Enum.ProductPurchaseDecision.PurchaseGranted
	end

	-- Grant
	local okGrant, reason = grantProduct(player, receiptInfo.ProductId)
	if not okGrant then
		Telemetry.log("purchase_failed", { userId = receiptInfo.PlayerId, productId = receiptInfo.ProductId, reason = reason })
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end

	-- Mark processed and set cooldown
	pcall(function() ReceiptsDS:SetAsync(key, true) end)
	pcall(function() Eligibility.applyCooldown(player, receiptInfo.ProductId) end)

	Telemetry.log("purchase_success", { userId = receiptInfo.PlayerId, productId = receiptInfo.ProductId })
	return Enum.ProductPurchaseDecision.PurchaseGranted
end

game:GetService("MarketplaceService").ProcessReceipt = processReceipt
Telemetry.log("receipt_handler_ready", { phase6 = true })
