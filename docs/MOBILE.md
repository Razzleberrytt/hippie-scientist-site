# Mobile & Accessibility

- Big-tap: buttons clamped to at least 56px; radial menus scaled on mobile.
- Low-flash preset: toned bloom, optional DOF off, reduced shake.
- FPS probe: if avg FPS < 50 for 5s → apply Low; back to Balanced once stable.
- Camera guard: clamps FOV to 70 by default.
- Toggle: a "Graphics: Low/Balanced" button is added to the HUD.

Integration tips:

- If you have a custom shake system, read `ReplicatedStorage/UXSignals/ScreenShakeScale` and multiply your amplitude.
- If your radial/shop GUIs use different names, update `Config/Mobile.lua`.
