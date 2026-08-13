import React, { useEffect, useRef, useState } from "react";
import { Link } from "../lib/router-compat";
import { getConsent, setConsent, getSystemNoTracking } from "../lib/consent";

type Props = { open: boolean; onClose: () => void };

type ConsentState = "granted" | "denied" | "unknown";

export default function ConsentManager({ open, onClose }: Props) {
  const [status, setStatus] = useState<ConsentState>("unknown");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const consent = getConsent();
    setStatus(consent ?? "unknown");

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]):not([tabindex="-1"]), a[href], [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!dialogRef.current.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && (active === first || active === dialogRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    if (open) {
      window.addEventListener("keydown", onKey);
    }

    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const dnt = typeof window !== "undefined" ? getSystemNoTracking() : false;

  async function accept() {
    const nextStatus = dnt ? "denied" : "granted";
    setConsent(nextStatus);
    setStatus(nextStatus);

    if (!dnt) {
      try {
        (await import("../lib/loadAnalytics")).loadAnalytics();
      } catch {
        // Ignore analytics load failures.
      }
    }

    onClose();
  }

  function decline() {
    setConsent("denied");
    setStatus("denied");
    onClose();
  }

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-description"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        aria-label="Close privacy settings"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div
        className="relative z-10 w-[min(92vw,560px)] rounded-2xl border border-white/10 bg-black/90 p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <h2
            id="consent-title"
            className="bg-gradient-to-r from-lime-300 via-cyan-300 to-pink-400 bg-clip-text text-lg font-semibold text-transparent"
          >
            Privacy settings
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close privacy settings"
            onClick={onClose}
            className="rounded border border-white/10 px-2 py-1 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            ✕
          </button>
        </div>

        <p id="consent-description" className="mt-2 text-sm text-white/75">
          Control whether anonymous analytics are collected. We don’t collect personal data unless you opt in.
          {dnt && (
            <span className="ml-1 text-amber-300">
              Detected Do Not Track / GPC — defaulting to no tracking.
            </span>
          )}
        </p>

        <div className="mt-4 text-sm">
          <div className="text-white/70">
            Current status:
            <strong
              className={`ml-2 ${
                dnt
                  ? "text-amber-300"
                  : status === "granted"
                  ? "text-lime-300"
                  : status === "denied"
                  ? "text-rose-300"
                  : "text-white/60"
              }`}
            >
              {dnt ? "Blocked by DNT/GPC" : status === "granted" ? "Accepted" : status === "denied" ? "Declined" : "Not set"}
            </strong>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={decline}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-lg border border-lime-300/20 bg-gradient-to-r from-lime-400/30 to-cyan-400/20 px-3 py-1.5 text-sm font-medium text-lime-200 hover:from-lime-400/40 hover:to-cyan-400/30"
          >
            {dnt ? "Continue without tracking" : "Accept"}
          </button>
          <Link to="/info/privacy" className="ml-auto underline text-white/70 hover:text-cyan-300">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
