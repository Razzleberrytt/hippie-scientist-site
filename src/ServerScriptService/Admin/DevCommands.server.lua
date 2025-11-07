-- Example pattern for guarding dev-only commands; replace with your existing command hooks if any.
local Players = game:GetService("Players")
local Admin = require(script.Parent:WaitForChild("Admin"):WaitForChild("Access"))
local Telemetry = require(script.Parent.Parent:WaitForChild("Ops"):WaitForChild("Telemetry"))

local function onChat(player, message)
	if message == "/release" or message == "/shipcheck" then
		if not Admin.isAdmin(player.UserId) then
			Telemetry.log("soft_gate_blocked", { userId = player.UserId, cmd = message })
			return
		end
		-- TODO: call your real release/shipcheck routines here.
		Telemetry.log("dev_cmd", { userId = player.UserId, cmd = message })
	end
end

Players.PlayerChatted:Connect(onChat)
