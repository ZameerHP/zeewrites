import React from "react";
import { Metadata } from "next";
import { StealthStudioVault } from "@/components/admin/StealthStudioVault";
import { isAuthenticatedAdmin } from "@/lib/server-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function ZeeStudioVaultPage() {
  const initialAuth = await isAuthenticatedAdmin();
  return <StealthStudioVault initialAuthenticated={initialAuth} />;
}
