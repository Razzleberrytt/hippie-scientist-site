import { useLocation } from 'react-router-dom';
import BackgroundStage from './BackgroundStage';
import { useTrippy } from '@/lib/trippy';
import { useMelt } from '@/melt/useMelt';

export default function MeltBackground() {
  const location = useLocation();
  const { level, enabled: trippyEnabled } = useTrippy();
  const { enabled, preset } = useMelt();
  const shouldAnimate = trippyEnabled && level !== 'off' && enabled;

  if (location.pathname === '/') return null;
  if (!shouldAnimate) return null;

  return (
    <div
      id="melt-bg"
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    >
      <BackgroundStage effect={preset} />
    </div>
  );
}
