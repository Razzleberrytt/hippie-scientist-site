import MeltGLCanvas from "./MeltGLCanvas";
import { useTrippy } from "@/lib/trippy";
import { useMelt } from "@/melt/useMelt";

export default function MeltBackground() {
  const { level, enabled: trippyEnabled } = useTrippy();
  const { enabled, palette } = useMelt();
  const shouldAnimate = trippyEnabled && level !== "off" && enabled;

  return (
    <div
      id="melt-bg"
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    >
      <MeltGLCanvas enabled={shouldAnimate} palette={palette} />
    </div>
  );
}
