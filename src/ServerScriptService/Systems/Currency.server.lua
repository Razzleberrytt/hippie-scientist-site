-- Minimal server-side currency system with leaderstats and DS persistence.
local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local Telemetry = require(script.Parent.Parent:WaitForChild("Ops"):WaitForChild("Telemetry"))

local Currency = {}
Currency.__index = Currency

local BALANCE_DS = DataStoreService:GetDataStore("CurrencyBalances_v1")
local CURRENCY_NAME = "Cash"

local balances: { [number]: number } = {}

local function setLeaderstats(player: Player, amount: number)
	local ls = player:FindFirstChild("leaderstats") or Instance.new("Folder")
	ls.Name = "leaderstats"
	ls.Parent = player

	local stat = ls:FindFirstChild(CURRENCY_NAME) or Instance.new("IntValue")
	stat.Name = CURRENCY_NAME
	stat.Parent = ls
	stat.Value = amount
end

local function loadBalance(userId: number): number
	local ok, value = pcall(function()
		return BALANCE_DS:GetAsync(tostring(userId))
	end)
	if ok and typeof(value) == "number" then
		return value
	end
	return 0
end

local function saveBalance(userId: number, amount: number)
	pcall(function()
		BALANCE_DS:SetAsync(tostring(userId), amount)
	end)
end

function Currency.get(userId: number): number
	return balances[userId] or 0
end

function Currency.add(userId: number, delta: number): number
	local current = Currency.get(userId)
	local updated = math.max(0, current + math.floor(delta))
	balances[userId] = updated
	local player = game:GetService("Players"):FindFirstChild(tostring(userId))
	if player then
		setLeaderstats(player, updated)
	end
	saveBalance(userId, updated)
	Telemetry.log("currency_add", { userId = userId, delta = delta, new = updated })
	return updated
end

-- Wiring
Players.PlayerAdded:Connect(function(player)
	local amount = loadBalance(player.UserId)
	balances[player.UserId] = amount
	setLeaderstats(player, amount)
end)

Players.PlayerRemoving:Connect(function(player)
	local amount = Currency.get(player.UserId)
	saveBalance(player.UserId, amount)
end)

return Currency
