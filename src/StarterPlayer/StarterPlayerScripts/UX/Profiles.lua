-- Applies Balanced/Low presets (client-side).
local Lighting = game:GetService("Lighting")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local MobileCfg = require(ReplicatedStorage:WaitForChild("Config"):WaitForChild("Mobile"))

local Profiles = {}
Profiles.current = "Balanced"

local function getOrCreateBloom()
	local b = Lighting:FindFirstChildOfClass("BloomEffect")
	if not b then
		b = Instance.new("BloomEffect")
		b.Parent = Lighting
	end
	return b
end

local function getDOF()
	return Lighting:FindFirstChildOfClass("DepthOfFieldEffect")
end

function Profiles.applyBalanced()
	Profiles.current = "Balanced"
	local b = getOrCreateBloom()
	b.Enabled = true
	b.Intensity = 0.7
	b.Threshold = 1.8
	local dof = getDOF()
	if dof then dof.Enabled = true end
	game:GetService("StarterGui"):SetCore("SendNotification", { Title = "Graphics", Text = "Balanced preset", Duration = 2 })
end

function Profiles.applyLow()
	Profiles.current = "Low"
	local b = getOrCreateBloom()
	b.Enabled = MobileCfg.LowFlash.Enable
	b.Intensity = MobileCfg.LowFlash.MaxBloomIntensity
	b.Threshold = MobileCfg.LowFlash.MaxBloomThreshold
	local dof = getDOF()
	if dof then dof.Enabled = not MobileCfg.LowFlash.DisableDepthOfField end
	game:GetService("StarterGui"):SetCore("SendNotification", { Title = "Graphics", Text = "Low-flash preset", Duration = 2 })
end

return Profiles
