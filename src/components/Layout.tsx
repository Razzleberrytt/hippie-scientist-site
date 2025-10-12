import { PropsWithChildren, useEffect, useState } from "react";
import MeltCanvas from "./MeltCanvas";
import { melt } from "@/state/melt";

export default function Layout({ children }: PropsWithChildren) {
  const [enabled, setEnabled] = useState<boolean>(melt.enabled);

  useEffect(() => {
    const unsubscribe = melt.subscribe(setEnabled);
    (window as any).toggleMelt = () => melt.toggle();
    return () => {
      unsubscribe();
      if ((window as any).toggleMelt) {
        delete (window as any).toggleMelt;
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      <MeltCanvas enabled={enabled} />
      <div className="relative">{children}</div>
    </div>
  );
}
