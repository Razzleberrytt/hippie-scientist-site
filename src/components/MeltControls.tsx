import React, { useEffect, useRef } from "react";

type Option = { id: string; label: string };

type Props = {
  palettes: Option[];
  value: string;
  onChange: (id: string) => void;
  onClose: () => void;
};

export default function MeltControls({ palettes, value, onChange, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onClick);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onClick);
    };
  }, [onClose]);

  return (
    <div className="melt-popover" role="dialog" aria-label="Background palette" ref={ref}>
      <div className="melt-row" role="group" aria-label="Palette">
        {palettes.map((palette) => (
          <button
            key={palette.id}
            className={`chip ${value === palette.id ? "chip--active" : ""}`}
            onClick={() => onChange(palette.id)}
            type="button"
          >
            {palette.label}
          </button>
        ))}
      </div>
    </div>
  );
}
