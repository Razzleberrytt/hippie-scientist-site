import React from "react";

export default function BackgroundAurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-24 -left-24 h-[40rem] w-[40rem] rounded-full blur-3xl opacity-25 bg-gradient-to-br from-accent-500 to-fuchsia-500 animate-aurora" />
      <div
        className="absolute top-1/3 -right-32 h-[36rem] w-[36rem] rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-indigo-500 to-emerald-500 animate-aurora"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="absolute bottom-0 left-1/4 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-15 bg-gradient-to-tr from-sky-400 to-purple-500 animate-aurora"
        style={{ animationDelay: "-12s" }}
      />
    </div>
  );
}
