local ReplicatedStorage = game:GetService("ReplicatedStorage")

local function ensureFolder()
        local folder = ReplicatedStorage:FindFirstChild("NetRemotes")
        if folder and folder:IsA("Folder") then
                return folder
        end
        folder = Instance.new("Folder")
        folder.Name = "NetRemotes"
        folder.Parent = ReplicatedStorage
        return folder
end

local remotesFolder = ensureFolder()

local function getOrCreateRemote(name: string, className: string)
        local existing = remotesFolder:FindFirstChild(name)
        if existing then
                if existing.ClassName ~= className then
                        error(("Remote '%s' expected class %s but found %s"):format(name, className, existing.ClassName))
                end
                return existing
        end
        local remote = Instance.new(className)
        remote.Name = name
        remote.Parent = remotesFolder
        return remote
end

local Net = {}

Net.TutorialEvent = getOrCreateRemote("TutorialEvent", "RemoteEvent")
Net.RequestCodexState = getOrCreateRemote("RequestCodexState", "RemoteFunction")

return Net
