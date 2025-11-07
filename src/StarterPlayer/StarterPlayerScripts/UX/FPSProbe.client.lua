-- Monitors FPS; applies low preset if sustained below threshold.
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Mobile = require(ReplicatedStorage:WaitForChild("Config"):WaitForChild("Mobile"))
local Profiles = require(script.Parent:WaitForChild("Profiles"))

local samples = {}
local lastSwitch = 0

local function avgFPS()
	local sum = 0
	for _, v in ipairs(samples) do sum += v end
	return (#samples > 0) and (sum / #samples) or 60
end

RunService.RenderStepped:Connect(function(dt)
	local fps = 1 / math.max(1e-6, dt)
	table.insert(samples, fps)
	-- trim old samples
	local targetCount = math.max(30, math.floor(Mobile.FPS.WindowSeconds * 60))
	while #samples > targetCount do table.remove(samples, 1) end

	if not Mobile.FPS.ApplyLowPreset then return end

	local now = os.clock()
	if now - lastSwitch < Mobile.FPS.CooldownSeconds then return end

	if avgFPS() < Mobile.FPS.MinFPS and Profiles.current ~= "Low" then
		Profiles.applyLow()
		lastSwitch = now
	elseif avgFPS() >= (Mobile.FPS.MinFPS + 5) and Profiles.current ~= "Balanced" then
		Profiles.applyBalanced()
		lastSwitch = now
	end
end)
