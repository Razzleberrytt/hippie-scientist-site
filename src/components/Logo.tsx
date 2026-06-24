import * as React from "react";

type Props = { size?: number; title?: string; className?: string };

export default function Logo({ size = 22, title = "The Hippie Scientist", className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      className={className}
    >
      <defs>
        <linearGradient id="ths-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(190 90% 60%)" />
          <stop offset="50%" stopColor="hsl(160 90% 60%)" />
          <stop offset="100%" stopColor="hsl(280 90% 65%)" />
        </linearGradient>
      </defs>

      {/* Orb */}
      <circle cx="24" cy="24" r="22" fill="url(#ths-g)" opacity="0.22" />

      {/* Leaf + flask hybrid */}
      <g fill="none" stroke="url(#ths-g)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {/* Flask outline */}
        <path d="M18 8h12m-6 0v10l8 12c2 3-0 8-6 8h-8c-6 0-8-5-6-8l8-12V8" />
        {/* Liquid */}
        <path d="M16 30c2-2 5-2 8 0s6 2 8 0" opacity=".9" />
        {/* Leaf */}
        <path d="M12 18c8 0 12-4 16-10" />
        <path d="M15 15c0 3-2 5-5 6" />
      </g>
    </svg>
  );
}
