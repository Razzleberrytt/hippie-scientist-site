import React, { useEffect, useRef, useState } from "react";
import { getConsent, setConsent, getSystemNoTracking } from "../lib/consent";
import { hashLink } from "../lib/routes";

type Props = { open: boolean; onClose: () => void };

type ConsentState = "granted" | "denied" | "unknown";

export default function ConsentManager({ open, onClose }: Props) {
  const [status, setStatus] = useState<ConsentState>("unknown");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const consent = getConsent();
    setStatus(consent ?? "unknown");

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
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
    setConsent("granted");
    setStatus("granted");

    try {
      (await import("../lib/loadAnalytics")).loadAnalytics();
    } catch {}

    onClose();
  }

  function decline() {
    setConsent("denied");
    setStatus("denied");
    onClose();
  }

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-labelledby="consent-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        ref={dialogRef}
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
            aria-label="Close"
            onClick={onClose}
            className="rounded border border-white/10 px-2 py-1 hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <p className="mt-2 text-sm text-white/75">
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
                status === "granted"
                  ? "text-lime-300"
                  : status === "denied"
                  ? "text-rose-300"
                  : "text-white/60"
              }`}
            >
              {status === "granted" ? "Accepted" : status === "denied" ? "Declined" : "Not set"}
            </strong>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={decline}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 hover:bg-white/10"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="rounded-lg border border-lime-300/20 bg-gradient-to-r from-lime-400/30 to-cyan-400/20 px-3 py-1.5 text-sm font-medium text-lime-200 hover:from-lime-400/40 hover:to-cyan-400/30"
          >
            Accept
          </button>
          <a href={hashLink("/privacy")} className="ml-auto underline text-white/70 hover:text-cyan-300">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
