"use client";

import { useEffect, useState } from "react";

/**
 * Platform-aware keyboard shortcut hook:
 * - Renders fixed-width "Ctrl K" on the server and on Windows/Linux
 * - Switches cleanly after mount to "⌘K" on macOS/iOS devices
 * - Prevents hydration mismatch and layout shift (CLS = 0)
 */
export function usePlatformShortcut() {
  const [shortcutLabel, setShortcutLabel] = useState<string>("Ctrl K");

  useEffect(() => {
    try {
      const platform =
        (navigator as Navigator & { userAgentData?: { platform?: string } })
          .userAgentData?.platform ||
        navigator.platform ||
        navigator.userAgent ||
        "";
      if (/Mac|iPhone|iPad|iPod/i.test(platform)) {
        setShortcutLabel("\u2318K");
      } else {
        setShortcutLabel("Ctrl K");
      }
    } catch {
      setShortcutLabel("Ctrl K");
    }
  }, []);

  return shortcutLabel;
}
