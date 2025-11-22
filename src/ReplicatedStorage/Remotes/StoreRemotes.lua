local ReplicatedStorage = game:GetService("ReplicatedStorage")
local folder = ReplicatedStorage:FindFirstChild("StoreRemotes") or Instance.new("Folder", ReplicatedStorage)
folder.Name = "StoreRemotes"

local CheckEligibility = folder:FindFirstChild("CheckEligibility") or Instance.new("RemoteFunction", folder)
CheckEligibility.Name = "CheckEligibility"

local SpendSoft = folder:FindFirstChild("SpendSoft") or Instance.new("RemoteFunction", folder)
SpendSoft.Name = "SpendSoft"

return {
Folder = folder,
CheckEligibility = CheckEligibility,
SpendSoft = SpendSoft,
}
