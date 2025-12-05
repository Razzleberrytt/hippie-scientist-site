local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Store = require(ReplicatedStorage:WaitForChild("Config"):WaitForChild("Store"))

local SKU = {}
SKU.Products = Store.Products or {}
SKU.GamePasses = Store.GamePasses or {}

-- Optional per-product cooldowns (seconds). Add here if desired.
local Cooldown = {
	-- [1001] = 10,  -- CashSmall: 10s
	-- [1002] = 10,
	-- [1003] = 10,
}

function SKU.get(productId)
	return SKU.Products[productId]
end

function SKU.cooldownSec(productId)
	return Cooldown[productId] or 0
end

return SKU
