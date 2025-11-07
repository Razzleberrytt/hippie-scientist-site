local Players = game:GetService("Players")
local MarketplaceService = game:GetService("MarketplaceService")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local HttpService = game:GetService("HttpService")

local Telemetry = require(script.Parent.Parent:WaitForChild("Ops"):WaitForChild("Telemetry"))
local Currency = require(script.Parent.Parent:WaitForChild("Systems"):WaitForChild("Currency"))
local Store = require(ReplicatedStorage:WaitForChild("Config"):WaitForChild("Store"))

local ReceiptsDS = DataStoreService:GetDataStore("PurchaseReceipts_v1")

local function grantProduct(player, productId)
	local def = Store.Products[productId]
	if not def then
		return false, "unknown_product"
	end
	local newBal = Currency.add(player.UserId, def.amount)
	Telemetry.log("purchase_grant", { userId = player.UserId, productId = productId, amount = def.amount, balance = newBal })
	return true, "granted"
end

local function processReceipt(receiptInfo)
	local key = string.format("%d:%s", receiptInfo.PlayerId, receiptInfo.PurchaseId)

	local okGet, alreadyProcessed = pcall(function()
		return ReceiptsDS:GetAsync(key)
	end)
	if not okGet then
		Telemetry.log("receipt_datastore_error", { stage = "get", err = tostring(alreadyProcessed) })
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end
	if alreadyProcessed then
		return Enum.ProductPurchaseDecision.PurchaseGranted
	end

	local player = Players:GetPlayerByUserId(receiptInfo.PlayerId)
	if not player then
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end

	local okGrant, reason = grantProduct(player, receiptInfo.ProductId)
	if not okGrant then
		Telemetry.log("purchase_failed", { userId = receiptInfo.PlayerId, productId = receiptInfo.ProductId, reason = reason })
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end

	pcall(function()
		ReceiptsDS:SetAsync(key, true)
	end)

	Telemetry.log("purchase_success", { userId = receiptInfo.PlayerId, productId = receiptInfo.ProductId })
	return Enum.ProductPurchaseDecision.PurchaseGranted
end

MarketplaceService.ProcessReceipt = processReceipt
Telemetry.log("receipt_handler_ready", {})
