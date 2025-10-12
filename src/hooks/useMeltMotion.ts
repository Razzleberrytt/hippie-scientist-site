import { useEffect } from "react";

function isDeviceOrientationEvent(
  event: MouseEvent | DeviceOrientationEvent,
): event is DeviceOrientationEvent {
  return "gamma" in event || "beta" in event;
}

export default function useMeltMotion() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const resetMotionVars = () => {
      root.style.setProperty("--melt-tilt-x", "0deg");
      root.style.setProperty("--melt-tilt-y", "0deg");
      root.style.setProperty("--melt-shift-x", "0px");
      root.style.setProperty("--melt-shift-y", "0px");
    };

    const prefersReducedMotion =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    if (prefersReducedMotion?.matches) {
      resetMotionVars();
      return;
    }

    let lastDeviceTick = 0;

    const handleMove = (event: MouseEvent | DeviceOrientationEvent) => {
      let x = 0;
      let y = 0;

      if (isDeviceOrientationEvent(event)) {
        const now = performance.now();
        if (now - lastDeviceTick < 30) return;
        lastDeviceTick = now;
        x = (event.gamma ?? 0) / 45;
        y = (event.beta ?? 0) / 45;
      } else {
        x = event.clientX / window.innerWidth - 0.5;
        y = event.clientY / window.innerHeight - 0.5;
      }

      root.style.setProperty("--melt-tilt-x", `${(x * 10).toFixed(2)}deg`);
      root.style.setProperty("--melt-tilt-y", `${(y * 10).toFixed(2)}deg`);
      root.style.setProperty("--melt-shift-x", `${(x * 12).toFixed(2)}px`);
      root.style.setProperty("--melt-shift-y", `${(y * 12).toFixed(2)}px`);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("deviceorientation", handleMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("deviceorientation", handleMove);
      resetMotionVars();
    };
  }, []);
}
