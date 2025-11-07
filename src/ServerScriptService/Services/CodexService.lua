local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Telemetry = require(script.Parent.Parent:WaitForChild("Ops"):WaitForChild("Telemetry"))
local DataService = require(script.Parent:WaitForChild("DataService"))
local Net = require(ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("Net"))
local Prompts = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Codex"):WaitForChild("Prompts"))

local CodexService = {}

local worldState = {
        day = 1,
        pressure = 0,
        camp = {
                beaconFuel = 0,
                structures = {},
        },
        campPosition = Vector3.new(),
}

local function mergeTables(target, updates)
        if typeof(target) ~= "table" or typeof(updates) ~= "table" then
                return
        end
        for key, value in pairs(updates) do
                if typeof(value) == "table" and typeof(target[key]) == "table" then
                        mergeTables(target[key], value)
                else
                        target[key] = value
                end
        end
end

local playerSessions: { [Player]: { seen: { [string]: boolean }, active: { [string]: any } } } = {}
local cooldowns: { [string]: number } = {}

local function ensureSession(player: Player)
        local session = playerSessions[player]
        if not session then
                session = { seen = {}, active = {} }
                playerSessions[player] = session
        end
        return session
end

local GateHandlers = {}

function GateHandlers.DayAtLeast(ctx, gate)
        local threshold = gate.value or gate.threshold or gate
        return (ctx.world.day or 0) >= (threshold or 0)
end

function GateHandlers.StructureCountBelow(ctx, gate)
        local structType = gate.struct
        local value = gate.value or 0
        local current = 0
        if structType and ctx.world.camp and ctx.world.camp.structures then
                current = ctx.world.camp.structures[structType] or 0
        end
        return current < value
end

function GateHandlers.NearBeacon(ctx, gate)
        local player = ctx.player
        if not player.Character or not player.Character.PrimaryPart then
                return false
        end
        local meters = gate.meters or gate.radius or 30
        local pos = ctx.world.campPosition or Vector3.new()
        return (player.Character.PrimaryPart.Position - pos).Magnitude <= meters
end

function GateHandlers.OncePerSession(ctx)
        local session = ensureSession(ctx.player)
        return session.seen[ctx.prompt.id] ~= true
end

function GateHandlers.BeaconFuelBelow(ctx, gate)
        local threshold = gate.value or gate.threshold or 0
        local fuel = 0
        if ctx.world.camp then
                fuel = ctx.world.camp.beaconFuel or 0
        end
        return fuel < threshold
end

function GateHandlers.CurrencyAtLeast(ctx, gate)
        local value = gate.value or 0
        local profile = ctx.profile
        if not profile then
                return false
        end
        local amount = 0
        if profile.currencies and profile.currencies.shards then
                amount = profile.currencies.shards
        end
        return amount >= value
end

function GateHandlers.ProfileHasSetting(ctx, gate)
        local expected = gate.expected
        local category = gate.category
        local key = gate.key
        if not category or not key then
                return false
        end
        local current = DataService.GetSetting(ctx.player, category, key)
        if gate.invert then
                return current ~= expected
        end
        return current == expected
end

local function passesGates(ctx)
        local prompt = ctx.prompt
        for _, gate in ipairs(prompt.gates or {}) do
                local handler = GateHandlers[gate.type]
                if handler then
                        if not handler(ctx, gate) then
                                return false
                        end
                else
                        return false
                end
        end
        return true
end

local function isOnCooldown(player: Player, promptId: string)
        local key = string.format("%d:%s", player.UserId, promptId)
        local expires = cooldowns[key]
        if expires and expires > time() then
                return true
        end
        return false
end

local function startCooldown(player: Player, promptId: string, duration: number)
        local key = string.format("%d:%s", player.UserId, promptId)
        cooldowns[key] = time() + duration
end

local function recordSeen(player: Player, promptId: string)
        local session = ensureSession(player)
        session.seen[promptId] = true
        Telemetry.log("codex_shown", {
                userId = player.UserId,
                prompt = promptId,
                day = worldState.day,
                pressure = worldState.pressure,
        })
        DataService.MarkCodexSeen(player, promptId)
end

local function sendPrompt(player: Player, prompt, trigger: string, payload)
        local session = ensureSession(player)
        session.active[prompt.id] = {
                prompt = prompt,
                trigger = trigger,
                payload = payload,
        }
        startCooldown(player, prompt.id, prompt.cooldownSec or 30)
        recordSeen(player, prompt.id)
        Net.TutorialEvent:FireClient(player, {
                t = "SHOW_CODEX",
                prompt = {
                        id = prompt.id,
                        title = prompt.title,
                        body = prompt.body,
                        icon = prompt.icon,
                        category = prompt.category,
                        priority = prompt.priority,
                        actions = prompt.actions,
                },
                trigger = trigger,
                payload = payload,
        })
end

local function canShowPrompt(player: Player, prompt, trigger)
        if not prompt.id then
                return false
        end
        if prompt.oncePerProfile and DataService.HasSeenPrompt(player, prompt.id) then
                return false
        end
        local session = ensureSession(player)
        if session.active[prompt.id] then
                return false
        end
        if isOnCooldown(player, prompt.id) then
                return false
        end
        local ctx = {
                player = player,
                prompt = prompt,
                world = worldState,
                profile = DataService.GetProfileSnapshot(player),
        }
        if not passesGates(ctx) then
                return false
        end
        return true
end

function CodexService.Emit(trigger: string, payload, recipients)
        payload = payload or {}
        local targetPlayers
        if typeof(recipients) == "Instance" then
                targetPlayers = { recipients }
        elseif typeof(recipients) == "table" then
                targetPlayers = {}
                for _, candidate in ipairs(recipients) do
                        if typeof(candidate) == "Instance" and candidate:IsA("Player") then
                                table.insert(targetPlayers, candidate)
                        end
                end
        end
        if not targetPlayers or #targetPlayers == 0 then
                targetPlayers = Players:GetPlayers()
        end

        for _, player in ipairs(targetPlayers) do
                for _, prompt in ipairs(Prompts) do
                        local triggers = prompt.triggers or {}
                        if table.find(triggers, trigger) then
                                if canShowPrompt(player, prompt, trigger) then
                                        sendPrompt(player, prompt, trigger, payload)
                                end
                        end
                end
        end
end

function CodexService.SetWorldState(nextState)
        if typeof(nextState) ~= "table" then
                return
        end
        mergeTables(worldState, nextState)
end

local function hidePrompt(player: Player, promptId: string)
        local session = ensureSession(player)
        session.active[promptId] = nil
        Net.TutorialEvent:FireClient(player, {
                t = "HIDE_CODEX",
                id = promptId,
        })
end

local function replayPrompts(player: Player)
        local session = ensureSession(player)
        for _, entry in pairs(session.active) do
                local prompt = entry.prompt
                Net.TutorialEvent:FireClient(player, {
                        t = "SHOW_CODEX",
                        prompt = {
                                id = prompt.id,
                                title = prompt.title,
                                body = prompt.body,
                                icon = prompt.icon,
                                category = prompt.category,
                                priority = prompt.priority,
                                actions = prompt.actions,
                        },
                        trigger = entry.trigger,
                        payload = entry.payload,
                })
        end
end

Net.TutorialEvent.OnServerEvent:Connect(function(player, message)
        if typeof(message) ~= "table" then
                return
        end
        if message.t == "CODEX_ACTION" then
                local promptId = message.id
                Telemetry.log("codex_clicked", {
                        userId = player.UserId,
                        prompt = promptId,
                        action = message.action,
                })
                if message.action == "COMPLETE" and promptId then
                        DataService.MarkCodexCompleted(player, promptId)
                        hidePrompt(player, promptId)
                end
        elseif message.t == "CODEX_ACK" then
                if message.id then
                        hidePrompt(player, message.id)
                        Telemetry.log("codex_ack", {
                                userId = player.UserId,
                                prompt = message.id,
                        })
                end
        elseif message.t == "REQUEST_REPLAY" then
                replayPrompts(player)
        end
end)

Net.RequestCodexState.OnServerInvoke = function(player)
        local profile = DataService.GetProfileSnapshot(player)
        local session = ensureSession(player)
        local active = {}
        for promptId, entry in pairs(session.active) do
                table.insert(active, {
                        id = promptId,
                        trigger = entry.trigger,
                })
        end
        return {
                profile = profile,
                active = active,
        }
end

Players.PlayerAdded:Connect(function(player)
        ensureSession(player)
        if RunService:IsStudio() then
                CodexService.Emit("SESSION_JOIN", { userId = player.UserId }, player)
        else
                task.defer(function()
                        CodexService.Emit("SESSION_JOIN", { userId = player.UserId }, player)
                end)
        end
end)

Players.PlayerRemoving:Connect(function(player)
        DataService.Flush(player.UserId)
        playerSessions[player] = nil
end)

return CodexService
