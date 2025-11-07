-- Centralized telemetry; replace prints with your sink later.
local HttpService = game:GetService("HttpService")

local Telemetry = {}

function Telemetry.log(eventName: string, fields: any?)
	local payload = {
		event = eventName,
		ts = os.time(),
		fields = fields or {},
	}
	print(("[telemetry] %s"):format(HttpService:JSONEncode(payload)))
end

return Telemetry
