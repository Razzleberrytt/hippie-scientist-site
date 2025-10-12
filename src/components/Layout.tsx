import { PropsWithChildren, useEffect } from "react";
import MeltBackground from "./MeltBackground";
import { melt } from "@/state/melt";

export default function Layout({ children }: PropsWithChildren) {
  useEffect(() => {
    (window as any).toggleMelt = () => melt.toggle();
    return () => {
      if ((window as any).toggleMelt) {
        delete (window as any).toggleMelt;
      }
    };
  }, []);

  return (
    <div className="site-shell relative min-h-screen w-full overflow-x-hidden">
      <MeltBackground />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
