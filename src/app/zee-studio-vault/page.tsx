import React from "react";
import { Metadata } from "next";
import { StealthStudioVault } from "@/components/admin/StealthStudioVault";

export const metadata: Metadata = {
  title: "Stealth Editorial Studio | Zee Writes",
  description: "Private editorial publishing vault.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function ZeeStudioVaultPage() {
  return <StealthStudioVault />;
}
