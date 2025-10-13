import { type ReactNode, useState } from "react";
import clsx from "clsx";
import MeltSheet from "./MeltSheet";

type MeltButtonProps = {
  className?: string;
  children?: ReactNode;
};

export default function MeltButton({ className, children }: MeltButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Melt controls"
        className={clsx(
          "inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white transition hover:bg-white/10",
          className,
        )}
      >
        {children ?? "✨ Melt"}
      </button>
      <MeltSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
