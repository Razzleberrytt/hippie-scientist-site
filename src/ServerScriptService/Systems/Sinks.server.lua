-- Soft-currency spending endpoints (server-authoritative).
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local Sinks = require(game:GetService("ReplicatedStorage"):WaitForChild("Config"):WaitForChild("SoftSinks"))
local Currency = require(script.Parent:WaitForChild("Currency"))
local Telemetry = require(script.Parent.Parent:WaitForChild("Ops"):WaitForChild("Telemetry"))
local Remotes = require(ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("StoreRemotes"))

local function spend(userId, sinkId, cost)
	local bal = Currency.get(userId)
	if bal < cost then return false, "insufficient_funds" end
	Currency.add(userId, -cost)
	return true
end

Remotes.SpendSoft.OnServerInvoke = function(player, sinkId)
	local def = Sinks[sinkId]
	if not def then return { ok = false, reason = "unknown_sink" } end
	local ok, reason = spend(player.UserId, sinkId, def.cost)
	if not ok then
		Telemetry.log("sink_failed", { userId = player.UserId, sink = sinkId, reason = reason })
		return { ok = false, reason = reason }
	end

	-- TODO: Apply actual game effect on server:
	-- if sinkId == "repair" then ... end
	-- if sinkId == "boost_speed" then ... end
	-- if sinkId == "cosmetic_color" then ... end

	Telemetry.log("sink_purchase", { userId = player.UserId, sink = sinkId, cost = def.cost })
	return { ok = true, balance = Currency.get(player.UserId) }
end
