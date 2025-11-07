local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")

local Telemetry = require(script.Parent.Parent:WaitForChild("Ops"):WaitForChild("Telemetry"))

local PROFILE_KEY_PREFIX = "Survive99_Profile_v1:"
local SCHEMA_VERSION = 1

local ProfileStore = DataStoreService:GetDataStore("Survive99_Profile_v1")

local DEFAULT_PROFILE = {
        _schema = SCHEMA_VERSION,
        bestNight = 0,
        totalRescues = 0,
        currencies = { shards = 0 },
        talents = {},
        cosmetics = { outfits = {}, emotes = {}, campThemes = {} },
        beaconModsOwned = {},
        settings = {
                accessibility = { captions = true, reduceFlashes = true },
                input = { stickLayout = "default" },
        },
        codex = {
                seen = {},
                completed = {},
        },
}

local profiles: { [number]: any } = {}
local dirtyProfiles: { [number]: boolean } = {}

local function deepCopy(tbl)
        local copy = {}
        for k, v in pairs(tbl) do
                if typeof(v) == "table" then
                        copy[k] = deepCopy(v)
                else
                        copy[k] = v
                end
        end
        return copy
end

local function mergeDefaults(defaults, source)
        local merged = {}
        local incoming = typeof(source) == "table" and source or nil

        for key, value in pairs(defaults) do
                if typeof(value) == "table" then
                        merged[key] = mergeDefaults(value, incoming and incoming[key])
                else
                        if incoming and incoming[key] ~= nil then
                                merged[key] = incoming[key]
                        else
                                merged[key] = value
                        end
                end
        end

        if incoming then
                for key, value in pairs(incoming) do
                        if merged[key] == nil then
                                merged[key] = typeof(value) == "table" and deepCopy(value) or value
                        end
                end
        end

        return merged
end

local function hydrateProfile(raw)
        local profile = mergeDefaults(DEFAULT_PROFILE, raw)
        profile._schema = SCHEMA_VERSION
        profile.codex = profile.codex or { seen = {}, completed = {} }
        profile.codex.seen = profile.codex.seen or {}
        profile.codex.completed = profile.codex.completed or {}
        return profile
end

local function saveProfile(userId: number)
        local profile = profiles[userId]
        if not profile then
                return
        end
        local key = PROFILE_KEY_PREFIX .. tostring(userId)
        local ok, err = pcall(function()
                ProfileStore:SetAsync(key, profile)
        end)
        if not ok then
                warn("[DataService] Failed to save profile for", userId, err)
                return
        end
        dirtyProfiles[userId] = false
        Telemetry.log("profile_save", { userId = userId })
end

local DataService = {}

function DataService.GetProfile(userId: number)
        return profiles[userId]
end

function DataService.GetProfileSnapshot(player: Player)
        local profile = profiles[player.UserId]
        if not profile then
                return nil
        end
        return deepCopy(profile)
end

function DataService.MutateProfile(player: Player, fn)
        local userId = player.UserId
        local profile = profiles[userId]
        if not profile then
                profile = hydrateProfile(nil)
                profiles[userId] = profile
        end
        fn(profile)
        dirtyProfiles[userId] = true
end

function DataService.MarkCodexSeen(player: Player, promptId: string)
        DataService.MutateProfile(player, function(profile)
                profile.codex.seen[promptId] = true
        end)
end

function DataService.MarkCodexCompleted(player: Player, promptId: string)
        DataService.MutateProfile(player, function(profile)
                profile.codex.completed[promptId] = true
        end)
end

function DataService.HasSeenPrompt(player: Player, promptId: string): boolean
        local profile = profiles[player.UserId]
        if not profile then
                return false
        end
        return profile.codex.seen[promptId] == true
end

function DataService.GetSetting(player: Player, category: string, key: string)
        local profile = profiles[player.UserId]
        if not profile then
                return nil
        end
        local cat = profile.settings[category]
        if not cat then
                return nil
        end
        return cat[key]
end

local function loadProfileFor(player: Player)
        local userId = player.UserId
        local key = PROFILE_KEY_PREFIX .. tostring(userId)
        local raw
        local ok, err = pcall(function()
                raw = ProfileStore:GetAsync(key)
        end)
        if not ok then
                warn("[DataService] Failed to load profile", userId, err)
        end
        profiles[userId] = hydrateProfile(raw)
        dirtyProfiles[userId] = false
        Telemetry.log("profile_load", { userId = userId })
end

Players.PlayerAdded:Connect(function(player)
        loadProfileFor(player)
end)

Players.PlayerRemoving:Connect(function(player)
        if dirtyProfiles[player.UserId] then
                saveProfile(player.UserId)
        end
        profiles[player.UserId] = nil
        dirtyProfiles[player.UserId] = nil
end)

function DataService.Flush(userId: number)
        if dirtyProfiles[userId] then
                saveProfile(userId)
        end
end

return DataService
