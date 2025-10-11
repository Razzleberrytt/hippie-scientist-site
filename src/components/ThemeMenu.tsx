import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { applyAccent, applyTheme, getAccent, getTheme, type AccentChoice, type ThemeChoice } from "../lib/theme";

const themeOptions: { value: ThemeChoice; label: string; description: string }[] = [
  { value: "dark", label: "Dark", description: "Deep contrast for night owls" },
  { value: "light", label: "Light", description: "Soft brightness for daytime" },
];

const accentOptions: { value: AccentChoice; label: string }[] = [
  { value: "blue", label: "Blue" },
  { value: "lime", label: "Lime" },
  { value: "pink", label: "Pink" },
];

type Props = {
  triggerClassName?: string;
};

export default function ThemeMenu({ triggerClassName }: Props) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeChoice>("dark");
  const [accent, setAccent] = useState<AccentChoice>("blue");
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setTheme(getTheme());
    setAccent(getAccent());
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointer = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleThemeClick = (value: ThemeChoice) => {
    setTheme(value);
    applyTheme(value);
    setOpen(false);
  };

  const handleAccentClick = (value: AccentChoice) => {
    setAccent(value);
    applyAccent(value);
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        className={clsx(
          "flex items-center justify-center rounded-xl border border-white/10 text-sm font-medium text-white/80",
          "transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0",
          triggerClassName,
        )}
        onClick={() => setOpen(value => !value)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        Theme
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 space-y-4 rounded-2xl border border-white/10 bg-white/10 p-4 text-white/80 shadow-[0_20px_45px_-25px_rgba(0,0,0,0.7)] backdrop-blur-xl"
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-c)" }}>
                Mode
              </p>
              <div className="grid gap-2">
                {themeOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleThemeClick(option.value)}
                    className="w-full rounded-lg border px-3 py-2 text-left text-sm focus-glow"
                    style={{
                      borderColor:
                        theme === option.value
                          ? "color-mix(in oklab, var(--accent), white 25%)"
                          : "color-mix(in oklab, var(--border-c) 85%, transparent 15%)",
                      background:
                        theme === option.value
                          ? "color-mix(in oklab, var(--accent) 18%, var(--surface-c) 82%)"
                          : "color-mix(in oklab, var(--surface-c) 94%, transparent 6%)",
                      color: "var(--text-c)",
                    }}
                  >
                    <span className="font-medium">{option.label}</span>
                    <p className="mt-1 text-xs" style={{ color: "var(--muted-c)" }}>
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-c)" }}>
                Accent
              </p>
              <div className="flex items-center gap-2">
                {accentOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleAccentClick(option.value)}
                    className="h-8 w-8 rounded-full border-2 focus-glow"
                    style={{
                      background:
                        option.value === "blue"
                          ? "linear-gradient(120deg, #1aa8ff, #6ee7ff)"
                          : option.value === "lime"
                            ? "linear-gradient(120deg, #a3f54f, #5ff477)"
                            : "linear-gradient(120deg, #f0a4ff, #ff7dca)",
                      borderColor:
                        accent === option.value
                          ? "color-mix(in oklab, var(--accent), white 25%)"
                          : "color-mix(in oklab, var(--border-c) 70%, transparent 30%)",
                      boxShadow:
                        accent === option.value
                          ? "0 0 0 3px color-mix(in oklab, var(--accent) 40%, transparent)"
                          : undefined,
                    }}
                    aria-label={`Use ${option.label} accent`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
