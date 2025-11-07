-- Admin gating utilities.
local RunService = game:GetService("RunService")

local Admin = {}

-- EDIT this list to add trusted user IDs.
local WHITELIST = {
	-- 12345678, -- example
}

function Admin.isStudio()
	return RunService:IsStudio()
end

function Admin.isWhitelisted(userId: number): boolean
	for _, id in ipairs(WHITELIST) do
		if id == userId then
			return true
		end
	end
	return false
end

function Admin.isAdmin(userId: number): boolean
	return Admin.isStudio() or Admin.isWhitelisted(userId)
end

return Admin
