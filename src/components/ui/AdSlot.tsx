"use client";

import React from "react";

interface AdSlotProps {
  id: string;
  format: "leaderboard" | "in-article" | "sidebar-sticky";
  className?: string;
}

export function AdSlot({ id, className = "" }: AdSlotProps) {
  return (
    <div
      data-ad-slot-id={id}
      aria-hidden="true"
      className={`w-full ${className}`}
    />
  );
}
