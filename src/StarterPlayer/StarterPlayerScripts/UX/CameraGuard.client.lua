-- Clamp FOV and optionally scale screen-shake (if your code listens for it).
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Mobile = require(ReplicatedStorage:WaitForChild("Config"):WaitForChild("Mobile"))

local camera = workspace.CurrentCamera
workspace:GetPropertyChangedSignal("CurrentCamera"):Connect(function()
	camera = workspace.CurrentCamera
end)

RunService.RenderStepped:Connect(function()
	if camera then
		if camera.FieldOfView > Mobile.FOVClamp then
			camera.FieldOfView = Mobile.FOVClamp
		end
	end
end)

-- Optional: fire a Bindable for your shake system to read a scale factor from:
local Replicated = game:GetService("ReplicatedStorage")
local folder = Replicated:FindFirstChild("UXSignals") or Instance.new("Folder", Replicated)
folder.Name = "UXSignals"
local shakeScale = folder:FindFirstChild("ScreenShakeScale") or Instance.new("NumberValue", folder)
shakeScale.Name = "ScreenShakeScale"
shakeScale.Value = Mobile.LowFlash.ScreenShakeScale
