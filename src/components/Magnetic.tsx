import { useRef, type ReactNode } from "react";
import clsx from "clsx";

type MagneticProps = {
  children: ReactNode;
  strength?: number;
  className?: string;
};

export default function Magnetic({ children, strength = 16, className = "" }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={clsx("inline-block will-change-transform transition-transform duration-150", className)}
      onPointerMove={(event) => {
        const element = ref.current;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * strength;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * strength;
        element.style.transform = `translate(${x}px, ${y}px)`;
      }}
      onPointerLeave={() => {
        if (ref.current) {
          ref.current.style.transform = "translate(0px, 0px)";
        }
      }}
      onPointerUp={() => {
        if (ref.current) {
          ref.current.style.transform = "translate(0px, 0px)";
        }
      }}
      onPointerCancel={() => {
        if (ref.current) {
          ref.current.style.transform = "translate(0px, 0px)";
        }
      }}
    >
      {children}
    </div>
  );
}
