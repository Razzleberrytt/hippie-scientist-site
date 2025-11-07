local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Net = require(ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("Net"))
local Localization = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Localization"):WaitForChild("en"))

local localPlayer = Players.LocalPlayer
local playerGui = localPlayer:WaitForChild("PlayerGui")

local screenGui = Instance.new("ScreenGui")
screenGui.Name = "CodexUI"
screenGui.IgnoreGuiInset = true
screenGui.ResetOnSpawn = false
screenGui.Parent = playerGui

local panel = Instance.new("Frame")
panel.Name = "Panel"
panel.BackgroundColor3 = Color3.fromRGB(14, 14, 24)
panel.BackgroundTransparency = 0.1
panel.BorderSizePixel = 0
panel.Size = UDim2.new(0, 320, 0, 380)
panel.Position = UDim2.new(1, -340, 0, 80)
panel.Parent = screenGui

local panelCorner = Instance.new("UICorner")
panelCorner.CornerRadius = UDim.new(0, 12)
panelCorner.Parent = panel

local panelTitle = Instance.new("TextLabel")
panelTitle.Name = "Title"
panelTitle.BackgroundTransparency = 1
panelTitle.Font = Enum.Font.GothamBold
panelTitle.Text = "Codex"
panelTitle.TextColor3 = Color3.fromRGB(240, 240, 255)
panelTitle.TextSize = 22
panelTitle.TextXAlignment = Enum.TextXAlignment.Left
panelTitle.Size = UDim2.new(1, -20, 0, 28)
panelTitle.Position = UDim2.new(0, 10, 0, 12)
panelTitle.Parent = panel

local scrolling = Instance.new("ScrollingFrame")
scrolling.Name = "List"
scrolling.Active = true
scrolling.BackgroundTransparency = 1
scrolling.Size = UDim2.new(1, -20, 1, -70)
scrolling.Position = UDim2.new(0, 10, 0, 50)
scrolling.ScrollBarThickness = 6
scrolling.CanvasSize = UDim2.new(0, 0, 0, 0)
scrolling.Parent = panel

local listLayout = Instance.new("UIListLayout")
listLayout.Padding = UDim.new(0, 12)
listLayout.SortOrder = Enum.SortOrder.LayoutOrder
listLayout.Parent = scrolling

local toastFrame = Instance.new("Frame")
toastFrame.Name = "Toast"
toastFrame.AnchorPoint = Vector2.new(0.5, 0)
toastFrame.BackgroundColor3 = Color3.fromRGB(24, 24, 38)
toastFrame.BackgroundTransparency = 0.2
toastFrame.BorderSizePixel = 0
toastFrame.Position = UDim2.new(0.5, 0, 0, 20)
toastFrame.Size = UDim2.new(0, 360, 0, 80)
toastFrame.Visible = false
toastFrame.Parent = screenGui

local toastCorner = Instance.new("UICorner")
toastCorner.CornerRadius = UDim.new(0, 12)
toastCorner.Parent = toastFrame

local toastTitle = Instance.new("TextLabel")
toastTitle.BackgroundTransparency = 1
toastTitle.Font = Enum.Font.GothamBold
toastTitle.TextColor3 = Color3.fromRGB(255, 255, 255)
toastTitle.TextSize = 20
toastTitle.TextXAlignment = Enum.TextXAlignment.Left
toastTitle.TextYAlignment = Enum.TextYAlignment.Top
toastTitle.Position = UDim2.new(0, 14, 0, 12)
toastTitle.Size = UDim2.new(1, -28, 0, 24)
toastTitle.Parent = toastFrame

local toastBody = Instance.new("TextLabel")
toastBody.BackgroundTransparency = 1
toastBody.Font = Enum.Font.Gotham
toastBody.TextColor3 = Color3.fromRGB(220, 220, 235)
toastBody.TextSize = 16
toastBody.TextWrapped = true
toastBody.TextXAlignment = Enum.TextXAlignment.Left
toastBody.TextYAlignment = Enum.TextYAlignment.Top
toastBody.Position = UDim2.new(0, 14, 0, 36)
toastBody.Size = UDim2.new(1, -28, 1, -48)
toastBody.Parent = toastFrame

local activePromptEntries: { [string]: Frame } = {}
local toastTween

local function localize(key: string)
        return Localization[key] or key
end

local function resizeCanvas()
        local total = 0
        for _, item in pairs(scrolling:GetChildren()) do
                if item:IsA("Frame") then
                        total += item.AbsoluteSize.Y + listLayout.Padding.Offset
                end
        end
        scrolling.CanvasSize = UDim2.new(0, 0, 0, math.max(total, scrolling.AbsoluteSize.Y))
end

local function buildActionButton(prompt, action)
        local button = Instance.new("TextButton")
        button.Name = action.label or "Action"
        button.BackgroundColor3 = Color3.fromRGB(60, 60, 90)
        button.BackgroundTransparency = 0.15
        button.Text = action.label or "Action"
        button.TextSize = 16
        button.Font = Enum.Font.GothamBold
        button.TextColor3 = Color3.fromRGB(255, 255, 255)
        button.AutoButtonColor = true
        button.Size = UDim2.new(0, 120, 0, 28)

        local corner = Instance.new("UICorner")
        corner.CornerRadius = UDim.new(0, 8)
        corner.Parent = button

        button.MouseButton1Click:Connect(function()
                Net.TutorialEvent:FireServer({
                        t = "CODEX_ACTION",
                        id = prompt.id,
                        action = action.event,
                        payload = action.payload,
                })
        end)

        return button
end

local function mountPrompt(prompt)
        local entry = activePromptEntries[prompt.id]
        if not entry then
                entry = Instance.new("Frame")
                entry.Name = prompt.id
                entry.BackgroundColor3 = Color3.fromRGB(32, 32, 48)
                entry.BackgroundTransparency = 0.05
                entry.BorderSizePixel = 0
                entry.Size = UDim2.new(1, 0, 0, 120)
                entry.Parent = scrolling

                local corner = Instance.new("UICorner")
                corner.CornerRadius = UDim.new(0, 10)
                corner.Parent = entry

                local padding = Instance.new("UIPadding")
                padding.PaddingTop = UDim.new(0, 12)
                padding.PaddingBottom = UDim.new(0, 12)
                padding.PaddingLeft = UDim.new(0, 12)
                padding.PaddingRight = UDim.new(0, 12)
                padding.Parent = entry

                local title = Instance.new("TextLabel")
                title.Name = "Title"
                title.BackgroundTransparency = 1
                title.Font = Enum.Font.GothamBold
                title.TextColor3 = Color3.fromRGB(250, 250, 255)
                title.TextSize = 18
                title.TextXAlignment = Enum.TextXAlignment.Left
                title.Text = prompt.title or prompt.id
                title.Size = UDim2.new(1, -36, 0, 24)
                title.Position = UDim2.new(0, 0, 0, 0)
                title.Parent = entry

                local close = Instance.new("TextButton")
                close.Name = "Close"
                close.Text = "✕"
                close.Font = Enum.Font.GothamBold
                close.TextSize = 16
                close.TextColor3 = Color3.fromRGB(220, 220, 235)
                close.BackgroundTransparency = 1
                close.Size = UDim2.new(0, 24, 0, 24)
                close.Position = UDim2.new(1, -24, 0, 0)
                close.Parent = entry

                close.MouseButton1Click:Connect(function()
                        Net.TutorialEvent:FireServer({ t = "CODEX_ACK", id = prompt.id })
                end)

                local body = Instance.new("TextLabel")
                body.Name = "Body"
                body.BackgroundTransparency = 1
                body.Font = Enum.Font.Gotham
                body.TextColor3 = Color3.fromRGB(215, 215, 240)
                body.TextSize = 16
                body.TextWrapped = true
                body.TextXAlignment = Enum.TextXAlignment.Left
                body.TextYAlignment = Enum.TextYAlignment.Top
                body.Position = UDim2.new(0, 0, 0, 28)
                body.Size = UDim2.new(1, 0, 0, 48)
                body.Parent = entry

                local actionHolder = Instance.new("Frame")
                actionHolder.Name = "Actions"
                actionHolder.BackgroundTransparency = 1
                actionHolder.Position = UDim2.new(0, 0, 0, 80)
                actionHolder.Size = UDim2.new(1, 0, 0, 32)
                actionHolder.Parent = entry

                local actionLayout = Instance.new("UIListLayout")
                actionLayout.FillDirection = Enum.FillDirection.Horizontal
                actionLayout.Padding = UDim.new(0, 8)
                actionLayout.SortOrder = Enum.SortOrder.LayoutOrder
                actionLayout.Parent = actionHolder

                activePromptEntries[prompt.id] = entry
        end

        local titleLabel = entry:FindFirstChild("Title") :: TextLabel
        local bodyLabel = entry:FindFirstChild("Body") :: TextLabel
        local actionHolder = entry:FindFirstChild("Actions") :: Frame

        if titleLabel then
                titleLabel.Text = prompt.title or prompt.id
        end
        if bodyLabel then
                bodyLabel.Text = localize(prompt.body or "")
        end

        for _, child in ipairs(actionHolder:GetChildren()) do
                if child:IsA("TextButton") then
                        child:Destroy()
                end
        end

        if prompt.actions then
                for _, action in ipairs(prompt.actions) do
                        actionHolder.Size = UDim2.new(1, 0, 0, 32)
                        local button = buildActionButton(prompt, action)
                        button.Parent = actionHolder
                end
        end

        entry.LayoutOrder = prompt.priority or 0
        resizeCanvas()
end

local function unmountPrompt(promptId: string)
        local entry = activePromptEntries[promptId]
        if not entry then
                return
        end
        activePromptEntries[promptId] = nil
        entry:Destroy()
        resizeCanvas()
end

local function showToast(prompt)
        if toastTween then
                toastTween:Cancel()
        end
        toastTitle.Text = prompt.title or prompt.id
        toastBody.Text = localize(prompt.body or "")
        toastFrame.Visible = true
        toastFrame.BackgroundTransparency = 0.2
        toastTween = TweenService:Create(toastFrame, TweenInfo.new(0.25), { BackgroundTransparency = 0.05 })
        toastTween:Play()
        task.delay(5, function()
                if toastFrame.Visible then
                        local fade = TweenService:Create(toastFrame, TweenInfo.new(0.3), { BackgroundTransparency = 1 })
                        fade.Completed:Connect(function()
                                toastFrame.Visible = false
                        end)
                        fade:Play()
                end
        end)
end

local function handleShow(message)
        local prompt = message.prompt
        if not prompt or not prompt.id then
                return
        end
        mountPrompt(prompt)
        showToast(prompt)
end

local function handleHide(message)
        local promptId = message.id
        if not promptId then
                return
        end
        unmountPrompt(promptId)
end

Net.TutorialEvent.OnClientEvent:Connect(function(message)
        if typeof(message) ~= "table" then
                return
        end
        if message.t == "SHOW_CODEX" then
                handleShow(message)
        elseif message.t == "HIDE_CODEX" then
                handleHide(message)
        end
end)

local success, state = pcall(function()
        return Net.RequestCodexState:InvokeServer()
end)

if success and state then
        if state.active then
                for _, active in ipairs(state.active) do
                        if active.id then
                                Net.TutorialEvent:FireServer({ t = "REQUEST_REPLAY" })
                                break
                        end
                end
        end
end
