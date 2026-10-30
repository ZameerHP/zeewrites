import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const { settings } = await getDatabase();
  const body =
    settings.adsTxtContent?.trim() ||
    (settings.publisherId
      ? `google.com, ${settings.publisherId.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0`
      : "google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0");

  return new NextResponse(body ? body + "\n" : "", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
