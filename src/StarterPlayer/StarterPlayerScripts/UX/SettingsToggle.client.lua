-- Tiny in-game button to toggle Balanced/Low graphics.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Profiles = require(script.Parent:WaitForChild("Profiles"))

local player = Players.LocalPlayer
local pg = player:WaitForChild("PlayerGui")

local gui = Instance.new("ScreenGui")
gui.Name = "SettingsToggleGui"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = true
gui.Parent = pg

local button = Instance.new("TextButton")
button.Name = "GraphicsToggle"
button.AnchorPoint = Vector2.new(1, 1)
button.Position = UDim2.new(1, -12, 1, -12)
button.Size = UDim2.fromOffset(120, 40)
button.Text = "Graphics: Low"
button.Parent = gui

local function refresh()
	button.Text = "Graphics: " .. Profiles.current
end

button.Activated:Connect(function()
	if Profiles.current == "Low" then
		Profiles.applyBalanced()
	else
		Profiles.applyLow()
	end
	refresh()
end)

Profiles.applyLow()
refresh()
