local Mobile = {
	-- UI / Controls
	MinButtonSizePx = 56,          -- minimum touch target
	RadialScaleMobile = 1.25,      -- scale-up for radial/build menus
	ThumbstickDeadzone = 0.25,     -- logical deadzone (client filter)
	-- Graphics
	FOVClamp = 70,                 -- max allowed camera FOV
	LowFlash = {
		Enable = true,
		MaxBloomIntensity = 0.3,
		MaxBloomThreshold = 1.5,
		DisableDepthOfField = true,
		ScreenShakeScale = 0.5,    -- multiply any shake amplitude by this
	},
	-- FPS probe
	FPS = {
		WindowSeconds = 5,         -- moving window for avg FPS
		MinFPS = 50,               -- if average drops below this ...
		ApplyLowPreset = true,     -- ... apply low preset
		CooldownSeconds = 20,      -- then wait this long before trying to revert
	},
	-- Names you can customize to match your UI:
	UI = {
		RadialCandidates = { "BuildMenu", "RadialMenu", "WheelMenu" },
		ShopGui = "ShopGui",
	},
}
return Mobile
