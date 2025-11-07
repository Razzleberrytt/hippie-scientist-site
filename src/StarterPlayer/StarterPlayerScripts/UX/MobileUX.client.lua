-- Big-tap scaling for common menus; radial/build menu scale-up on mobile.
local UserInputService = game:GetService("UserInputService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Mobile = require(ReplicatedStorage:WaitForChild("Config"):WaitForChild("Mobile"))
local player = Players.LocalPlayer

local function isMobile()
	return UserInputService.TouchEnabled and not UserInputService.KeyboardEnabled
end

local function ensureUIScale(guiObject, factor)
	local scale = guiObject:FindFirstChildOfClass("UIScale")
	if not scale then
		scale = Instance.new("UIScale")
		scale.Parent = guiObject
	end
	scale.Scale = factor
end

local function scaleRadial()
	if not isMobile() then return end
	local pg = player:WaitForChild("PlayerGui", 10)
	if not pg then return end
	for _, name in ipairs(Mobile.UI.RadialCandidates) do
		local gui = pg:FindFirstChild(name, true)
		if gui and gui:IsA("ScreenGui") then
			ensureUIScale(gui, Mobile.RadialScaleMobile)
		end
	end
end

local function enforceMinButtons()
	if not isMobile() then return end
	local pg = player:WaitForChild("PlayerGui", 10)
	if not pg then return end
	for _, gui in ipairs(pg:GetDescendants()) do
		if gui:IsA("TextButton") or gui:IsA("ImageButton") then
			gui.AutoButtonColor = true
			gui.Size = UDim2.fromOffset(
				math.max(gui.AbsoluteSize.X, Mobile.MinButtonSizePx),
				math.max(gui.AbsoluteSize.Y, Mobile.MinButtonSizePx)
			)
		end
	end
end

task.defer(scaleRadial)
task.defer(enforceMinButtons)
