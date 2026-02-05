-- Minimal client bridge for purchase buttons.
local Players = game:GetService("Players")
local MarketplaceService = game:GetService("MarketplaceService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local StarterGui = game:GetService("StarterGui")

local Remotes = require(ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("StoreRemotes"))
local Store = require(ReplicatedStorage:WaitForChild("Config"):WaitForChild("Store"))
local PolicyRemote = require(ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("PolicyRemote"))

local function toast(msg)
	pcall(function() StarterGui:SetCore("SendNotification", { Title = "Store", Text = msg, Duration = 3 }) end)
end

local function canMonetize()
	local ok, flags = pcall(function() return PolicyRemote.GetPolicyFlags:InvokeServer() end)
	return ok and flags and flags.monetizationAllowed == true
end

-- Call this from your UI: require(StoreBridge).tryPurchase(1001)
local StoreBridge = {}

function StoreBridge.tryPurchase(productId)
	if not canMonetize() then toast("Purchases unavailable in your region/account."); return end
	local res = Remotes.CheckEligibility:InvokeServer(productId)
	if not (res and res.ok) then
		if res and res.reason == "cooldown" and res.retryAt then
			local secs = math.max(0, res.retryAt - os.time())
			toast(("Please wait %ds before trying again."):format(secs))
		else
			toast("Not eligible to purchase right now.")
		end
		return
	end
	local lp = Players.LocalPlayer
	MarketplaceService:PromptProductPurchase(lp, productId)
end

return StoreBridge
