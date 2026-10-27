"use client";

import React, { useId } from "react";

interface ZeeMarkProps {
  size?: number;
  className?: string;
}

/**
 * Official ZeeWrites beveled "Z" emblem (deep navy chamfered frame + metallic silver inner Z ribbon).
 * Also includes accessible text "Z" so screen readers and DOM text checks read "Z".
 */
export function ZeeMark({ size = 36, className = "" }: ZeeMarkProps) {
  const gradId = useId();
  const bevelId = useId();

  return (
    <span
      className={`inline-flex items-center justify-center relative select-none font-sans font-semibold text-[32px] text-ink leading-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
        className="w-full h-full block"
      >
        <defs>
          <linearGradient
            id={gradId}
            x1="18"
            y1="18"
            x2="82"
            y2="82"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#939aa4" />
            <stop offset="26%" stopColor="#e6e9ee" />
            <stop offset="48%" stopColor="#ffffff" />
            <stop offset="72%" stopColor="#cfd5dd" />
            <stop offset="100%" stopColor="#858d98" />
          </linearGradient>
          <linearGradient
            id={bevelId}
            x1="18"
            y1="82"
            x2="82"
            y2="18"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#6f7782" />
            <stop offset="50%" stopColor="#b8bfc8" />
            <stop offset="100%" stopColor="#757d88" />
          </linearGradient>
        </defs>

        {/* Outer Deep Navy Chamfered & Serifed Z Frame */}
        <path
          d="M 8 11 L 84 11 L 94 25 L 51 75 L 62 75 L 70 64 L 93 64 L 93 89 L 16 89 L 6 75 L 49 25 L 38 25 L 30 36 L 8 36 Z"
          className="fill-[#0c1d31] dark:fill-[#4a74f0]"
        />

        {/* Recessed Metallic Silver Inner Z Ribbon */}
        <path
          d="M 19 19 L 81 19 L 36 73 L 81 73 L 81 81 L 19 81 L 64 27 L 19 27 Z"
          fill={`url(#${gradId})`}
          stroke={`url(#${bevelId})`}
          strokeWidth="1.4"
          strokeLinejoin="miter"
        />
      </svg>
      <span className="sr-only">Z</span>
    </span>
  );
}

interface ZeeLogoLockupProps {
  subtitle?: string;
  tileSize?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Shared Zee Writes Brand Lockup with solid white logo tile, beveled Z emblem,
 * and "Zee Writes" + "Guides & Fixes" typography.
 */
export function ZeeLogoLockup({
  subtitle = "Guides & Fixes",
  tileSize = "md",
  className = "",
}: ZeeLogoLockupProps) {
  const dimensions =
    tileSize === "sm"
      ? { box: "h-9 w-9 rounded-[10px]", mark: 24 }
      : tileSize === "lg"
      ? { box: "h-12 w-12 rounded-[14px]", mark: 32 }
      : { box: "h-10 w-10 rounded-[12px]", mark: 26 };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className={`${dimensions.box} bg-[#ffffff] border border-hairline shadow-1 flex items-center justify-center shrink-0 ring-1 ring-inset ring-white`}
      >
        <ZeeMark size={dimensions.mark} />
      </div>
      <div className="flex flex-col justify-center text-left">
        <span className="font-sans text-[17px] tracking-[-0.02em] leading-tight text-ink">
          <strong className="font-bold text-[#0c1d31] dark:text-[#f4f7ff]">
            Zee
          </strong>{" "}
          <span className="font-medium text-[#4b5563] dark:text-[#c9d4ec]">
            Writes
          </span>
        </span>
        {subtitle && (
          <span className="text-[13px] font-normal text-muted leading-tight">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
