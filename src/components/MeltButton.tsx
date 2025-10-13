import { useState } from "react";
import { Sparkles } from "lucide-react";
import MeltSheet from "./MeltSheet";

export default function MeltButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Melt controls"
        className="flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-white transition hover:bg-white/15"
      >
        <Sparkles className="h-4 w-4" />
        Melt
      </button>
      <MeltSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
