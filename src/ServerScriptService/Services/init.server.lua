local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Services = script.Parent

require(Services:WaitForChild("DataService"))
require(Services:WaitForChild("CodexService"))

local Net = require(ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("Net"))

-- Preload remotes so clients can bind immediately.
local _ = Net.TutorialEvent
local _request = Net.RequestCodexState

return {}
