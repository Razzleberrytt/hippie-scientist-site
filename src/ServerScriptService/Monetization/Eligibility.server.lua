-- Server-side purchase eligibility & cooldowns.
local Players = game:GetService("Players")
local MemoryStoreService = game:GetService("MemoryStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Telemetry = require(script.Parent.Parent:WaitForChild("Ops"):WaitForChild("Telemetry"))
local PolicyGuard = require(script.Parent:WaitForChild("Policy"):WaitForChild("PolicyGuard"))
local SKU = require(script.Parent:WaitForChild("SKU"))
local Remotes = require(ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("StoreRemotes"))

local map
pcall(function() map = MemoryStoreService:GetSortedMap("PurchaseCooldowns_v1") end)
local fallback = {} -- userId -> { productId -> untilEpoch }

local function now() return os.time() end

local function getCooldownUntil(userId, productId)
	local key = ("%d:%d"):format(userId, productId)
	if map then
		local ok, value = pcall(function() return map:GetAsync(key) end)
		if ok and typeof(value) == "number" then return value end
	end
	return (fallback[userId] and fallback[userId][productId]) or 0
end

local function setCooldown(userId, productId, seconds)
	if seconds <= 0 then return end
	local untilTs = now() + seconds
	local key = ("%d:%d"):format(userId, productId)
	if map then
		pcall(function() map:SetAsync(key, untilTs, seconds) end)
	end
	fallback[userId] = fallback[userId] or {}
	fallback[userId][productId] = untilTs
end

local function reason(code, extra)
	local r = { ok = false, reason = code }
	for k, v in pairs(extra or {}) do r[k] = v end
	return r
end

local function eligible(player, productId)
	if not SKU.get(productId) then
		return reason("unknown_product")
	end
	if not PolicyGuard.canMonetize(player) then
		return reason("policy_block")
	end
	local untilTs = getCooldownUntil(player.UserId, productId)
	if untilTs > now() then
		return reason("cooldown", { retryAt = untilTs })
	end
	return { ok = true }
end

Remotes.CheckEligibility.OnServerInvoke = function(player, productId)
	local res = eligible(player, tonumber(productId))
	Telemetry.log("purchase_eligibility", { userId = player.UserId, productId = productId, ok = res.ok, reason = res.reason })
	return res
end

-- Exposed for ProcessReceipt to set cooldown post-grant:
local M = {}
function M.applyCooldown(player, productId)
	setCooldown(player.UserId, productId, SKU.cooldownSec(productId))
end
return M
