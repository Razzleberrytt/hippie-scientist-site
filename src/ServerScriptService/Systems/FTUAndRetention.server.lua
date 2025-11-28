local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")

local Telemetry = require(script.Parent.Parent:WaitForChild("Ops"):WaitForChild("Telemetry"))
local Currency = require(script.Parent:WaitForChild("Currency"))
local Retention = require(game:GetService("ReplicatedStorage"):WaitForChild("Config"):WaitForChild("Retention"))

local META = DataStoreService:GetDataStore("PlayerMeta_v1")

local function loadMeta(userId)
	local ok, data = pcall(function() return META:GetAsync(tostring(userId)) end)
	if ok and typeof(data) == "table" then return data end
	return {}
end

local function saveMeta(userId, tbl)
	pcall(function() META:SetAsync(tostring(userId), tbl) end)
end

Players.PlayerAdded:Connect(function(player)
	local meta = loadMeta(player.UserId)
	local now = os.time()

	if not meta.ftuGranted then
		local amt = Retention.FTU.Cash or 0
		if amt > 0 then
			Currency.add(player.UserId, amt)
			Telemetry.log("ftu_grant", { userId = player.UserId, amount = amt })
		end
		meta.ftuGranted = true
	end

	if meta.lastSeen then
		local days = math.floor((now - meta.lastSeen) / (24 * 3600))
		if days >= (Retention.Comeback.MinDaysAway or 999) then
			local amt = Retention.Comeback.Cash or 0
			if amt > 0 then
				Currency.add(player.UserId, amt)
				Telemetry.log("comeback_grant", { userId = player.UserId, amount = amt, daysAway = days })
			end
		end
	end

	meta.lastSeen = now
	saveMeta(player.UserId, meta)
end)

Players.PlayerRemoving:Connect(function(player)
	local meta = loadMeta(player.UserId)
	meta.lastSeen = os.time()
	saveMeta(player.UserId, meta)
end)
